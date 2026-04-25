/**
 * kai - Financial Intelligence Agent
 * ControlPanel - Dynamic Island (Apple Intelligence Style)
 */

import React from 'react';
import { ConnectionState } from '../types';
import { getAvatarUrl } from './VoiceSelectorModal';

interface ControlPanelProps {
  state: ConnectionState;
  statusText: string;
  onConnect: () => void;
  onDisconnect: () => void;
  volume: number;
  currentVoice?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, statusText, onConnect, onDisconnect, volume, currentVoice }) => {
  const isConnected = state === ConnectionState.CONNECTED;
  const isConnecting = state === ConnectionState.CONNECTING;

  const displayText = statusText || (
    state === ConnectionState.DISCONNECTED ? 'KAI STANDBY' :
      state === ConnectionState.ERROR ? 'SYNC MALFUNCTION' : 'SYSTEM READY'
  );

  return (
    <div className="flex flex-col items-center gap-6 group">

      {/* 1. STATUS LINE - Elegant Floating Text */}
      <div className="h-4 flex items-center justify-center">
        <div className={`
          text-[10px] md:text-[11px] font-mono tracking-[0.5em] uppercase transition-all duration-1000
          ${isConnected ? 'text-purple-300 opacity-60' : 'text-white/20'}
        `}>
          {displayText}
        </div>
      </div>

      {/* 2. DYNAMIC ISLAND PILL */}
      <div className={`
        relative flex items-center gap-6 px-3 py-3 rounded-full 
        bg-white/[0.04] border border-white/10 backdrop-blur-xl
        transition-all duration-700 ease-out shadow-2xl
        ${isConnected ? 'w-auto px-8' : 'w-auto px-10'}
      `}>

        {/* Character Avatar or Status Orb */}
        {currentVoice ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800/80 shadow-inner flex-shrink-0 border border-white/10" style={{ transform: isConnected ? `scale(${1 + volume * 0.4})` : 'scale(1)' }}>
            <img src={getAvatarUrl(currentVoice)} className="w-full h-full object-cover scale-110" alt="Avatar" />
            {isConnected && (
              <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-pulse pointer-events-none" />
            )}
          </div>
        ) : (
          <div className={`
            w-2 h-2 rounded-full transition-all duration-500 shadow-lg
            ${isConnected ? 'bg-purple-500 animate-pulse shadow-purple-500/50' : 'bg-white/10'}
          `} />
        )}

        {/* Primary Action */}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          disabled={isConnecting}
          className="relative px-2 py-1 text-xs md:text-sm font-bold tracking-[0.2em] text-white uppercase group"
        >
          <span className="relative z-10 transition-all duration-300 group-hover:tracking-[0.3em]">
            {isConnected ? 'TERMINATE' : isConnecting ? 'SYNCING...' : 'INITIATE'}
          </span>

          {/* Subtle underline glow */}
          <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Sensory Detail (Mini) */}
        {!isConnected && (
          <div className="h-4 w-[1px] bg-white/10" />
        )}

        {!isConnected && (
          <div className="text-[8px] text-white/20 font-bold tracking-widest hidden sm:block">
            MK.5
          </div>
        )}
      </div>

      {/* 3. SIRI STYLE AMBIENT GLOW (Only when active) */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -inset-4 -z-10 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple AnimatePresence stub if needed (usually imported from framer-motion in App.tsx)
import { motion, AnimatePresence } from 'framer-motion';

export default ControlPanel;
