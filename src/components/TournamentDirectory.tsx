import React, { useState, useMemo } from 'react';
import { Tournament, MatchFormat } from '../types';
import { TournamentCard } from './TournamentCard';
import { Search, ShieldCheck, Trophy, AlertCircle, Gamepad2, Swords, Compass } from 'lucide-react';

interface TournamentDirectoryProps {
  tournaments: Tournament[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onViewDetails: (t: Tournament) => void;
  initialCategory?: 'all' | 'live' | 'upcoming' | 'ended';
}

export const TournamentDirectory: React.FC<TournamentDirectoryProps> = ({
  tournaments,
  savedIds,
  onToggleSave,
  onViewDetails,
  initialCategory = 'all'
}) => {
  const [mainCategory, setMainCategory] = useState<'Esports' | 'Casual'>('Esports');
  const [subTab, setSubTab] = useState<'Tournaments' | 'Scrims' | 'Series'>('Tournaments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>(initialCategory);
  const [formatFilter, setFormatFilter] = useState<'all' | MatchFormat>('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Don't show pending submissions in public directory
      if (t.isPendingApproval) return false;

      // Category filter (Esports vs Casual)
      if (t.category && t.category !== mainCategory) return false;

      // Search filter
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.organizer.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Format filter
      if (formatFilter !== 'all' && t.matchFormat !== formatFilter) return false;

      // Fee filter
      if (feeFilter === 'free' && t.entryFee.toLowerCase() !== 'free') return false;
      if (feeFilter === 'paid' && t.entryFee.toLowerCase() === 'free') return false;

      // Verified filter
      if (verifiedOnly && !t.isVerified) return false;

      return true;
    });
  }, [tournaments, mainCategory, searchQuery, statusFilter, formatFilter, feeFilter, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* THRYL Mode Switcher: Casual vs Esports */}
      <div className="bg-[#12141D] p-1.5 rounded-2xl border border-white/10 flex items-center gap-2 max-w-md mx-auto shadow-xl">
        <button
          onClick={() => setMainCategory('Casual')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            mainCategory === 'Casual'
              ? 'bg-[#1E2235] text-white shadow-md border border-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-emerald-400" />
          <span>Casual</span>
        </button>

        <button
          onClick={() => setMainCategory('Esports')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 relative ${
            mainCategory === 'Esports'
              ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4 text-white" />
          <span>Esports</span>
          {mainCategory === 'Esports' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-300 rounded-full blur-[1px]" />
          )}
        </button>
      </div>

      {/* Sub-Tabs: Tournaments | Scrims | Series */}
      {mainCategory === 'Esports' && (
        <div className="flex items-center justify-center gap-6 border-b border-white/10 pb-3 text-sm font-bold">
          <button
            onClick={() => setSubTab('Tournaments')}
            className={`pb-1 transition-all relative ${
              subTab === 'Tournaments' ? 'text-[#3B82F6] font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tournaments
            {subTab === 'Tournaments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setSubTab('Scrims')}
            className={`pb-1 transition-all relative ${
              subTab === 'Scrims' ? 'text-[#3B82F6] font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Scrims
            {subTab === 'Scrims' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setSubTab('Series')}
            className={`pb-1 transition-all relative ${
              subTab === 'Series' ? 'text-[#3B82F6] font-extrabold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Series
            {subTab === 'Series' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />
            )}
          </button>
        </div>
      )}

      {/* Search & Status Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#12141D] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Free Fire MAX tournaments, organizers, cups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0C12] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Quick Status Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'live', label: '🔴 Live' },
              { id: 'upcoming', label: '⏰ Upcoming' },
              { id: 'ended', label: '🏁 Ended' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${
                  statusFilter === btn.id
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#0B0C12] text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

        </div>

        {/* Filter Specs Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-[#0B0C12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="all">All Formats</option>
              <option value="Battle Royale Squad">Battle Royale Squad</option>
              <option value="Clash Squad 4v4">Clash Squad 4v4</option>
              <option value="Battle Royale Duo">Battle Royale Duo</option>
              <option value="Battle Royale Solo">Battle Royale Solo</option>
            </select>

            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-[#0B0C12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="all">Free & Paid</option>
              <option value="free">Free Entry</option>
              <option value="paid">Paid Entry</option>
            </select>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-gray-300 hover:text-white text-xs">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#2563EB]"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Verified Organizers</span>
            </label>
          </div>

          <div className="text-gray-400 text-xs">
            Showing <strong className="text-white font-bold">{filteredTournaments.length}</strong> events
          </div>
        </div>
      </div>

      {/* Grid of Tournament Cards */}
      {filteredTournaments.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#12141D] border border-white/10 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {statusFilter === 'live' 
              ? 'No Live Tournaments Currently' 
              : statusFilter === 'upcoming' 
              ? 'No Upcoming Tournaments' 
              : statusFilter === 'ended'
              ? 'No Ended Events'
              : 'No Events Found'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No tournament matches found for "${searchQuery}".`
              : 'Organizers can submit Free Fire MAX esports cups directly to the platform.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              isSaved={savedIds.includes(tournament.id)}
              onToggleSave={onToggleSave}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

    </div>
  );
};

