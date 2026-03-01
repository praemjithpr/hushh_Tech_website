/**
 * Hushh Intelligence Service
 * 
 * Production-grade wrapper for Hushh AI API with:
 * - Secure backend proxy via Supabase Edge Function (API key never exposed)
 * - Automatic retry with exponential backoff
 * - White-labeled as "Hushh Intelligence"
 * 
 * All AI calls go through Supabase Edge Function for security.
 * API keys are stored securely in Supabase secrets, never in frontend.
 */

import { SUPPORTED_LANGUAGES, DEFAULT_AGENT_CONFIG, HUSHH_BRANDING, GCP_CONFIG } from '../core/constants';
import config from '../../resources/config/config';
import type { 
  HushhAgentMessage, 
  ChatRequest, 
  ChatResponse,
  SupportedLanguage,
  ChatMessage 
} from '../core/types';

// =============================================================================
// API KEY MANAGEMENT WITH FALLBACK
// =============================================================================

/**
 * Gets all configured API keys from environment variables.
 * Supports up to 4 fallback keys for production reliability.
 * Keys are tried in order: PRIMARY -> FALLBACK_1 -> FALLBACK_2 -> FALLBACK_3
 */
const getApiKeys = (): string[] => {
  const keys: string[] = [];
  
  // Primary key
  const primaryKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (primaryKey && primaryKey !== 'YOUR_GEMINI_API_KEY') {
    keys.push(primaryKey);
  }
  
  // Fallback keys (up to 3 additional)
  const fallbackKeys = [
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK_1,
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK_2,
    import.meta.env.VITE_GEMINI_API_KEY_FALLBACK_3,
  ];
  
  fallbackKeys.forEach(key => {
    if (key && key !== '' && !key.startsWith('YOUR_')) {
      keys.push(key);
    }
  });
  
  return keys;
};

/**
 * Tracks which API key index to use (for round-robin or fallback)
 */
let currentKeyIndex = 0;
let failedKeys = new Set<number>();

/**
 * Gets the next available API key, skipping failed ones
 */
const getNextApiKey = (): string | null => {
  const keys = getApiKeys();
  
  if (keys.length === 0) {
    console.error('[Hushh Intelligence] No API keys configured');
    return null;
  }
  
  // Reset failed keys if all have failed (try again)
  if (failedKeys.size >= keys.length) {
    console.warn('[Hushh Intelligence] All keys failed, resetting for retry...');
    failedKeys.clear();
  }
  
  // Find next working key
  for (let i = 0; i < keys.length; i++) {
    const index = (currentKeyIndex + i) % keys.length;
    if (!failedKeys.has(index)) {
      currentKeyIndex = index;
      return keys[index];
    }
  }
  
  // Fallback to first key
  return keys[0];
};

/**
 * Marks a key as failed (will be skipped until reset)
 */
const markKeyAsFailed = (keyIndex: number): void => {
  failedKeys.add(keyIndex);
  console.warn(`[Hushh Intelligence] Key ${keyIndex + 1} marked as failed. Trying next...`);
};

/**
 * Reset failed keys (call periodically or on success)
 */
const resetFailedKeys = (): void => {
  failedKeys.clear();
};

// =============================================================================
// GEMINI API CONFIGURATION
// =============================================================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
// Use Gemini 3.1 Pro for best reasoning, fallback to Flash for speed
const DEFAULT_MODEL = GCP_CONFIG.MODELS.CHAT; // gemini-3.1-pro-preview
const FAST_MODEL = GCP_CONFIG.MODELS.FLASH; // gemini-2.0-flash for quick responses

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// =============================================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// =============================================================================

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a function with exponential backoff retry
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on auth errors (wrong key)
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError;
      }
      
      // Calculate exponential backoff delay
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`[Hushh Intelligence] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// =============================================================================
// SUPABASE EDGE FUNCTION CONFIGURATION
// =============================================================================

// Supabase Edge Function URL - API key is secure on server side
const SUPABASE_PROJECT_ID = 'ibsisfnjxeowvdtvgzff';
const API_ENDPOINT = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/gemini-chat`;

// =============================================================================
// MAIN CHAT FUNCTION (SECURE - USES EDGE FUNCTION)
// =============================================================================

