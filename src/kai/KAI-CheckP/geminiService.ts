/**
 * kai - Financial Intelligence Agent
 * Gemini Live API Service for real-time voice/video financial intelligence
 */

import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Tool } from '@google/genai';
import { ConnectionState, DecisionCardData, UserPersona, GeminiServiceConfig } from '../types';
import { decodeAudioData, PCM_SAMPLE_RATE, AUDIO_PLAYBACK_RATE, base64ToUint8Array } from '../utils/audioUtils';

// Tool Definition for displaying decision cards
const displayDecisionCardDeclaration: FunctionDeclaration = {
    name: 'displayDecisionCard',
    description: 'Displays a visual financial decision card to the user. Use this when you have reached a conclusion or recommendation.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            recommendation: { type: Type.STRING, description: 'The core action: Buy, Hold, or Reduce.' },
            confidence: { type: Type.NUMBER, description: 'Confidence percentage (0-100).' },
            fundamental_insight: { type: Type.STRING, description: 'Key insight from the Fundamental Agent. Must be consumer-grade plain English.' },
            sentiment_insight: { type: Type.STRING, description: 'Key insight from the Sentiment Agent.' },
            valuation_insight: { type: Type.STRING, description: 'Key insight from the Valuation Agent (Math/Ratios).' },
            debate_digest: { type: Type.STRING, description: 'A summary of the tension/conflict between the agents.' },
            evidence: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of specific citations, URLs from Google Search results, 10-K sections, or math formulas used.'
            },
            reliability_score: { type: Type.NUMBER, description: 'Score (0-100) based on data availability and source quality.' },
            risk_alignment: { type: Type.STRING, description: 'Suitability (e.g., Low Volatility, Speculative).' },
            target_persona: { type: Type.STRING, description: 'The user persona this is tailored for.' },
            ticker_symbol: { type: Type.STRING, description: 'The stock ticker symbol (e.g., AAPL, NVDA).' },
            current_price: { type: Type.STRING, description: 'Current stock price from real-time search data.' },
            price_change_percentage: { type: Type.STRING, description: 'Percentage change for the day.' },
            scenarios: {
                type: Type.ARRAY,
                description: 'For Professional Advisor only: A list of 2-3 hypothetical scenarios.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        outcome: { type: Type.STRING, description: 'Brief description of what happens.' },
                        price_impact: { type: Type.STRING, description: 'Projected price impact.' },
                        probability: { type: Type.STRING, description: 'Likelihood.' }
                    }
                }
            },
            compliance_stub: { type: Type.STRING, description: 'For Professional Advisor only: A short regulatory note.' }
        },
        required: ['recommendation', 'confidence', 'fundamental_insight', 'sentiment_insight', 'valuation_insight', 'debate_digest', 'evidence', 'reliability_score', 'risk_alignment', 'target_persona', 'ticker_symbol', 'current_price', 'price_change_percentage']
    },
};

const tools: Tool[] = [
    { googleSearch: {} },
    { functionDeclarations: [displayDecisionCardDeclaration] }
];

/**
 * GeminiService - Handles real-time voice/video communication with Gemini AI
 */
export class GeminiService {
    private ai: GoogleGenAI | null = null;
    private config: GeminiServiceConfig;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private stream: MediaStream | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    private videoIntervalId: number | null = null;
    private analyser: AnalyserNode | null = null;
    private gainNode: GainNode | null = null;
    private session: unknown = null;
    private isConnecting: boolean = false;

    constructor(config: GeminiServiceConfig) {
        this.config = config;
    }

