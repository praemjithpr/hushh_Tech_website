/**
 * kai - Financial Intelligence Agent
 * Gemini Live API Service for real-time voice/video financial intelligence
 */

import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Tool } from '@google/genai';
import { ConnectionState, DecisionCardData, UserPersona, GeminiServiceConfig } from '../types';
import { createPcmBlob, decodeAudioData, PCM_SAMPLE_RATE, AUDIO_PLAYBACK_RATE, base64ToUint8Array } from '../utils/audioUtils';

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
    private session: any = null;

    constructor(config: GeminiServiceConfig) {
        this.config = config;
    }

    /**
     * Connect to Gemini Live API with specified persona
     */
    async connect(persona: UserPersona = 'Everyday Investor') {
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

            // Initialize Audio Contexts
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.inputAudioContext = new AudioContextClass({ sampleRate: PCM_SAMPLE_RATE });
            this.outputAudioContext = new AudioContextClass({ sampleRate: AUDIO_PLAYBACK_RATE });

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

            let sessionResolve: (value: any) => void;
            const sessionPromise = new Promise<any>((resolve) => {
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
        }
    }

    /**
     * More methods were likely in the original file...
     */
}
