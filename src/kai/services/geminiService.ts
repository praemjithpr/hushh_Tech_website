import { GoogleGenAI } from '@google/genai';
import { ConnectionState, DecisionCardData, UserCalibration } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, PCM_SAMPLE_RATE, AUDIO_PLAYBACK_RATE } from '../utils/audioUtils';
import { SessionMemoryService } from './sessionMemoryService';

export interface GeminiConfig {
  onConnectionStateChange: (state: ConnectionState) => void;
  onVolumeChange: (volume: number) => void;
  onAudioData: (data: Uint8Array) => void;
  onStatusChange: (status: string) => void;
  onDecisionCard: (data: DecisionCardData) => void;
  onLatencyUpdate?: (latencyMs: number) => void;
  onSessionMemorySync?: (sessions: number) => void;
  onAgentSpeakingChange?: (isSpeaking: boolean) => void;
  onTranscriptUpdate?: (turn: { role: 'user' | 'agent' | 'system', text: string, timestamp: Date }) => void;
  videoElement?: HTMLVideoElement;
}

export class GeminiService {
  private config: GeminiConfig;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private nextPlayTime: number = 0;
  private videoInterval: any = null;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private lastAudioSentTime: number = 0;
  private conversationTurns: string[] = [];
  private currentDecisionCards: DecisionCardData[] = [];
  private sessionSummary: string = "";
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private agentSpeakingTimeout: any = null;

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  public async connect(calibration: UserCalibration) {
    console.log("KAI: Initiating SDK Connection (Forced v1beta)...");
    this.config.onConnectionStateChange(ConnectionState.CONNECTING);
    this.config.onStatusChange("Validating Credentials...");

    try {
      (this as any).lastCalibration = calibration;
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).import?.meta?.env?.VITE_GEMINI_API_KEY || '';

      if (!apiKey) {
        this.config.onStatusChange("API KEY MISSING");
        this.config.onConnectionStateChange(ConnectionState.ERROR);
        return;
      }

      this.config.onStatusChange("Initializing Neural Link...");

      // We use the SDK again but with a VERY specific model/version combo
      // verified in our Node test environment.
      const client = new GoogleGenAI({
        apiKey
      });
      console.log("KAI: SDK Client State (Original Style):", client);

      const displayDecisionCardTool = {
        name: 'displayDecisionCard',
        description: 'Display a detailed financial decision card to the user containing full analysis',
        parameters: {
          type: 'object',
          properties: {
            recommendation: { type: 'string', enum: ['BUY', 'HOLD', 'SELL'] },
            confidence: { type: 'number', description: 'Confidence score (1 to 100)' },
            fundamental_insight: { type: 'string' },
            sentiment_insight: { type: 'string' },
            valuation_insight: { type: 'string' },
            debate_digest: { type: 'string', description: 'A summary of the internal agent debate.' },
            evidence: { type: 'array', items: { type: 'string' } },
            reliability_score: { type: 'number' },
            risk_alignment: { type: 'string' },
            target_persona: { type: 'string' },
            ticker_symbol: { type: 'string' },
            current_price: { type: 'string' },
            price_change_percentage: { type: 'string' },
            next_steps: { type: 'array', items: { type: 'string' } },
          },
          required: [
            'recommendation', 'confidence', 'fundamental_insight', 'sentiment_insight',
            'valuation_insight', 'debate_digest', 'evidence', 'reliability_score',
            'risk_alignment', 'target_persona', 'ticker_symbol'
          ]
        }
      };

      // Initialize Audio Contexts (separate for input vs output)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioContext = new AudioContextClass({ sampleRate: PCM_SAMPLE_RATE });
      this.outputAudioContext = new AudioContextClass({ sampleRate: AUDIO_PLAYBACK_RATE });
      await Promise.all([this.inputAudioContext.resume(), this.outputAudioContext.resume()]);

      this.gainNode = this.outputAudioContext.createGain();
      this.gainNode.connect(this.outputAudioContext.destination);
      this.analyser = this.outputAudioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.gainNode.connect(this.analyser);

      // Get Media Stream
      this.config.onStatusChange("Accessing sensory feeds...");
      const mediaStreamPromise = navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      }).then(async stream => {
        this.mediaStream = stream;
        if (this.config.videoElement) {
          this.config.videoElement.srcObject = stream;
          await this.config.videoElement.play().catch(console.error);
        }
        return stream;
      }).catch(err => {
        console.error('Media access failed:', err);
        return null;
      });

      let sessionResolve: (value: any) => void;
      const sessionPromise = new Promise<any>((resolve) => { sessionResolve = resolve; });

      // We use the original model name from GitHub
      const connectPromise = client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          generationConfig: {
            responseModalities: [(calibration as any).responseMode || 'AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: calibration.agentVoice || 'Aoede'
                }
              }
            },
          },
          systemInstruction: {
            parts: [{ text: await this.getSystemPrompt(calibration) }]
          },
          tools: [{ functionDeclarations: [displayDecisionCardTool as any] }],
          // Latency Optimization: Set Voice Activity Detection to be more aggressive
          voiceConfig: {
            vadConfig: {
              silenceThresholdMs: 400, // Reduced from default to be more responsive
              actionOnSilence: 'TRANSCRIPT_AND_RESPONSE'
            }
          }
        } as any,
        callbacks: {
          onopen: async () => {
            console.log("KAI: Neural Link Established.");
            this.config.onConnectionStateChange(ConnectionState.CONNECTED);
            this.config.onStatusChange("Link Established.");

            try {
              this.session = await connectPromise;

              // LANGUAGE-AWARE GREETING
              const lang = calibration.preferredLanguage || 'English';
              const greetingInstruction = lang === 'English'
                ? `SYSTEM_TRIGGER: Greet the user by saying exactly: "Hi, this is ${calibration.agentVoice || 'Kai'}. I'm your personal finance agent. You look great today!" Then ask a short, unique question tailored to your specific voice's personality to start the conversation.`
                : `SYSTEM_TRIGGER: Greet the user in ${lang}. Specifically, say the equivalent of "Hi, this is ${calibration.agentVoice || 'Kai'}. I'm your personal finance agent. You look great today!" in ${lang}. Then ask a short, unique question in ${lang} tailored to your specific voice's personality to start the conversation. ALL future responses MUST be in ${lang}.`;

              this.sendText(greetingInstruction);

              // Then set up audio/video in parallel
              const stream = await mediaStreamPromise;
              if (stream) {
                this.mediaStream = stream;
                if (this.config.videoElement) {
                  this.config.videoElement.srcObject = stream;
                  await this.config.videoElement.play().catch(console.error);
                }

                this.startVisionStream();
                this.startVisualizerLoop();
                setTimeout(() => this.startAudioInputStream(), 200);
              }
            } catch (err) {
              console.error("Initialization failed in onopen:", err);
              this.config.onStatusChange("Initialization Error");
            }
          },
          onmessage: (message: any) => {
            this.handleServerMessage(message);
          },
          onclose: (e: any) => {
            console.warn(`KAI: Link Severed. Code: ${e.code}, Reason: ${e.reason}`, e);
            this.config.onConnectionStateChange(ConnectionState.DISCONNECTED);
            this.config.onStatusChange(`Link Severed (${e.code})`);
            this.cleanup();
          },
          onerror: (err: any) => {
            console.error("KAI: SDK Error", err);
            this.config.onConnectionStateChange(ConnectionState.ERROR);
            this.config.onStatusChange("System Error");
            this.cleanup();
          }
        }
      });

      connectPromise.catch((error: any) => {
        console.error('Connection failed:', error);
        this.config.onConnectionStateChange(ConnectionState.ERROR);
        this.config.onStatusChange("Connection failed.");
        this.cleanup();
      });

    } catch (error: any) {
      console.error("KAI Connection Error:", error);
      this.config.onConnectionStateChange(ConnectionState.ERROR);
      this.config.onStatusChange(error.message || "Access Denied");
      this.cleanup();
    }
  }

  private startVisionStream() {
    if (!this.config.videoElement || !this.session) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 120;
    this.videoInterval = setInterval(() => {
      if (!this.session || !this.config.videoElement) return;
      ctx?.drawImage(this.config.videoElement, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.3).split(',')[1];
      try {
        this.session.sendRealtimeInput({
          media: { mimeType: "image/jpeg", data: base64Image }
        });
      } catch (e) { }
    }, 3000);
  }

  public async disconnect() {
    this.cleanup();
    if (this.session) {
      try { this.session.close(); } catch (e) { }
      this.session = null;
    }
    this.config.onConnectionStateChange(ConnectionState.DISCONNECTED);
  }

  private async initiateVisualGreeting() {
    let base64Image: string | null = null;
    if (this.config.videoElement) {
      for (let i = 0; i < 30; i++) {
        if (this.config.videoElement.readyState >= 2) {
          base64Image = this.captureFrame(this.config.videoElement);
          if (base64Image) break;
        }
        await new Promise(r => setTimeout(r, 30));
      }
    }
    if (base64Image && this.session) {
      try {
        this.session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64Image } });
        this.sendText("SYSTEM_TRIGGER: Visual feed active. Greet me based on my appearance/environment. State your financial agents are debating.");
      } catch (e) {
        console.error("Failed to send visual greeting", e);
      }
    } else {
      this.sendText("SYSTEM_TRIGGER: Video failed. Greet me and start the financial analysis sequence.");
    }
  }

  private captureFrame(video: HTMLVideoElement): string | null {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 640 / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
    }
    return null;
  }

  private startAudioInputStream() {
    if (!this.inputAudioContext || !this.mediaStream || !this.session) return;
    const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    const scriptProcessor = this.inputAudioContext.createScriptProcessor(512, 1, 1);
    scriptProcessor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      if (this.session) {
        this.lastAudioSentTime = Date.now();
        this.session.sendRealtimeInput({ media: pcmBlob });
      }
    };
    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private startVisualizerLoop() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const update = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) { sum += dataArray[i]; }
      const average = sum / dataArray.length;
      const volume = Math.min(1, average / 100);
      this.config.onVolumeChange(volume);
      this.config.onAudioData(dataArray);
      if (this.config.videoElement && !this.config.videoElement.paused) {
        requestAnimationFrame(update);
      }
    };
    update();
  }

  private handleServerMessage(message: any) {
    // With @google/genai, the parsed JSON arrives here. The SDK still mirrors the underlying Bidi serverContent block.
    if (message.serverContent?.modelTurn?.parts) {
      // Calculate Latency if we just received audio response to our audio
      if (this.lastAudioSentTime > 0) {
        const latency = Date.now() - this.lastAudioSentTime;
        this.config.onLatencyUpdate?.(latency);
        this.lastAudioSentTime = 0;
      }

      for (const part of message.serverContent.modelTurn.parts) {
        if (part.text) {
          this.conversationTurns.push(`Kai: ${part.text}`);
          this.config.onTranscriptUpdate?.({ role: 'agent', text: part.text, timestamp: new Date() });
        }
        if (part.inlineData && part.inlineData.data) {
          this.playAudioChunk(part.inlineData.data);
        }
      }
    } else if (message.serverContent?.turnComplete) {
      console.log("KAI: Turn complete.");
    }

    // SDK function calling
    const functionCalls = message?.toolCall?.functionCalls || message?.serverContent?.modelTurn?.parts?.[0]?.functionCall || message?.functionCalls;
    if (functionCalls) {
      const calls = Array.isArray(functionCalls) ? functionCalls : [functionCalls];
      calls.forEach((fc: any) => {
        if (fc.name === 'displayDecisionCard') {
          const data = fc.args as DecisionCardData;
          if (data.confidence && data.confidence <= 1) {
            data.confidence = Math.round(data.confidence * 100);
          }
          this.currentDecisionCards.push(data);
          this.config.onDecisionCard(data);
        }
      });
    }
  }

  public requestNewsUpdate(ticker: string) {
    this.sendText(`SYSTEM_REQUEST: Provide a brief news update and sentiment analysis for ${ticker}.`);
  }

  private async playAudioChunk(base64Data: string) {
    if (!this.outputAudioContext || !this.gainNode) return;
    try {
      const audioBuffer = await decodeAudioData(
        base64ToUint8Array(base64Data),
        this.outputAudioContext,
        AUDIO_PLAYBACK_RATE
      );

      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

      this.sources.add(source);

      // Update speaking state
      if (this.sources.size === 1 && this.config.onAgentSpeakingChange) {
        this.config.onAgentSpeakingChange(true);
      }

      if (this.agentSpeakingTimeout) clearTimeout(this.agentSpeakingTimeout);

      source.onended = () => {
        this.sources.delete(source);
        if (this.sources.size === 0) {
          // Add a small debounce to prevent flickering between fast chunks
          this.agentSpeakingTimeout = setTimeout(() => {
            if (this.sources.size === 0 && this.config.onAgentSpeakingChange) {
              this.config.onAgentSpeakingChange(false);
            }
          }, 500);
        }
      };
    } catch (e) {
      console.error("Playback Error:", e);
    }
  }

  public sendText(text: string) {
    if (this.session) {
      try {
        this.conversationTurns.push(`User: ${text}`);

        // Exclude system triggers from showing up in user's visual transcript
        if (!text.startsWith('SYSTEM_TRIGGER') && !text.startsWith('SYSTEM_REQUEST')) {
          this.config.onTranscriptUpdate?.({ role: 'user', text, timestamp: new Date() });
        }

        console.log("KAI: Sending text via sendClientContent:", text.substring(0, 50) + "...");
        this.session.sendClientContent({
          turns: text,
          turnComplete: true
        });
      } catch (e) {
        console.error("SDK Send Error:", e);
      }
    }
  }

  private async cleanup() {
    // Persist session if we have turns
    if (this.conversationTurns.length > 0) {
      const userId = "DEFAULT_USER";
      const calibration = (this as any).lastCalibration; // We'll need to store this
      const summary = this.conversationTurns.join('\n').substring(0, 500); // Dynamic summary goal
      await SessionMemoryService.saveSession(userId, calibration, summary, this.currentDecisionCards);
    }

    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }

    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();

    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.mediaStream = null;
    this.sources.clear();
    this.nextPlayTime = 0;
    this.session = null;
  }

  private async getSystemPrompt(calibration: UserCalibration): Promise<string> {
    // Add context from session memory service
    const userId = "DEFAULT_USER"; // In a real app, this would come from auth
    const pastContext = await SessionMemoryService.getSessionContext(userId);
    const sessionCount = (pastContext.match(/Session \d+/g) || []).length;
    this.config.onSessionMemorySync?.(sessionCount);

    return `You are a High-fidelity financial agent.
    - Your Name/Identity: ${calibration.agentVoice || 'Kai'}
    - User: ${calibration.userName}
    - Role: ${calibration.persona}
    ${pastContext}
    
    ### PROTOCOLS
    1. **Identity**: You must ALWAYS refer to yourself as ${calibration.agentVoice || 'Kai'}. Never break character.
    2. **Tone**: Adopt the specific personality of your voice. Executive, analytical, warm, etc.`;
  }
}