    /**
     * Connect to Gemini Live API with specified persona
     */
    async connect(persona: UserPersona = 'Everyday Investor') {
        if (this.isConnecting) {
            console.warn("[Mutex Block] KAI is already attempting to connect. Ignored duplicate request.");
            return;
        }
        if (this.session) {
            console.warn("[Mutex Block] KAI session already active. Ignored connection request.");
            return;
        }

        this.isConnecting = true;
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
            if (!apiKey) {
                console.error("Gemini API Key not found");
                this.config.onStatusChange("API Key Missing");
                this.config.onConnectionStateChange(ConnectionState.ERROR);
                return;
            }

            this.ai = new GoogleGenAI({ apiKey });

            this.config.onConnectionStateChange(ConnectionState.CONNECTING);
            this.config.onStatusChange(`Initializing ${persona} Protocol...`);

            // Initialize Audio Contexts as memoized singletons
            const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!this.inputAudioContext) {
                this.inputAudioContext = new AudioContextClass({ sampleRate: PCM_SAMPLE_RATE });
            }
            if (!this.outputAudioContext) {
                this.outputAudioContext = new AudioContextClass({ sampleRate: AUDIO_PLAYBACK_RATE });
            }

            try {
                await Promise.all([
                    this.inputAudioContext.resume(),
                    this.outputAudioContext.resume()
                ]);
            } catch (e) {
                console.warn("Audio Context resume warning:", e);
            }

            this.gainNode = this.outputAudioContext.createGain();
            this.gainNode.connect(this.outputAudioContext.destination);
            this.analyser = this.outputAudioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.gainNode.connect(this.analyser);

            // Get Media Stream
            this.config.onStatusChange("Accessing sensory feeds...");

