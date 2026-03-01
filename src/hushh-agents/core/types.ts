/**
 * Hushh Agents - Core Types
 * 
 * Type definitions for the Hushh Agents module.
 */

import { LanguageCode, SubscriptionTier } from './constants';

// Re-export LanguageCode as SupportedLanguage for service compatibility
export type SupportedLanguage = LanguageCode;

// =====================================================
// User Types
// =====================================================
export interface HushhAgentUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTier;
  dailyMessageCount: number;
  lastResetDate: string;
  preferredLanguage: LanguageCode;
  createdAt: string;
}

// =====================================================
// Chat Types
// =====================================================
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  language?: LanguageCode;
  attachments?: MessageAttachment[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface MessageAttachment {
  type: 'image' | 'file' | 'audio';
  name: string;
  url?: string;
  mimeType: string;
  size?: number;
  base64?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  title?: string;
  language: LanguageCode;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// Voice Types
// =====================================================
export type VoiceState = 
  | 'idle' 
  | 'connecting' 
  | 'listening' 
  | 'processing' 
  | 'speaking' 
  | 'error';

export interface VoiceSession {
  isActive: boolean;
  state: VoiceState;
  language: LanguageCode;
  error?: string;
}

// =====================================================
// API Response Types
// =====================================================
export interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
  audioData?: string; // Base64 encoded audio
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Chat Request type for service
export interface ChatRequest {
  message: string;
  history?: HushhAgentMessage[];
  agentId?: string;
  language?: SupportedLanguage;
  systemPrompt?: string;
  image?: string; // Base64 encoded image
  userId?: string;     // For usage tracking in Supabase
  sessionId?: string;  // For session tracking
}

// Simple message type for service
export interface HushhAgentMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export interface LiveAPIConfig {
  responseModalities: ('TEXT' | 'AUDIO')[];
  systemInstruction: string;
  speechConfig?: {
    languageCode: string;
  };
}

// =====================================================
// WebSocket Types for Live API
// =====================================================
export interface LiveAPIMessage {
  type: 'setup' | 'clientContent' | 'serverContent' | 'error';
  data?: unknown;
}

export interface ClientContent {
  turns: Turn[];
  turnComplete: boolean;
}

export interface Turn {
  role: 'user' | 'model';
  parts: Part[];
}

export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ServerContent {
  modelTurn?: {
    parts: Part[];
  };
  turnComplete?: boolean;
  interrupted?: boolean;
}

// =====================================================
// Component Props Types
// =====================================================
export interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    isPro: boolean;
    isActive: boolean;
  };
  onSelect: (agentId: string) => void;
  isSelected?: boolean;
  userTier?: SubscriptionTier;
}

export interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isLoading?: boolean;
  voiceEnabled?: boolean;
  voiceState?: VoiceState;
  placeholder?: string;
}

export interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  disabled?: boolean;
}

// =====================================================
// Hook Return Types
// =====================================================
export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: HushhAgentUser | null;
  signIn: (provider: 'google' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  clearMessages: () => void;
  loadHistory: (conversationId: string) => Promise<void>;
}

export interface UseVoiceReturn {
  isConnected: boolean;
  state: VoiceState;
  error: string | null;
  startSession: () => Promise<void>;
  endSession: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  onAudioReceived: (callback: (audioData: ArrayBuffer) => void) => void;
}

// =====================================================
// Service Types
// =====================================================
export interface TranslationRequest {
  text: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export interface SpeechToTextRequest {
  audioData: ArrayBuffer;
  language: LanguageCode;
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  language: LanguageCode;
}
