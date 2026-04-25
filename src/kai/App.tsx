import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConnectionState, DecisionCardData, AgentSentiment, UserCalibration } from './types';
import { GeminiService } from './services/geminiService';
import KaiAvatar from './components/KaiAvatar';
import ControlPanel from './components/ControlPanel';
import DecisionCard from './components/DecisionCard';
import OnboardingScreen from './components/OnboardingScreen';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import SessionTimer from './components/SessionTimer';
import ConnectionIndicator from './components/ConnectionIndicator';
import { soundService } from './services/soundService';
import VoiceSelectorModal, { ResponseMode } from './components/VoiceSelectorModal';
import LandingPage from './components/LandingPage';

const KaiAppInner: React.FC = () => {
  const { isDark } = useTheme();
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [statusText, setStatusText] = useState<string>("");
  const [decisionData, setDecisionData] = useState<DecisionCardData | null>(null);
  const [userCalibration, setUserCalibration] = useState<UserCalibration | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<ResponseMode>('AUDIO');
  const [currentVoice, setCurrentVoice] = useState<string>('Aoede');
  const [currentLanguage, setCurrentLanguage] = useState<string>('English');
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // High-performance refs to avoid re-renders on every audio pulse
  const volumeRef = useRef(0);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(0));
  const [volumePulse, setVolumePulse] = useState(0); // Lower-frequency state for UI elements that NEED it

  const isConnected = connectionState === ConnectionState.CONNECTED;

  const getSentiment = (): AgentSentiment => {
    if (connectionState !== ConnectionState.CONNECTED) return AgentSentiment.NEUTRAL;
    if (!decisionData) return AgentSentiment.THINKING;

    const rec = decisionData.recommendation.toLowerCase();
    if (rec.includes('buy') || rec.includes('strong buy')) return AgentSentiment.BULLISH;
    if (rec.includes('sell') || rec.includes('reduce')) return AgentSentiment.BEARISH;
    return AgentSentiment.NEUTRAL;
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const geminiServiceRef = useRef<GeminiService | null>(null);

  // Throttled volume update for non-critical UI components
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setVolumePulse(volumeRef.current);
    }, 100); // 10Hz is enough for UI glows
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (videoRef.current) {
      geminiServiceRef.current = new GeminiService({
        onConnectionStateChange: setConnectionState,
        onVolumeChange: (v) => { volumeRef.current = v; },
        onAudioData: (data) => { audioDataRef.current = data; },
        onStatusChange: setStatusText,
        onDecisionCard: (data) => {
          soundService.play('report');
          setDecisionData(data);
        },
        onLatencyUpdate: (ms) => { setLatencyMs(ms); },
        onAgentSpeakingChange: (isSpeaking) => { setIsAgentSpeaking(isSpeaking); },
        videoElement: videoRef.current,
      });
    }
    return () => {
      geminiServiceRef.current?.disconnect();
    };
  }, []);

  const handleStartAgent = async (calib: UserCalibration) => {
    try {
      soundService.play('start');

      const voiceToUse = calib.agentVoice || currentVoice;
      if (calib.agentVoice && calib.agentVoice !== currentVoice) {
        setCurrentVoice(calib.agentVoice);
      }

      if (calib.preferredLanguage && calib.preferredLanguage !== currentLanguage) {
        setCurrentLanguage(calib.preferredLanguage);
      }

      const enrichedCalib = {
        ...calib,
        agentVoice: voiceToUse,
        responseMode: currentMode,
        preferredLanguage: calib.preferredLanguage || currentLanguage
      };
      setUserCalibration(enrichedCalib);
      setDecisionData(null);
      setLatencyMs(0);
      await geminiServiceRef.current?.connect(enrichedCalib);
    } catch (err) {
      console.error("KAI FATAL:", err);
      setStatusText("System initialization failed.");
    }
  };

  const performReconnect = async (voice: string, mode: ResponseMode, lang: string) => {
    setCurrentVoice(voice);
    setCurrentMode(mode);
    setCurrentLanguage(lang);
    if (isConnected && userCalibration) {
      await handleDisconnect();
      setTimeout(() => handleStartAgent({ ...userCalibration, agentVoice: voice, responseMode: mode, preferredLanguage: lang }), 1200);
    }
  };

  const handleDisconnect = async () => {
    soundService.play('stop');
    await geminiServiceRef.current?.disconnect();
    volumeRef.current = 0;
    audioDataRef.current = new Uint8Array(0);
    setVolumePulse(0);
    setLatencyMs(0);
    setStatusText("Sync terminated.");
    setTimeout(() => setStatusText(""), 2000);
  };

  const handleBackToOnboarding = async () => {
    await handleDisconnect();
    setUserCalibration(null);
    setDecisionData(null);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col items-center justify-center transition-colors duration-700 ${isDark ? 'bg-black' : 'bg-slate-50'}`}>

      {/* 1. LAYER: PERFORMANCE NEBULA (No blur, high efficiency) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: isDark
              ? `radial-gradient(circle at 50% 50%, #4c1d95 0%, transparent 60%)`
              : `radial-gradient(circle at 50% 50%, #e0e7ff 0%, transparent 60%)`,
          }}
        />
        {isConnected && (
          <motion.div
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 5, repeat: Infinity }}
            className={isDark ? 'absolute inset-0 bg-indigo-900/10' : 'absolute inset-0 bg-indigo-200/20'}
          />
        )}
      </div>

      {/* 2. TOP HUD BAR */}
      <div className="absolute top-4 left-0 right-0 z-50 px-6 grid grid-cols-3 items-center">
        {/* Left: Connection Indicator */}
        <div className="flex justify-start">
          {isConnected && <ConnectionIndicator latencyMs={latencyMs} />}
        </div>

        {/* Center: Session Timer */}
        <div className="flex justify-center">
          <SessionTimer isActive={isConnected} />
        </div>

        {/* Right: Settings + Theme Toggle */}
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-lg backdrop-blur-sm"
            title="Communication Interface"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* 3. VIDEO FEED + MIC GLOW (top-right) */}
      <div className="absolute top-16 right-4 z-30">
        <video
          ref={videoRef}
          className="w-32 h-24 object-cover rounded-2xl opacity-90 transition-shadow duration-75"
          style={{
            border: 'none',
            outline: (isConnected && !isAgentSpeaking && volumePulse > 0.02)
              ? `4px solid #00ffcc`
              : '1px solid rgba(255,255,255,0.2)',
            outlineOffset: '2px',
            boxShadow: (isConnected && !isAgentSpeaking && volumePulse > 0.02)
              ? `0 0 ${15 + volumePulse * 40}px #00ffcc, inset 0 0 10px #00ffcc`
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          muted
          playsInline
        />
      </div>

      {/* 4. NAVIGATION: BACK */}
      {userCalibration && !decisionData && (
        <button
          onClick={handleBackToOnboarding}
          className={`absolute top-20 left-10 z-50 px-6 py-2 rounded-full transition-all flex items-center gap-2 ${isDark
            ? 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
            : 'bg-black/5 border border-black/10 text-black/40 hover:text-black'
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[10px] font-bold tracking-widest uppercase">Setup</span>
        </button>
      )}

      {/* 5. LANDING & ONBOARDING OVERLAY */}
      {!userCalibration && showLanding && (
        <LandingPage onLaunch={() => setShowLanding(false)} />
      )}
      {!userCalibration && !showLanding && (
        <OnboardingScreen onSelect={handleStartAgent} />
      )}

      {/* 6. THE IMMERSIVE AGENT VISUALIZER (High Performance Loop) */}
      <div
        className={`
          relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center transition-all duration-1000
          ${!userCalibration ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
        `}
        style={{ opacity: decisionData ? 0.3 : (userCalibration ? 1 : 0) }}>
        <KaiAvatar
          volumeRef={volumeRef}
          audioDataRef={audioDataRef}
          active={isConnected}
          sentiment={getSentiment()}
        />
      </div>

      {/* 7. DECISION CARDS */}
      {decisionData && (
        <DecisionCard
          data={decisionData}
          onClose={() => setDecisionData(null)}
          onRequestNews={(ticker) => geminiServiceRef.current?.requestNewsUpdate(ticker)}
          onAskQuery={(text: string) => geminiServiceRef.current?.sendText(text)}
        />
      )}

      {/* 8. DYNAMIC ISLAND CONTROLS */}
      {userCalibration && (
        <div className={`
          absolute bottom-8 transition-all duration-1000 z-[60]
          ${decisionData
            ? 'right-10 translate-x-0 opacity-100 scale-90'
            : 'left-1/2 -translate-x-1/2 opacity-100 translate-y-0 scale-100'}
        `}>
          <ControlPanel
            state={connectionState}
            statusText={statusText}
            onConnect={() => handleStartAgent(userCalibration)}
            onDisconnect={handleDisconnect}
            volume={volumePulse}
            currentVoice={currentVoice}
          />
        </div>
      )}

      {/* 9. VOICE & MODALITY SELECTOR MODAL */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        currentMode={currentMode}
        currentVoice={currentVoice}
        currentLanguage={currentLanguage}
        onClose={() => setIsVoiceModalOpen(false)}
        onModeSelect={(mode) => performReconnect(currentVoice, mode, currentLanguage)}
        onVoiceSelect={(voice) => performReconnect(voice, currentMode, currentLanguage)}
        onLanguageSelect={(lang) => performReconnect(currentVoice, currentMode, lang)}
      />
    </div>
  );
};

const KaiApp: React.FC = () => {
  return (
    <ThemeProvider>
      <KaiAppInner />
    </ThemeProvider>
  );
};

export default KaiApp;