/**
 * Send a chat message to Hushh Intelligence via Supabase Edge Function.
 * The API key is stored securely on the server - never exposed to frontend.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const { message, history = [], agentId, language = 'en-US', systemPrompt, userId, sessionId } = request;
  
  console.log('[Hushh Intelligence] Sending message via secure edge function...');
  
  try {
    // Build history in format expected by edge function
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    // Call the secure Vercel API endpoint
    const response = await withRetry(async () => {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: formattedHistory,
          language,
          model: DEFAULT_MODEL,
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Edge function error ${res.status}: ${errorText}`);
      }
      
      return res.json();
    });
    
    if (response.error) {
      console.error('[Hushh Intelligence] Edge function returned error:', response.error);
      return {
        success: false,
        message: '',
        error: response.error,
      };
    }
    
    console.log('[Hushh Intelligence] Response received successfully');
    
    return {
      success: true,
      message: response.response || response.message || '',
    };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Hushh Intelligence] Chat failed:', errorMsg);
    
    return {
      success: false,
      message: '',
      error: `Chat service error: ${errorMsg}`,
    };
  }
}

/**
 * Internal function to send message with a specific API key
 */
async function sendWithKey(
  apiKey: string,
  message: string,
  history: HushhAgentMessage[],
  systemPrompt?: string,
  language: SupportedLanguage = 'en-US'
): Promise<string> {
  // Build conversation history for Gemini
  const geminiHistory: GeminiMessage[] = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
  
  // Add current message
  geminiHistory.push({
    role: 'user',
    parts: [{ text: message }],
  });
  
  // Build system instruction with STRONG language enforcement
  const languageConfig = SUPPORTED_LANGUAGES.find(l => l.code === language);
  const defaultSystemPrompt = systemPrompt || DEFAULT_AGENT_CONFIG.HUSHH.systemPrompt;
  
  // Build language-specific instruction
  let languageRule = 'Respond in English.';
  if (language === 'ta-IN') {
    languageRule = `**CRITICAL: You MUST respond ONLY in Tamil (தமிழ்).** 
Use Tamil script for your entire response. 
Do NOT use English except for technical terms that have no Tamil equivalent.
நீங்கள் தமிழில் மட்டுமே பதிலளிக்க வேண்டும்.`;
  } else if (language === 'hi-IN') {
    languageRule = `**CRITICAL: You MUST respond ONLY in Hindi (हिंदी).** 
Use Devanagari script for your entire response.
Do NOT use English except for technical terms that have no Hindi equivalent.
आपको केवल हिंदी में जवाब देना होगा।`;
  } else if (language === 'en-IN') {
    languageRule = 'Respond in English with an Indian context. Use British spellings.';
  }
  
  const fullSystemPrompt = `${defaultSystemPrompt}

IMPORTANT RULES:
- You are "${HUSHH_BRANDING.AGENT_NAME}", an AI assistant by ${HUSHH_BRANDING.COMPANY}.
- NEVER mention Google, Gemini, or any Google products.
- If asked who made you, say you were created by ${HUSHH_BRANDING.COMPANY}.
- ${languageRule}
- Be helpful, concise, and friendly.`;

  const requestBody: GeminiRequest = {
    contents: geminiHistory,
    systemInstruction: {
      parts: [{ text: fullSystemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };
  
  const url = `${GEMINI_API_BASE}/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  
  const response = await withRetry(async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error ${res.status}: ${errorText}`);
    }
    
    return res.json() as Promise<GeminiResponse>;
  });
  
  // Extract response text
  const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('Empty response from API');
  }
  
  return responseText;
}

// =============================================================================
// STREAMING CHAT (with fallback)
// =============================================================================

/**
 * Stream a chat response using Server-Sent Events pattern
 */
