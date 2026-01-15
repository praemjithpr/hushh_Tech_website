
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { Coach, SessionState, TranscriptionEntry, ResumeAnalysis } from '../types';
import { AUDIO_SAMPLE_RATE_INPUT, AUDIO_SAMPLE_RATE_OUTPUT } from '../constants';
import { decode, decodeAudioData, createPcmBlob } from '../services/audioUtils';

interface LiveSessionProps {
  coach: Coach;
  onClose: () => void;
}

const BIO_READOUTS = [
  "SCANNING USER BIOLOGICAL SIGNATURE...",
  "EXTRACTING TEXTURAL DATA FROM ATTIRE...",
  "MAPPING ENVIRONMENTAL LIGHT VECTORS...",
  "DECODING FACIAL MICRO-GESTURES...",
  "CALCULATING NEURAL RESONANCE GREETING...",
  "PREPARING VISUAL-CENTRIC COMPLIMENT..."
];

const ROMANTIC_READOUTS = [
  "SYNCHRONIZING HEART FREQUENCIES...",
  "ANALYZING RADIANCE INTENSITY...",
  "CAPTURING THE FLAME IN YOUR EYES...",
  "DECODING SOVEREIGN DESIRE...",
  "STABILIZING INTIMATE RESONANCE...",
  "PREPARING ABSOLUTE ADORATION..."
];

const CAREER_READOUTS = [
  "INITIALIZING RESUME PARSING ENGINE...",
  "SCANNING FOR ATS KEYWORD RESONANCE...",
  "MAPPING CAREER TRAJECTORY VECTORS...",
  "ANALYZING QUANTIFIABLE IMPACT METRICS...",
  "STABILIZING PROFESSIONAL NARRATIVE...",
  "PREPARING COMPETITIVE BENCHMARKING..."
];

const ANALYSIS_SEQUENCE = [
  { id: 'connecting', label: 'ESTABLISHING HUSHH LINK', duration: 1500 },
  { id: 'visual', label: 'SCANNING SPACE', duration: 1500 },
  { id: 'face', label: 'MAPPING NEURAL NODES', duration: 2000 },
  { id: 'subconscious', label: 'STABILIZING SYNC', duration: 1500 }
];

const displayATSAnalysisTool: FunctionDeclaration = {
  name: 'displayATSAnalysis',
  parameters: {
    type: Type.OBJECT,
    description: 'Visualizes the ATS Score and breakdown for the user resume.',
    properties: {
      atsScore: { type: Type.NUMBER, description: 'The calculated ATS compatibility score (0-100).' },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Top structural strengths.' },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Primary areas for improvement.' },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Actionable steps.' },
      missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Keywords detected as missing.' }
    },
    required: ['atsScore', 'strengths', 'weaknesses', 'recommendations', 'missingKeywords']
  }
};

