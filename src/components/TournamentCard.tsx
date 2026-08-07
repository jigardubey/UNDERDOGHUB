import React from 'react';
import { Tournament } from '../types';
import { CheckCircle2, Calendar, Clock, Trophy, Ticket, Bookmark, ExternalLink, Users, Shield } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onViewDetails: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  isSaved,
  onToggleSave,
  onViewDetails
}) => {
  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'live':
        return (
          <div className="flex gap-1.5 items-center">
            <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded flex items-center gap-1 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            {tournament.isVerified && (
              <span 
                title="Verified Organizer"
                className="px-2 py-1 bg-[#FF7A00] text-black text-[10px] font-black rounded uppercase flex items-center gap-1 cursor-help"
              >
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                VERIFIED
              </span>
            )}
          </div>
        );
      case 'upcoming':
        return (
          <div className="flex gap-1.5 items-center">
            <span className="px-2 py-1 bg-white/10 text-white/90 text-[10px] font-black rounded uppercase">
              UPCOMING
            </span>
            {tournament.isVerified && (
              <span 
                title="Verified Organizer"
                className="px-2 py-1 bg-[#FF7A00] text-black text-[10px] font-black rounded uppercase flex items-center gap-1 cursor-help"
              >
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                VERIFIED
              </span>
            )}
          </div>
        );
      case 'ended':
        return (
          <span className="px-2 py-1 bg-white/5 text-white/40 text-[10px] font-black rounded uppercase">
            ENDED
          </span>
        );
    }
  };

  return (
    <div className="bg-[#16161D] border border-white/5 rounded-xl overflow-hidden group hover:border-[#FF7A00]/40 transition-all flex flex-col justify-between">
      
      {/* Banner & Top Overlay */}
      <div className="h-36 bg-[#25252D] relative overflow-hidden">
        <img
          src={tournament.bannerUrl}
          alt={tournament.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
          }}
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16161D] via-[#16161D]/40 to-transparent" />

        {/* Status Badges Top Left */}
        <div className="absolute top-3 left-3 z-10">
          {getStatusBadge()}
        </div>

        {/* Save/Bookmark Button Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(tournament.id);
          }}
          title={isSaved ? "Remove from Schedule" : "Save Event"}
          className={`absolute top-3 right-3 z-10 p-2 rounded-lg backdrop-blur-md transition-colors ${
            isSaved
              ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/30'
              : 'bg-black/60 text-white hover:bg-black hover:text-[#FF7A00] border border-white/10'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-black' : ''}`} />
        </button>

        {/* Tournament Name & Prize at Bottom of Banner */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end gap-2">
          <span className="text-xs text-white font-bold uppercase truncate max-w-[70%] font-[#Sora]">
            {tournament.name}
          </span>
          <span className="text-[#FF7A00] text-sm font-black italic shrink-0">
            {tournament.prizePool}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col justify-between space-y-3 flex-1">
        
        {/* Organizer & Match Specs */}
        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono uppercase">
          <span className="truncate max-w-[170px] flex items-center gap-1">
            <span>ORG: {tournament.organizer}</span>
            {tournament.isVerified && (
              <span title="Verified Organizer" className="inline-flex cursor-help text-[#FF7A00]">
                <CheckCircle2 className="w-3 h-3 fill-[#FF7A00] text-black" />
              </span>
            )}
          </span>
          <span>{tournament.matchFormat}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] flex items-center justify-between text-white/70">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>{tournament.startDate} • {tournament.startTime}</span>
          </div>
          <span className="font-mono text-[10px] text-white/50">{tournament.slotsFilled}/{tournament.slotsTotal} Squads</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onViewDetails(tournament)}
            className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/5"
          >
            Details
          </button>

          <a
            href={tournament.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3 bg-[#FF7A00] hover:bg-[#FF8A1F] text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors shadow-md shadow-[#FF7A00]/10"
          >
            <span>Register</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>

      </div>
    </div>
  );
};
