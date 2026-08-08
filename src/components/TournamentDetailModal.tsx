import React, { useState } from 'react';
import { Tournament } from '../types';
import {
  X,
  ArrowLeft,
  Share2,
  Bell,
  MessageSquare,
  Trophy,
  Calendar,
  Users,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles
} from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'participants' | 'prizepool' | 'rules'>('details');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleDownloadCalendar = () => {
    downloadIcsCalendar(
      tournament.name,
      tournament.startDate,
      tournament.startTime,
      `${tournament.description}\nOrganizer: ${tournament.organizer}\nRegistration: ${tournament.registrationUrl}`
    );
    onShowToast('Calendar Saved!', '.ics event file downloaded with match reminder alarm.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('Link Copied!', 'Tournament share link copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#0F1018] border border-white/10 shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col font-[#Sora]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar: Back Arrow & Right Action Icons */}
        <div className="p-4 bg-[#12141D] border-b border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Share Tournament"
              className="p-2 rounded-xl bg-[#1A1C28] hover:bg-[#222536] text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onShowToast('Notifications Enabled', 'You will receive reminders before match start.')}
              title="Enable Reminders"
              className="p-2 rounded-xl bg-[#1A1C28] hover:bg-[#222536] text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => onShowToast('Organizer Chat', 'Contact organizer via official tournament registration link.')}
              title="Organizer Chat"
              className="p-2 rounded-xl bg-[#1A1C28] hover:bg-[#222536] text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Top Hero Card Summary */}
          <div className="bg-[#141622] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
            
            {/* Left Column info */}
            <div className="flex-1 space-y-2.5 min-w-0">
              
              {/* Prize Badge & Bookmark */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2563EB] text-white font-extrabold text-xs shadow-md shadow-blue-600/30">
                  <Trophy className="w-3.5 h-3.5 fill-white text-[#2563EB]" />
                  <span>{tournament.prizePool || 'TBD'}</span>
                </span>

                <button
                  onClick={() => onToggleSave(tournament.id)}
                  className={`ml-auto p-1.5 rounded-lg border transition-colors ${
                    isSaved
                      ? 'bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF7A00]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FF7A00]' : ''}`} />
                </button>
              </div>

              {/* Name */}
              <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight leading-snug">
                {tournament.name}
              </h1>

              {/* Organizer */}
              <div className="flex items-center gap-1.5 text-xs text-gray-300">
                <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[10px] font-black text-[#60A5FA]">
                  {tournament.organizer.charAt(0)}
                </div>
                <span className="font-bold text-white">{tournament.organizer}</span>
                {tournament.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]/20" />
                )}
              </div>

              {/* Meta */}
              <div className="text-xs text-gray-400 font-medium">
                {tournament.matchFormat} • {tournament.startDate} • {tournament.gameVersion || 'Free Fire MAX'}
              </div>

            </div>

            {/* Right Poster Thumbnail */}
            <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-[#1A1C28] border border-white/10 shrink-0 relative">
              <img
                src={tournament.bannerUrl || DEFAULT_UNDERDOG_BANNER}
                alt={tournament.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_UNDERDOG_BANNER;
                }}
              />
            </div>

          </div>

          {/* Secondary Tabs Bar: Details | Schedule | Participants | Prizepool | Rules */}
          <div className="flex items-center gap-4 sm:gap-6 border-b border-white/10 pb-2 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none">
            {[
              { id: 'details', label: 'Details' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'participants', label: 'Participants' },
              { id: 'prizepool', label: 'Prizepool' },
              { id: 'rules', label: 'Rules' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-2 whitespace-nowrap transition-all relative ${
                  activeTab === t.id ? 'text-[#3B82F6] font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              
              {/* Quick Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#141622] border border-white/10 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#3B82F6] border border-[#2563EB]/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Match Starts</div>
                    <div className="text-xs font-extrabold text-white">{tournament.startDate}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#141622] border border-white/10 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#3B82F6] border border-[#2563EB]/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Mode</div>
                    <div className="text-xs font-extrabold text-white">{tournament.matchFormat}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#141622] border border-white/10 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#3B82F6] border border-[#2563EB]/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Slots</div>
                    <div className="text-xs font-extrabold text-white">{tournament.slotsFilled}/{tournament.slotsTotal} Teams</div>
                  </div>
                </div>
              </div>

              {/* About Tournament Section */}
              <div className="space-y-2 bg-[#141622] p-4 rounded-2xl border border-white/10">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">About Tournament</h3>
                <div className="text-gray-300 text-xs leading-relaxed space-y-2">
                  <p className={isDescriptionExpanded ? '' : 'line-clamp-3'}>
                    {tournament.description}
                  </p>
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-[#3B82F6] font-bold text-xs flex items-center gap-1 hover:underline pt-1"
                  >
                    <span>{isDescriptionExpanded ? 'Read less' : 'Read more...'}</span>
                    {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Tournament Specs Specs Box */}
              <div className="bg-[#141622] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
                <div className="px-4 py-3 bg-white/5 font-bold text-white text-xs uppercase tracking-wider">
                  Tournament Schedule & Specs
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Registration Start</span>
                  <span className="font-semibold text-[#FF7A00]">{tournament.registrationStartDate || tournament.startDate}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Registration End</span>
                  <span className="font-semibold text-[#FF7A00]">{tournament.registrationEndDate || tournament.registrationCloseDate || tournament.startDate}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Match Start Date</span>
                  <span className="font-semibold text-blue-400">{tournament.matchStartDate || tournament.startDate} ({tournament.startTime})</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Match End Date</span>
                  <span className="font-semibold text-blue-400">{tournament.matchEndDate || tournament.matchStartDate || tournament.startDate}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Game version</span>
                  <span className="font-semibold text-white">{tournament.gameVersion || '1.0 MAX'}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Location</span>
                  <span className="font-semibold text-white">{tournament.location || 'India'}</span>
                </div>
              </div>

              {/* Organizers Card */}
              <div className="bg-[#141622] p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-sm shrink-0">
                  {tournament.organizer.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{tournament.organizer}</span>
                    {tournament.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />}
                  </div>
                  <div className="text-[10px] text-gray-400">Official Tournament Organizer</div>
                </div>
              </div>

              {/* Tournament Phases Timeline */}
              <div className="bg-[#141622] p-4 rounded-2xl border border-white/10 space-y-3">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Tournament Timeline</h3>
                <div className="relative pl-6 space-y-4 border-l-2 border-blue-600/30">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-[#141622]" />
                    <div className="text-xs font-bold text-white">Registration Opens</div>
                    <div className="text-[10px] text-gray-400">{tournament.registrationStartDate || tournament.startDate}</div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-[#141622]" />
                    <div className="text-xs font-bold text-white">Registration Closes</div>
                    <div className="text-[10px] text-gray-400">{tournament.registrationEndDate || tournament.registrationCloseDate || tournament.startDate}</div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-[#141622]" />
                    <div className="text-xs font-bold text-white">Match Start Date</div>
                    <div className="text-[10px] text-blue-400 font-semibold">{tournament.matchStartDate || tournament.startDate} at {tournament.startTime}</div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-[#141622]" />
                    <div className="text-xs font-bold text-white">Match End Date</div>
                    <div className="text-[10px] text-purple-300 font-semibold">{tournament.matchEndDate || tournament.matchStartDate || tournament.startDate}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#141622] border border-white/10 space-y-3">
                <h4 className="text-xs font-extrabold text-white uppercase">Match Schedule & Timings</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="p-3 rounded-xl bg-black/40 flex justify-between items-center">
                    <span>Qualifier Round 1</span>
                    <span className="font-bold text-[#3B82F6]">{tournament.startDate} • 16:00 IST</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 flex justify-between items-center">
                    <span>Quarter Finals</span>
                    <span className="font-bold text-[#3B82F6]">{tournament.startDate} • 18:30 IST</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 flex justify-between items-center">
                    <span>Grand Finals</span>
                    <span className="font-bold text-[#3B82F6]">{tournament.startDate} • 21:00 IST</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase">Registered Squads ({tournament.slotsFilled})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Array.from({ length: Math.min(8, tournament.slotsFilled || 4) }).map((_, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#141622] border border-white/5 flex items-center justify-between">
                    <span className="font-bold text-white">Squad #{idx + 1}</span>
                    <span className="text-emerald-400 text-[10px] font-bold">Confirmed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRIZEPOOL */}
          {activeTab === 'prizepool' && (
            <div className="space-y-3 bg-[#141622] p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-extrabold text-white uppercase">Prize Distribution ({tournament.prizePool})</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-extrabold flex justify-between">
                  <span>🥇 1st Place</span>
                  <span>50% Prize Share</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-300 font-extrabold flex justify-between">
                  <span>🥈 2nd Place</span>
                  <span>30% Prize Share</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-700/10 border border-amber-700/20 text-amber-500 font-extrabold flex justify-between">
                  <span>🥉 3rd Place</span>
                  <span>20% Prize Share</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase">Tournament Rules</h4>
              <ul className="space-y-2">
                {tournament.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-[#141622] border border-white/10 text-xs text-gray-200">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#3B82F6] font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-[#12141D] border-t border-white/10 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadCalendar}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#1A1C28] hover:bg-[#222536] text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[#3B82F6]" />
            <span>Calendar Reminders</span>
          </button>

          <a
            href={tournament.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
          >
            <span>Register Now</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};