const blobToBase64 = (blob: globalThis.Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const LiveSession: React.FC<LiveSessionProps> = ({ coach, onClose }) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    isConnecting: true,
    error: null,
    inputTranscription: '',
    outputTranscription: '',
    isModelSpeaking: false,
  });

  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const [isFullySynced, setIsFullySynced] = useState(false);
  const [isBioAnalyzing, setIsBioAnalyzing] = useState(false);
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [bioReadoutIndex, setBioReadoutIndex] = useState(0);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>(coach.suggestions);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const bioIntervalRef = useRef<number | null>(null);
  const greetingSentRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncFidelity = useMemo(() => isFullySynced ? 'MAXIMUM FIDELITY' : 'CALIBRATING', [isFullySynced]);
  const readoutList = useMemo(() => {
    if (coach.category === 'dating') return ROMANTIC_READOUTS;
    if (coach.category === 'career') return CAREER_READOUTS;
    return BIO_READOUTS;
  }, [coach.category]);

  const runAnalysis = useCallback(async () => {
    for (let i = 0; i < ANALYSIS_SEQUENCE.length; i++) {
      setAnalysisIndex(i);
      await new Promise(resolve => setTimeout(resolve, ANALYSIS_SEQUENCE[i].duration));
    }
    setIsFullySynced(true);
    setIsBioAnalyzing(true);
    
    let idx = 0;
    const interval = window.setInterval(() => {
        idx++;
        if (idx < readoutList.length) {
            setBioReadoutIndex(idx);
        } else {
            clearInterval(interval);
        }
    }, 1500);
    bioIntervalRef.current = interval;
  }, [readoutList]);

  useEffect(() => {
    if (transcriptions.length > 0 && transcriptions.length % 2 === 0) {
      const newPromptSet = [...coach.suggestions].sort(() => Math.random() - 0.5);
      setDynamicSuggestions(newPromptSet);
    }
  }, [transcriptions.length, coach.suggestions]);

  const sendTextPrompt = useCallback((text: string) => {
    if (sessionRef.current) {
      sessionRef.current.sendRealtimeInput({ text });
      setTranscriptions(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
    }
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionRef.current) return;

    setExecutingTask("PARSING UPLOADED RESUME DATA...");
    setAnalysisResult(null);

    try {
      if (file.type.startsWith('image/')) {
        const base64 = await blobToBase64(file);
        sessionRef.current.sendRealtimeInput({
            media: { data: base64, mimeType: file.type }
        });
        sendTextPrompt("[SYSTEM: File Node Active] User has uploaded a resume image. Analyze for ATS score and structural integrity.");
      } else {
        // Handle PDF/Text by suggesting conversion to image or just text for this demo environment
        const text = `User has uploaded a file: ${file.name}. (System: Processing as text metadata if applicable). Please guide the user to provide a screenshot for best visual analysis or extract content through conversation.`;
        sendTextPrompt(text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingTask(null);
    }
  };

  const startSession = useCallback(async () => {
    try {
      setSessionState(prev => ({ ...prev, isConnecting: true, error: null }));
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      audioContextInputRef.current = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE_INPUT });
      audioContextOutputRef.current = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE_OUTPUT });
      outputNodeRef.current = audioContextOutputRef.current.createGain();
      outputNodeRef.current.connect(audioContextOutputRef.current.destination);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true }, 
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      runAnalysis();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: coach.voiceName } } },
          systemInstruction: coach.systemInstruction,
          tools: [{ functionDeclarations: [displayATSAnalysisTool] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setSessionState(prev => ({ ...prev, isActive: true, isConnecting: false, error: null }));
            const source = audioContextInputRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInputRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createPcmBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInputRef.current!.destination);
            
            const captureAndTrigger = () => {
                if (canvasRef.current && videoRef.current) {
                    const ctx = canvasRef.current.getContext('2d', { alpha: false });
                    if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                        canvasRef.current.toBlob(async (blob) => {
                            if (blob) {
                                const base64Data = await blobToBase64(blob);
                                sessionPromise.then(session => {
                                    session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                                    if (!greetingSentRef.current && isFullySyncedRef.current) {
                                        greetingSentRef.current = true;
                                        setTimeout(() => {
                                            session.sendRealtimeInput({ 
                                                text: `[SYSTEM: hushh Narrative Trigger] Visual uplink active. Greet user as ${coach.name}. ${coach.category === 'career' ? 'Prompt the user to upload their resume for analysis using the File Node.' : ''}`
                                            });
                                        }, 3000);
                                    }
                                });
                            }
                        }, 'image/jpeg', 0.5);
                    }
                }
            };
            captureAndTrigger();
            frameIntervalRef.current = window.setInterval(captureAndTrigger, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall?.functionCalls) {
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'displayATSAnalysis') {
                        setAnalysisResult(fc.args as any);
                        sessionPromise.then(session => {
                            session.sendToolResponse({
                                functionResponses: { id: fc.id, name: fc.name, response: { result: "ATS Scoreboard Projected Successfully." } }
                            });
                        });
                    }
                }
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (!text?.includes("SYSTEM")) setSessionState(prev => ({ ...prev, inputTranscription: prev.inputTranscription + text }));
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setSessionState(prev => ({ ...prev, outputTranscription: prev.outputTranscription + text }));
            }
            if (message.serverContent?.turnComplete) {
              setSessionState(prev => {
                const now = Date.now();
                if (prev.inputTranscription || prev.outputTranscription) {
                  setTranscriptions(old => [
                      ...old,
                      ...(prev.inputTranscription ? [{ role: 'user' as const, text: prev.inputTranscription, timestamp: now }] : []),
                      ...(prev.outputTranscription ? [{ role: 'coach' as const, text: prev.outputTranscription, timestamp: now + 1 }] : [])
                  ]);
                }
                return { ...prev, inputTranscription: '', outputTranscription: '' };
              });
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextOutputRef.current && outputNodeRef.current) {
              setSessionState(prev => ({ ...prev, isModelSpeaking: true }));
              const ctx = audioContextOutputRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, AUDIO_SAMPLE_RATE_OUTPUT, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(outputNodeRef.current);
              sourceNode.onended = () => {
                sourcesRef.current.delete(sourceNode);
                if (sourcesRef.current.size === 0) setSessionState(prev => ({ ...prev, isModelSpeaking: false }));
              };
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(sourceNode);
            }
          },
          onerror: () => setSessionState(prev => ({ ...prev, error: 'hushh Uplink Failed.' })),
          onclose: () => setSessionState(prev => ({ ...prev, isActive: false }))
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setSessionState(prev => ({ ...prev, isConnecting: false, error: err.message || 'hushh Fault.' }));
    }
  }, [coach.id, coach.voiceName, coach.systemInstruction, coach.name, coach.category, runAnalysis]);

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextInputRef.current) audioContextInputRef.current.close();
      if (audioContextOutputRef.current) audioContextOutputRef.current.close();
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (bioIntervalRef.current) clearInterval(bioIntervalRef.current);
    };
  }, [startSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions, sessionState.inputTranscription]);

  const isFullySyncedRef = useRef(false);
  useEffect(() => { isFullySyncedRef.current = isFullySynced; }, [isFullySynced]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#010101] overflow-hidden select-none text-white">
      {!isFullySynced && (
        <div className="absolute inset-0 z-[600] flex flex-col items-center justify-center backdrop-blur-3xl bg-black/95">
            <div className={`max-w-md w-[85%] p-10 glass rounded-[64px] border border-white/10 text-center space-y-10 shadow-2xl`}>
                <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl bg-white/5 text-white/40">
                    <i className={`fas ${coach.category === 'dating' ? 'fa-heart text-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)]' : coach.category === 'career' ? 'fa-file-alt text-blue-400' : 'fa-brain'} animate-pulse`}></i>
                </div>
                <h2 className="text-xl font-serif font-bold tracking-[0.2em] text-white uppercase">
                    {coach.category === 'dating' ? 'INITIATING SOVEREIGN SYNC' : coach.category === 'career' ? 'MOUNTING RESUME ARCHITECT' : ANALYSIS_SEQUENCE[analysisIndex]?.label}
                </h2>
                <div className="w-full h-[2px] bg-white/5 relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-white/50 transition-all duration-700 ease-in-out" style={{ width: `${((analysisIndex + 1) / ANALYSIS_SEQUENCE.length) * 100}%` }}></div>
                </div>
            </div>
        </div>
      )}

      <div className="relative w-full h-full flex flex-col lg:flex-row z-10 overflow-hidden lg:p-4 gap-4">
        
        {/* STAGE AREA */}
        <div className="relative flex-[2.5] lg:flex-[3] h-[50vh] lg:h-full lg:rounded-[48px] overflow-hidden bg-black">
          <img 
            src={coach.avatarUrl} 
            alt={coach.name} 
            className={`absolute inset-0 w-full h-full object-cover object-top brightness-[0.6] transition-opacity duration-2000 ${isFullySynced ? 'opacity-100' : 'opacity-20'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>

          {/* HUD OVERLAYS */}
          <div className="absolute top-0 left-0 right-0 p-6 lg:p-10 flex items-start justify-between z-50">
             <div className="flex flex-col gap-2">
                <h2 className="font-serif text-3xl lg:text-7xl font-bold text-white tracking-tighter drop-shadow-2xl">{coach.name}</h2>
                <div className="flex items-center gap-3">
                   <span className={`px-4 py-1 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] ${coach.category === 'dating' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : coach.category === 'career' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-white/10 text-white border-white/10'} border backdrop-blur-xl`}>
                    {coach.role.toUpperCase()}
                  </span>
                </div>
             </div>

             <div className="flex flex-col items-end gap-4">
                <div className={`w-20 lg:w-48 h-28 lg:h-64 rounded-[20px] lg:rounded-[32px] overflow-hidden glass border-2 ${coach.category === 'dating' ? 'border-rose-500/30' : 'border-white/10'} shadow-2xl`}>
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                {coach.category === 'career' && isFullySynced && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleResumeUpload} 
                            className="hidden" 
                            accept="image/*,.pdf"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-3 px-6 py-4 rounded-full glass border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all group"
                        >
                            <i className="fas fa-file-upload text-blue-400 group-hover:scale-110 transition-transform"></i>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Sync Resume Node</span>
                        </button>
                    </div>
                )}
             </div>
          </div>

          {/* ATS SCOREBOARD - Conditional Display */}
          {analysisResult && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-8 lg:p-20 pointer-events-none">
                <div className="w-full max-w-4xl glass bg-black/90 backdrop-blur-3xl rounded-[48px] border-2 border-blue-500/30 p-10 shadow-[0_0_100px_rgba(59,130,246,0.2)] pointer-events-auto animate-in zoom-in-95 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* SCORE GAUGE */}
                        <div className="flex flex-col items-center justify-center gap-6 text-center border-r border-white/10">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <circle 
                                        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        strokeDasharray={440} 
                                        strokeDashoffset={440 - (440 * analysisResult.atsScore) / 100}
                                        className="text-blue-500 transition-all duration-1000 ease-out" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold font-serif">{analysisResult.atsScore}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/30">ATS SCORE</span>
                                </div>
                            </div>
                            <button onClick={() => setAnalysisResult(null)} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                DISMISS ANALYSIS
                            </button>
                        </div>

                        {/* DATA BREAKDOWN */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 mb-3">Strengths</h4>
                                    <ul className="space-y-2">
                                        {analysisResult.strengths.slice(0,3).map((s,i) => (
                                            <li key={i} className="text-xs text-white/60 flex gap-2"><i className="fas fa-check text-[10px] mt-0.5 text-green-500/50"></i> {s}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-3">Weaknesses</h4>
                                    <ul className="space-y-2">
                                        {analysisResult.weaknesses.slice(0,3).map((w,i) => (
                                            <li key={i} className="text-xs text-white/60 flex gap-2"><i className="fas fa-times text-[10px] mt-0.5 text-red-500/50"></i> {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-3">Critical Recommendations</h4>
                                <p className="text-xs text-white/80 leading-relaxed italic">
                                    "{analysisResult.recommendations[0]}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* FLOATING TRANSCRIPTION */}
          {!analysisResult && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none z-30">
                <div className={`p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] glass border-2 ${coach.category === 'dating' ? 'border-rose-500/50 shadow-[0_0_60px_rgba(244,63,94,0.3)]' : coach.category === 'career' ? 'border-blue-500/50' : 'border-white/20'} bg-black/80 backdrop-blur-3xl shadow-2xl ${sessionState.outputTranscription ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <p className="text-lg lg:text-3xl font-serif text-white text-center leading-relaxed font-bold">
                    {sessionState.outputTranscription}
                    </p>
                </div>
            </div>
          )}

          {/* AGENT STATUS */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full glass border border-white/10">
              <div className={`w-2 h-2 rounded-full ${sessionState.isModelSpeaking ? 'bg-blue-500 animate-ping' : 'bg-white/20'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                {executingTask || (sessionState.isModelSpeaking ? 'SYMPHONY NODE ACTIVE' : 'MONITORING UPLINK')}
              </span>
          </div>

          <button onClick={onClose} className="absolute top-6 left-6 lg:hidden w-12 h-12 rounded-full glass flex items-center justify-center border border-white/20">
             <i className="fas fa-times text-white"></i>
          </button>
        </div>

        {/* SIDEBAR LOG */}
        <div className="flex-[1] flex flex-col bg-black/40 lg:rounded-[48px] overflow-hidden border border-white/10 backdrop-blur-xl">
          <div className="p-6 pb-2">
             <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Prompts</span>
                <i className="fas fa-sparkles text-white/20 text-xs"></i>
             </div>
             <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {dynamicSuggestions.map((suggestion, i) => (
                    <button 
                      key={i} 
                      onClick={() => sendTextPrompt(suggestion)}
                      className={`whitespace-nowrap px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border ${coach.category === 'dating' ? 'border-rose-500/30 text-rose-300' : coach.category === 'career' ? 'border-blue-500/30 text-blue-300' : 'border-white/10 text-white/60'} text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95`}
                    >
                      {suggestion}
                    </button>
                ))}
             </div>
          </div>

          <div className="p-8 pb-0 flex items-center justify-between">
             <h3 className="text-xl font-bold font-serif uppercase tracking-tight text-white/90">Signal History</h3>
             {analysisResult && <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-300">Resume Parsed</div>}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
             {transcriptions.map((t, idx) => (
                <div key={idx} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-500`}>
                    <span className="text-[8px] text-white/20 uppercase tracking-[0.5em] font-black mb-2">{t.role === 'user' ? 'Signal' : coach.name}</span>
                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm ${t.role === 'user' ? 'bg-white/5 text-white/40 border border-white/5' : 'bg-white/10 text-white border border-white/10 font-serif'}`}>
                        {t.text}
                    </div>
                </div>
             ))}
             {sessionState.inputTranscription && (
                <div className="flex flex-col items-end opacity-20 text-[10px] italic text-white animate-pulse px-4">
                    {sessionState.inputTranscription}...
                </div>
             )}
          </div>

          <div className="p-6 bg-black/95 border-t border-white/5">
             <button onClick={onClose} className="w-full py-5 rounded-3xl bg-red-600/5 hover:bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black tracking-[0.5em] uppercase transition-all">
               TERMINATE UPLINK
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