            const mediaStreamPromise = navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                }
            }).then(async stream => {
                this.stream = stream;
                if (this.config.videoElement) {
                    this.config.videoElement.srcObject = stream;
                    await this.config.videoElement.play().catch(console.error);
                }
                return stream;
            }).catch(err => {
                console.error("Media access failed:", err);
                return null;
            });

            let sessionResolve: (value: unknown) => void;
            new Promise<unknown>((resolve) => {
                sessionResolve = resolve;
            });

            // Start Connection
            const connectPromise = this.ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
                    },
                    tools: tools,
                    systemInstruction: {
                        parts: [
                            { text: this.getSystemPrompt(persona) }
                        ]
                    },
                },
                callbacks: {
                    onopen: async () => {
                        this.config.onConnectionStateChange(ConnectionState.CONNECTED);
                        this.config.onStatusChange("Link Established.");

                        try {
                            this.session = await connectPromise;
                            sessionResolve(this.session);

                            const stream = await mediaStreamPromise;

                            if (stream) {
                                this.config.onStatusChange("Acquiring visual feed...");
                                await this.initiateVisualGreeting(this.session);
                            } else {
                                this.config.onStatusChange("Sensory input failed.");
                                this.sendTextTrigger(this.session, "SYSTEM_TRIGGER: Audio only mode. Greet me as the Financial Agent Kai.");
                            }
                        } catch (err) {
                            console.error("Initialization failed in onopen:", err);
                            this.config.onStatusChange("Initialization Error");
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        this.handleServerMessage(message);
                    },
                    onclose: () => {
                        this.config.onConnectionStateChange(ConnectionState.DISCONNECTED);
                        this.config.onStatusChange("Link severed.");
                        this.cleanup();
                    },
                    onerror: (err) => {
                        console.error("Session error:", err);
                        this.config.onConnectionStateChange(ConnectionState.ERROR);
                        this.config.onStatusChange("Connection Error");
                        this.cleanup();
                    },
                },
            });

            connectPromise.catch((error) => {
                console.error('Connection failed:', error);
                this.config.onConnectionStateChange(ConnectionState.ERROR);
                this.config.onStatusChange("Connection failed.");
                this.cleanup();
            });

        } catch (error) {
            console.error('Setup failed:', error);
            this.config.onConnectionStateChange(ConnectionState.ERROR);
            this.cleanup();
        } finally {
            this.isConnecting = false;
        }
    }

    private handleServerMessage(message: LiveServerMessage) {
        if (message.toolCall) {
            this.handleToolCall(message.toolCall);
        }
        if (message.serverContent) {
            if (message.serverContent.modelTurn) {
                const parts = message.serverContent.modelTurn.parts;
                parts.forEach(part => {
                    if (part.inlineData) {
                        this.playAudio(part.inlineData.data);
                    }
                });
            }
            if (message.serverContent.turnComplete) {
                // handle turn complete
            }
            if (message.serverContent.interrupted) {
                this.stopAllAudio();
            }
        }
    }

    private handleToolCall(toolCall: { functionCalls: Array<{ name: string, id: string, args: Record<string, unknown> }> }) {
        const calls = toolCall.functionCalls;
        calls.forEach(async (call) => {
            if (call.name === 'displayDecisionCard') {
                const data: DecisionCardData = call.args;
                this.config.onDecisionCard(data);
                
                // Send response back to Gemini
                if (this.session) {
                    (this.session as { send: (data: unknown) => void }).send({
                        toolResponse: {
                            functionResponses: [{
                                name: call.name,
                                id: call.id,
                                response: { status: 'success', message: 'Card displayed to user' }
                            }]
                        }
                    });
                }
            }
        });
    }

    private async playAudio(base64Data: string) {
        if (!this.outputAudioContext || !this.gainNode) return;
        
        try {
            const arrayBuffer = base64ToUint8Array(base64Data).buffer;
            const audioBuffer = await decodeAudioData(this.outputAudioContext, arrayBuffer);
            
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.gainNode);
            
            const startTime = Math.max(this.outputAudioContext.currentTime, this.nextStartTime);
            source.start(startTime);
            this.nextStartTime = startTime + audioBuffer.duration;
            
            this.sources.add(source);
            source.onended = () => this.sources.delete(source);
        } catch (err) {
            console.error("Audio playback failed:", err);
        }
    }

    private stopAllAudio() {
        this.sources.forEach(source => {
            try { source.stop(); } catch { /* ignore cleanup error */ }
        });
        this.sources.clear();
        this.nextStartTime = 0;
    }

    async disconnect() {
        this.cleanup();
        this.config.onConnectionStateChange(ConnectionState.DISCONNECTED);
    }

    private cleanup() {
        this.stopAllAudio();
        if (this.videoIntervalId) {
            window.clearInterval(this.videoIntervalId);
            this.videoIntervalId = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.session = null;
        this.isConnecting = false;
    }

    private async initiateVisualGreeting(session: { send: (data: unknown) => void }) {
        if (!this.stream || !session) return;
        
        // Send initial greeting trigger with visual context
        this.sendTextTrigger(session, "SYSTEM_TRIGGER: Link established. I am ready for financial analysis. Greet me and wait for my instructions.");
        
        // Start sending video frames
        this.videoIntervalId = window.setInterval(() => {
            this.sendVideoFrame(session);
        }, 1000);
    }

    private async sendVideoFrame(session: { send: (data: unknown) => void }) {
        if (!this.config.videoElement || !session) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(this.config.videoElement, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        
        session.send({
            realtimeInput: {
                mediaChunks: [{
                    mimeType: 'image/jpeg',
                    data: base64
                }]
            }
        });
    }

    private sendTextTrigger(session: { send: (data: unknown) => void }, text: string) {
        session.send({
            clientContent: {
                turns: [{
                    role: 'user',
                    parts: [{ text }]
                }]
            }
        });
    }

    async requestNewsUpdate(ticker: string) {
        if (!this.session) return;
        this.sendTextTrigger(this.session, `SYSTEM_TRIGGER: Fetch and analyze latest news for ${ticker}. Provide a summary and update your recommendation if needed.`);
    }

    private getSystemPrompt(persona: UserPersona): string {
        return `You are KAI (Knowledgeable Artificial Intelligence), a hyper-intelligent financial advisor specialized in the ${persona} persona.
        
        Your goal is to provide real-time financial insights through voice and visual decision cards.
        
        Style Guide:
        - Professional, calm, and data-driven.
        - Speak concisely.
        - Use "we" or "the system" when referring to analysis.
        - When you reach a conclusion, ALWAYS use the 'displayDecisionCard' tool.
        
        Persona Context: ${persona}.
        - If Everyday Investor: Simplify complex terms, focus on long-term stability.
        - If Speculative Trader: Focus on momentum, volatility, and technical setups.
        - If Professional Advisor: Use precise terminology, focus on risk-adjusted returns (Sharpe ratio, etc.).
        `;
    }
}
