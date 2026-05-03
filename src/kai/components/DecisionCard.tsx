import React, { useState, useCallback } from 'react';
import { DecisionCardData } from '../types';

interface DecisionCardProps {
  data: DecisionCardData;
  onClose: () => void;
  onRequestNews?: (ticker: string) => void;
}

const DecisionCard: React.FC<DecisionCardProps> = ({ data, onClose, onRequestNews }) => {
  const [visible] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Sanitization utility to prevent XSS from AI-generated content
  const sanitize = (str: string) => {
    return str.replace(/[<>]/g, (tag) => ({
      '<': '&lt;',
      '>': '&gt;'
    }[tag] || tag));
  };

  const handleNewsSearch = useCallback(() => {
    if (data.ticker_symbol && onRequestNews) {
      setIsSearching(true);
      onRequestNews(data.ticker_symbol);
      // Simulating search state duration
      setTimeout(() => setIsSearching(false), 8000);
    }
  }, [data.ticker_symbol, onRequestNews]);

  const getRecColor = (rec: string) => {
    const r = rec.toLowerCase();
    if (r.includes('buy')) return 'text-emerald-400';
    if (r.includes('reduce') || r.includes('sell')) return 'text-red-400';
    return 'text-amber-400';
  };

  const getConfidenceStyle = (score: number) => {
    if (score > 80) return 'bg-emerald-500';
    if (score > 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const hasTicker = data.ticker_symbol && data.ticker_symbol !== "N/A";
  const displayPrice = data.current_price ? `$${data.current_price}` : "—";
  const priceColor = (data.price_change_percentage?.startsWith('+') || parseFloat(data.price_change_percentage || '0') > 0) ? 'text-emerald-400' : 'text-red-400';
  const changeColor = priceColor;
  const risk = data.risk_alignment || "Balanced";

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-black/60 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="decision-card-title">
      <div className={`
        relative w-full max-w-5xl bg-[#0a0a0b] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}
      `}>

        {/* Header / Recommendation */}
        <div className="p-4 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 bg-gradient-to-br from-gray-900/50 to-transparent">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div id="decision-card-title" className={`text-2xl md:text-4xl font-black uppercase tracking-tighter mb-1 ${getRecColor(data.recommendation)}`}>
                {data.recommendation}
              </div>
              {hasTicker && (
                <div className="flex flex-col bg-gray-900/50 rounded-xl px-4 py-2 md:px-5 md:py-3 border border-gray-800 mb-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Market Data</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-xl md:text-2xl font-mono font-bold text-gray-100 tracking-wider">{data.ticker_symbol}</span>
                    <span className={`text-xl md:text-2xl font-mono font-bold transition-all duration-300 ${priceColor}`}>{displayPrice}</span>
                    <span className={`text-base md:text-lg font-bold font-mono ${changeColor}`}>{data.price_change_percentage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full lg:w-auto">
            <div className="flex-1 lg:w-40 bg-gray-900/30 border border-gray-800 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex justify-between w-full mb-2 items-end">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Confidence</span>
                <span className="text-lg font-mono font-bold text-gray-300">{data.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                <div className={`h-full rounded-full ${getConfidenceStyle(data.confidence)} transition-all duration-1000 ease-out`} style={{ width: `${visible ? data.confidence : 0}%` }} />
              </div>
            </div>
            <div className="flex-1 lg:w-48 rounded-xl p-3 border bg-amber-900/20 border-amber-500/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Risk Profile</span>
              </div>
              <div className="text-sm font-bold uppercase mb-1.5 text-amber-200">{risk}</div>
            </div>
          </div>
        </div>

        {/* Three Agents Insights */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/40 p-5 rounded-2xl border border-blue-900/20 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 className="text-blue-300 text-xs uppercase tracking-widest font-bold">Fundamental Core</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-light">{sanitize(data.fundamental_insight)}</p>
          </div>
          <div className="bg-gray-900/40 p-5 rounded-2xl border border-purple-900/20 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <h3 className="text-purple-300 text-xs uppercase tracking-widest font-bold">Sentiment Core</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-light">{sanitize(data.sentiment_insight)}</p>
          </div>
          <div className="bg-gray-900/40 p-5 rounded-2xl border border-emerald-900/20 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="text-emerald-300 text-xs uppercase tracking-widest font-bold">Valuation Core</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-light">{sanitize(data.valuation_insight)}</p>
          </div>
        </div>

        {/* Debate & Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-gray-800">
          <div className="p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-800 bg-gray-900/20">
            <h3 className="text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              Internal Agent Debate
            </h3>
            <div className="relative pl-6 border-l-2 border-gray-700 italic text-gray-300 text-xs md:text-sm leading-loose">
              <span className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center text-[10px] text-gray-500">"</span>
              {sanitize(data.debate_digest)}
            </div>
          </div>
          <div className="p-4 md:p-8 bg-gray-950">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Artifacts & Sources
              </h3>
              {data.ticker_symbol && (
                <button
                  onClick={handleNewsSearch}
                  disabled={isSearching}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ${isSearching ? 'bg-emerald-900/30 text-emerald-500 cursor-wait' : 'bg-gray-800 hover:bg-emerald-900/50 text-gray-300 hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/50'}`}
                >
                  {isSearching ? 'Scanning...' : 'Fetch News'}
                </button>
              )}
            </div>
            <ul className="space-y-3">
              {data.evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-400 transition-colors cursor-default group">
                  <span className="font-mono text-gray-600 group-hover:text-emerald-500">[{idx + 1}]</span>
                  <span className="border-b border-dashed border-gray-800 group-hover:border-gray-500 pb-0.5 group-hover:text-gray-200">{sanitize(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-3xl">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[10px] text-gray-600 uppercase tracking-widest">Generated by Kai Financial Engine</div>
          <button onClick={onClose} className="px-6 py-2 md:px-8 md:py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-lg shadow-lg">Acknowledge</button>
        </div>
        <div className="text-[8px] md:text-[9px] text-gray-600/70 text-center leading-tight px-4 border-t border-gray-800/50 pt-3">
          DISCLAIMER: This analysis is generated by AI for informational purposes only and does not constitute financial advice.
        </div>
      </div>
    </div>
  );
};

export default React.memo(DecisionCard);