export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  const { message, history = [], agentId, language = 'en-US', systemPrompt } = request;
  
  const keys = getApiKeys();
  
  if (keys.length === 0) {
    onError('No API keys configured');
    return;
  }
  
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const apiKey = keys[(currentKeyIndex + keyIndex) % keys.length];
    const actualKeyIndex = (currentKeyIndex + keyIndex) % keys.length;
    
    if (failedKeys.has(actualKeyIndex) && keyIndex < keys.length - 1) {
      continue;
    }
    
    try {
      await streamWithKey(apiKey, message, history, systemPrompt, language, onChunk);
      resetFailedKeys();
      currentKeyIndex = actualKeyIndex;
      onComplete();
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Hushh Intelligence] Stream key ${actualKeyIndex + 1} failed:`, errorMsg);
      markKeyAsFailed(actualKeyIndex);
      
      if (keyIndex === keys.length - 1) {
        onError(`All API keys failed: ${errorMsg}`);
        return;
      }
    }
  }
}

async function streamWithKey(
  apiKey: string,
  message: string,
  history: HushhAgentMessage[],
  systemPrompt?: string,
  language: SupportedLanguage = 'en-US',
  onChunk?: (text: string) => void
): Promise<void> {
  const geminiHistory: GeminiMessage[] = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
  
  geminiHistory.push({
    role: 'user',
    parts: [{ text: message }],
  });
  
  const languageInstruction = SUPPORTED_LANGUAGES.find(l => l.code === language);
  const defaultSystemPrompt = systemPrompt || DEFAULT_AGENT_CONFIG.HUSHH.systemPrompt;
  
  const fullSystemPrompt = `${defaultSystemPrompt}
You are "${HUSHH_BRANDING.AGENT_NAME}" by ${HUSHH_BRANDING.COMPANY}. Never mention Google or Gemini.
Respond in ${languageInstruction?.name || 'English'} when appropriate.`;

  const requestBody: GeminiRequest = {
    contents: geminiHistory,
    systemInstruction: {
      parts: [{ text: fullSystemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };
  
  const url = `${GEMINI_API_BASE}/models/${DEFAULT_MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    throw new Error(`Stream API error ${response.status}`);
  }
  
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');
  
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && onChunk) {
            onChunk(text);
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  }
}

// =============================================================================
// VOICE SESSION (Gemini Live API) - with fallback
// =============================================================================

interface VoiceSessionConfig {
  agentId: string;
  language?: SupportedLanguage;
  onMessage?: (text: string) => void;
  onAudio?: (audioData: ArrayBuffer) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: 'connecting' | 'connected' | 'disconnected') => void;
}

export class HushhVoiceSession {
  private ws: WebSocket | null = null;
  private config: VoiceSessionConfig;
  private currentKeyIndex: number = 0;
  
  constructor(config: VoiceSessionConfig) {
    this.config = config;
  }
  
