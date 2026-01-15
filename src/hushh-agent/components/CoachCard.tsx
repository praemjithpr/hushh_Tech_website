
import React from 'react';
import { Coach } from '../types';

interface CoachCardProps {
  coach: Coach;
  onSelect: (coach: Coach) => void;
}

const CoachCard: React.FC<CoachCardProps> = ({ coach, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(coach)}
      className="group relative min-h-[500px] md:h-[600px] w-full cursor-pointer overflow-hidden rounded-[40px] transition-all duration-700 hover:scale-[1.02] glass border border-white/5"
    >
      {/* Image anchored to top to keep face in upper 60% */}
      <div className="absolute inset-0 h-full w-full">
        <img 
          src={coach.avatarUrl} 
          alt={coach.name} 
          className="h-full w-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
        />
      </div>

      {/* Aggressive gradient to keep content at the very bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
      
      {/* Content strictly limited to bottom-third safe zone */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 flex flex-col items-start gap-4 transition-transform duration-500 group-hover:translate-y-[-5px]">
        <h3 className="font-serif text-3xl md:text-5xl font-bold text-white tracking-tight leading-none drop-shadow-2xl">
          {coach.name}
        </h3>
        
        <div className={`inline-block rounded-full bg-${coach.color}/20 px-4 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white border border-${coach.color}/40 backdrop-blur-xl`}>
          {coach.role}
        </div>

        <p className="text-white/50 text-xs md:text-sm leading-relaxed line-clamp-2 transition-all duration-500 group-hover:text-white/80 group-hover:line-clamp-none">
          {coach.description}
        </p>
        
        <button className={`w-full mt-4 py-5 rounded-2xl bg-white text-black font-black text-[12px] md:text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:bg-${coach.color} hover:text-white shadow-2xl`}>
          CONNECT NOW
        </button>
      </div>
    </div>
  );
};

export default CoachCard;
