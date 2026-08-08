import React from 'react';
import { Tournament } from '../types';
import { Trophy, CheckCircle2, Bookmark, ExternalLink, ShieldCheck, Crown } from 'lucide-react';
import { DEFAULT_UNDERDOG_BANNER } from '../lib/constants';

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
  // Format metadata line
  const modeText = tournament.matchFormat.includes('Squad')
    ? 'Squad'
    : tournament.matchFormat.includes('Duo')
    ? 'Duo'
    : 'Solo';

  const gameName = tournament.gameVersion || 'Free Fire Max';

  return (
    <div 
      onClick={() => onViewDetails(tournament)}
      className="bg-[#12141D] hover:bg-[#161824] border border-white/10 hover:border-[#3B82F6]/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-300 shadow-lg cursor-pointer group flex flex-col justify-between space-y-3"
    >
      {/* Top Split Layout: Left Details vs Right Image Poster */}
      <div className="flex items-start justify-between gap-3">
        
        {/* Left Content Column */}
        <div className="flex-1 space-y-2 min-w-0">
          
          {/* Top Row: Prize Badge & Save Bookmark */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2563EB] text-white font-extrabold text-xs shadow-md shadow-blue-600/30">
              <Trophy className="w-3.5 h-3.5 fill-white text-[#2563EB]" />
              <span>{tournament.prizePool || 'TBD'}</span>
            </span>

            {tournament.isVerified && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Verified</span>
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(tournament.id);
              }}
              title={isSaved ? "Saved in schedule" : "Bookmark event"}
              className={`ml-auto p-1.5 rounded-lg transition-colors ${
                isSaved ? 'text-[#FF7A00] bg-[#FF7A00]/10' : 'text-gray-400 hover:text-white bg-white/5'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FF7A00]' : ''}`} />
            </button>
          </div>

          {/* Tournament Title */}
          <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug tracking-tight uppercase group-hover:text-[#3B82F6] transition-colors truncate">
            {tournament.name}
          </h3>

          {/* Organizer Line */}
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <div className="w-4 h-4 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[9px] font-black text-[#60A5FA] shrink-0">
              {tournament.organizer.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold truncate max-w-[140px] text-gray-300">{tournament.organizer}</span>
            {tournament.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6] fill-[#3B82F6]/20 shrink-0" />
            )}
          </div>

          {/* Metadata Specs Line */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
            <span>{modeText}</span>
            <span className="text-gray-600">•</span>
            <span>{tournament.startDate}</span>
            <span className="text-gray-600">•</span>
            <span className="truncate">{gameName}</span>
          </div>

        </div>

        {/* Right Thumbnail Poster */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#1A1C28] border border-white/10 shrink-0 relative">
          <img
            src={tournament.bannerUrl || DEFAULT_UNDERDOG_BANNER}
            alt={tournament.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_UNDERDOG_BANNER;
            }}
          />
          {tournament.status === 'live' && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          )}
        </div>

      </div>

      {/* Bottom Registration Status Strip */}
      <div className="pt-1 flex items-center gap-2">
        
        {/* Status Box */}
        <div className="flex-1 bg-white text-black px-3 py-1.5 rounded-l-xl rounded-r-sm font-semibold text-xs flex items-center justify-between min-w-0 shadow-inner">
          <span className="truncate text-[11px] sm:text-xs">
            {tournament.status === 'live' ? (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" />
                Ongoing Match
              </span>
            ) : tournament.status === 'ended' ? (
              <span className="text-gray-600 font-medium">Registration Closed</span>
            ) : (
              <span className="text-gray-800">
                Reg. closes in <strong className="text-red-600">{tournament.registrationCloseDate ? 'soon' : 'open'}</strong>
              </span>
            )}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (tournament.status === 'live' || tournament.status === 'upcoming') {
              window.open(tournament.registrationUrl, '_blank');
            } else {
              onViewDetails(tournament);
            }
          }}
          className={`px-4 py-1.5 rounded-r-xl rounded-l-sm font-black text-xs transition-all flex items-center gap-1 whitespace-nowrap shadow-md ${
            tournament.status === 'ended'
              ? 'bg-[#1E202E] text-gray-300 hover:bg-[#282B3E]'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-600/20'
          }`}
        >
          <span>
            {tournament.status === 'ended'
              ? 'View Details'
              : tournament.status === 'live'
              ? 'Join Match'
              : 'Register Now'}
          </span>
        </button>

      </div>

      {/* Champions Winner Highlight if finished */}
      {tournament.championName && (
        <div className="flex items-center gap-1.5 text-xs pt-0.5 font-bold text-amber-400">
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
          <span>Champions:</span>
          <span className="text-white font-medium">{tournament.championName}</span>
        </div>
      )}

    </div>
  );
};