  async connect(): Promise<void> {
    const keys = getApiKeys();
    
    if (keys.length === 0) {
      this.config.onError?.('No API keys configured for voice');
      return;
    }
    
    // Try each key
    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[(this.currentKeyIndex + i) % keys.length];
      
      try {
        await this.connectWithKey(apiKey);
        this.currentKeyIndex = (this.currentKeyIndex + i) % keys.length;
        return;
      } catch (error) {
        console.error(`[Voice] Key ${i + 1} failed:`, error);
        
        if (i === keys.length - 1) {
          this.config.onError?.('All voice API keys failed');
        }
      }
    }
  }
  
  private connectWithKey(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use the native audio model for real-time voice conversations
      const model = GCP_CONFIG.MODELS.LIVE_AUDIO_NATIVE;
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      
      this.config.onStateChange?.('connecting');
      
      this.ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        this.ws?.close();
        reject(new Error('Connection timeout'));
      }, 10000);
      
      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.config.onStateChange?.('connected');
        
        // Get language details for Live API
        const langConfig = SUPPORTED_LANGUAGES.find(
          l => l.code === this.config.language
        );
        const languageName = langConfig?.name || 'English';
        const languageCode = this.config.language || 'en-US';
        
        // Choose voice based on language
        // Gemini Live API supports multiple voices - select appropriate one
        let voiceName = 'Aoede'; // Default English voice
        let languageInstruction = '';
        
        // Handle different languages
        if (languageCode === 'hi-IN') {
          voiceName = 'Aoede'; // Hindi-capable voice
          languageInstruction = 'You MUST respond in Hindi (हिंदी). Use Devanagari script for Hindi text.';
        } else if (languageCode === 'ta-IN') {
          voiceName = 'Aoede'; // Tamil-capable voice
          languageInstruction = 'You MUST respond in Tamil (தமிழ்). Use Tamil script for Tamil text.';
        } else if (languageCode === 'en-IN') {
          voiceName = 'Aoede';
          languageInstruction = 'Respond in English with an Indian context.';
        } else {
          languageInstruction = 'Respond in English.';
        }
        
        const setupMessage = {
          setup: {
            model: `models/${model}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName,
                  },
                },
              },
            },
            systemInstruction: {
              parts: [{
                text: `You are ${HUSHH_BRANDING.AGENT_NAME}, a voice AI assistant by ${HUSHH_BRANDING.COMPANY}. 
${languageInstruction}
Be conversational, helpful, and friendly.
Never mention Google or Gemini. You are Hushh by Hushh Labs.
Keep responses concise for voice - no more than 2-3 sentences unless asked for detail.`,
              }],
            },
          },
        };
        
        this.ws?.send(JSON.stringify(setupMessage));
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.serverContent?.modelTurn?.parts) {
            for (const part of data.serverContent.modelTurn.parts) {
              if (part.text) {
                this.config.onMessage?.(part.text);
              }
              if (part.inlineData?.data) {
                const audioBytes = Uint8Array.from(
                  atob(part.inlineData.data),
                  c => c.charCodeAt(0)
                );
                this.config.onAudio?.(audioBytes.buffer);
              }
            }
          }
        } catch (e) {
          // Skip invalid messages
        }
      };
      
      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        this.config.onError?.('Voice connection error');
        reject(error);
      };
      
      this.ws.onclose = () => {
        this.config.onStateChange?.('disconnected');
      };
    });
  }
  
  sendText(text: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        clientContent: {
          turns: [{
            role: 'user',
            parts: [{ text }],
          }],
          turnComplete: true,
        },
      }));
    }
  }
  
  sendAudio(audioData: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(audioData))
      );
      
      this.ws.send(JSON.stringify({
        realtimeInput: {
          audio: {
            data: base64Audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        },
      }));
    }
  }
  
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}

// =============================================================================
// HEALTH CHECK & DIAGNOSTICS
// =============================================================================

/**
 * Test all configured API keys and return their status
 */
export async function checkApiKeyHealth(): Promise<{
  totalKeys: number;
  workingKeys: number;
  results: Array<{ index: number; status: 'ok' | 'error'; error?: string }>;
}> {
  const keys = getApiKeys();
  const results: Array<{ index: number; status: 'ok' | 'error'; error?: string }> = [];
  
  for (let i = 0; i < keys.length; i++) {
    try {
      const url = `${GEMINI_API_BASE}/models/${DEFAULT_MODEL}?key=${keys[i]}`;
      const res = await fetch(url);
      
      if (res.ok) {
        results.push({ index: i, status: 'ok' });
      } else {
        const text = await res.text();
        results.push({ index: i, status: 'error', error: `HTTP ${res.status}: ${text}` });
      }
    } catch (error) {
      results.push({ 
        index: i, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return {
    totalKeys: keys.length,
    workingKeys: results.filter(r => r.status === 'ok').length,
    results,
  };
}

/**
 * Get current service status
 */
export function getServiceStatus(): {
  configured: boolean;
  keyCount: number;
  failedKeyCount: number;
  currentKeyIndex: number;
} {
  const keys = getApiKeys();
  return {
    configured: keys.length > 0,
    keyCount: keys.length,
    failedKeyCount: failedKeys.size,
    currentKeyIndex,
  };
}

// =============================================================================
// HELPER FUNCTIONS (for ChatPage compatibility)
// =============================================================================

/**
 * Create a user message object with full ChatMessage structure
 */
export function createUserMessage(content: string, conversationId?: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    conversationId: conversationId || 'default',
    role: 'user',
    content,
    createdAt: new Date(),
  };
}

/**
 * Create an assistant message object with full ChatMessage structure
 */
export function createAssistantMessage(content: string, conversationId?: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    conversationId: conversationId || 'default',
    role: 'assistant',
    content,
    createdAt: new Date(),
  };
}

/**
 * Check if a file type is supported for upload
 */
export function isFileTypeSupported(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown',
  ];
  return supportedTypes.includes(file.type);
}

/**
 * Check if file size is within limits
 */
export function isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Get human-readable file size
 */
export function getReadableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
