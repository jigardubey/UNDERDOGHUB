import React, { useState } from 'react';
import { Tournament } from '../types';
import { X, CheckCircle2, Trophy, Ticket, Calendar, Clock, Bookmark, ExternalLink, ShieldCheck, Download, Share2, BellRing, Sparkles } from 'lucide-react';
import { downloadIcsCalendar } from '../lib/storage';
import { DEFAULT_UNDERDOG_BANNER } from '../lib/constants';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  onClose,
  isSaved,
  onToggleSave,
  onShowToast
}) => {
  if (!tournament) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'prizes'>('overview');

  const handleDownloadCalendar = () => {
    downloadIcsCalendar(
      tournament.name,
      tournament.startDate,
      tournament.startTime,
      `${tournament.description}\nOrganizer: ${tournament.organizer}\nRegistration: ${tournament.registrationUrl}`
    );
    onShowToast('Calendar File Downloaded!', '.ics file saved. Open to add to Google/Apple Calendar with 15m reminder alarm.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('Link Copied!', 'Tournament share link copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-[#12131A] border border-white/15 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Image & Actions */}
        <div className="relative h-56 sm:h-64 w-full bg-[#1A1B26] shrink-0">
          <img
            src={tournament.bannerUrl || DEFAULT_UNDERDOG_BANNER}
            alt={tournament.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_UNDERDOG_BANNER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12131A] via-black/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 text-gray-300 hover:text-white border border-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Badges */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#FF7A00] text-black font-extrabold text-xs uppercase">
                {tournament.matchFormat}
              </span>
              <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-semibold text-xs border border-white/10 uppercase">
                Status: {tournament.status}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-black/60 hover:bg-black text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Header Title & Organizer */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-1">
              <span>Organized by <strong className="text-white">{tournament.organizer}</strong></span>
              {tournament.isVerified && (
                <span 
                  title="Verified Organizer"
                  className="flex items-center gap-1 text-[#FF7A00] text-xs font-bold bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full border border-[#FF7A00]/30 cursor-help"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#FF7A00] text-black" />
                  <span>Verified Organizer</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-[#Sora] leading-tight">
              {tournament.name}
            </h2>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#1A1B26] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                <Trophy className="w-4 h-4 text-[#FF7A00]" />
                <span>Prize Pool</span>
              </div>
              <div className="text-lg font-black text-white">{tournament.prizePool}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1A1B26] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                <Ticket className="w-4 h-4 text-[#FF7A00]" />
                <span>Entry Fee</span>
              </div>
              <div className="text-lg font-black text-white">{tournament.entryFee}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1A1B26] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Start Date</span>
              </div>
              <div className="text-sm font-bold text-white">{tournament.startDate}</div>
              <div className="text-xs text-[#FF7A00] font-semibold">{tournament.startTime}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1A1B26] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Squad Slots</span>
              </div>
              <div className="text-sm font-bold text-white">{tournament.slotsFilled} / {tournament.slotsTotal}</div>
              <div className="text-[10px] text-gray-400">Filled Teams</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'overview' ? 'bg-[#FF7A00] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'rules' ? 'bg-[#FF7A00] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Rules & Guidelines ({tournament.rules.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {tournament.description}
              </p>

              <div className="p-4 rounded-xl bg-[#0B0B0F] border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#FF7A00] shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white block font-semibold mb-0.5">UNDERDOG HUB Verification Guarantee</strong>
                  This tournament listing is aggregated for player discovery. Room credentials, custom lobby IDs, and prize distribution are managed directly by <strong>{tournament.organizer}</strong> via their official registration portal.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Match Ruleset</h4>
              <ul className="space-y-2">
                {tournament.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1A1B26] border border-white/5 text-xs text-gray-200">
                    <span className="w-5 h-5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#0B0B0F] border-t border-white/10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          
          <button
            onClick={() => onToggleSave(tournament.id)}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              isSaved
                ? 'bg-[#FF7A00] text-black border-[#FF7A00]'
                : 'bg-[#1A1B26] text-white border-white/15 hover:bg-[#252738]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-black' : ''}`} />
            {isSaved ? 'Saved in My Schedule' : 'Save to My Tournaments'}
          </button>

          <button
            onClick={handleDownloadCalendar}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1A1B26] hover:bg-[#252738] text-white border border-white/15 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#FF7A00]" />
            Add to Calendar (.ics)
          </button>

          <a
            href={tournament.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF9225] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF7A00]/20"
          >
            <span>Register Now on Organizer Portal</span>
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
          </a>

        </div>

      </div>
    </div>
  );
};
