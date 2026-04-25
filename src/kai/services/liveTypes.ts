/**
 * kai - Financial Intelligence Agent
 * liveTypes.ts - Gemini Multimodal Live API Interfaces (Debug-Verbosity)
 */

export interface LiveConfig {
    model: string;
    generationConfig?: {
        responseModalities?: string[];
        speechConfig?: {
            voiceConfig?: {
                prebuiltVoiceConfig?: {
                    voiceName?: string;
                };
            };
        };
    };
    systemInstruction?: {
        parts: { text: string }[];
    };
}

export interface LiveServerMessage {
    serverContent?: {
        modelTurn?: {
            parts: {
                text?: string;
                inlineData?: {
                    mimeType: string;
                    data: string;
                };
            }[];
        };
    };
    toolCall?: {
        functionCalls?: {
            name: string;
            args: any;
            id: string;
        }[];
    };
    setupComplete?: {};
    error?: {
        code: number;
        message: string;
        status: string;
    };
}

export interface LiveSession {
    send: (msg: any) => void;
    close: () => void;
}

export interface LiveCallbacks {
    url: string;
    config: LiveConfig;
    callbacks: {
        onopen: () => void;
        onmessage: (msg: LiveServerMessage) => void;
        onclose: (event: any) => void;
        onerror: (err: any) => void;
    };
}

export class LiveConnection {
    private static ws: WebSocket | null = null;

    static connect(_apiKey: string, _config: LiveConfig): Promise<LiveSession> {
        return new Promise((resolve) => {
            const session: LiveSession = {
                send: (msg: any) => {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify(msg));
                    }
                },
                close: () => {
                    this.ws?.close();
                }
            };
            resolve(session);
        });
    }

    static setupCallbacks(params: LiveCallbacks) {
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
        }

        try {
            const ws = new WebSocket(params.url);
            this.ws = ws;

            ws.onopen = () => {
                const setupMessage = {
                    setup: {
                        model: params.config.model,
                        generationConfig: params.config.generationConfig,
                        systemInstruction: params.config.systemInstruction
                    }
                };
                console.log("KAI SENDING SETUP:", JSON.stringify(setupMessage, null, 2));
                ws.send(JSON.stringify(setupMessage));
                params.callbacks.onopen();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.error) {
                        console.error("KAI API ERROR:", data.error);
                    }
                    params.callbacks.onmessage(data);
                } catch (e) {
                    console.error("KAI: Socket Parse Error", e);
                }
            };

            ws.onclose = (e) => {
                console.warn("KAI: WebSocket Closed", e.code, e.reason);
                params.callbacks.onclose(e);
            };
            ws.onerror = (e) => params.callbacks.onerror(e);
        } catch (err) {
            params.callbacks.onerror(err);
        }
    }
}
