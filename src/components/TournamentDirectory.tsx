import React, { useState, useMemo } from 'react';
import { Tournament, MatchFormat } from '../types';
import { TournamentCard } from './TournamentCard';
import { Search, Filter, ShieldCheck, Trophy, Sparkles, AlertCircle } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>(initialCategory);
  const [formatFilter, setFormatFilter] = useState<'all' | MatchFormat>('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Don't show pending submissions in public directory
      if (t.isPendingApproval) return false;

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
  }, [tournaments, searchQuery, statusFilter, formatFilter, feeFilter, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search & Filter Control Header */}
      <div className="p-6 rounded-2xl bg-[#16161D] border border-white/5 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search Free Fire tournaments, organizers, cups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tournaments' },
              { id: 'live', label: '🔴 Live Now' },
              { id: 'upcoming', label: '⏰ Upcoming' },
              { id: 'ended', label: '🏁 Ended' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                  statusFilter === btn.id
                    ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20'
                    : 'bg-[#0B0B0F] text-white/60 hover:text-white border border-white/5'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Format Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Format:</span>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="all">All Formats</option>
                <option value="Battle Royale Squad">Battle Royale Squad</option>
                <option value="Clash Squad 4v4">Clash Squad 4v4</option>
                <option value="Battle Royale Duo">Battle Royale Duo</option>
                <option value="Battle Royale Solo">Battle Royale Solo</option>
              </select>
            </div>

            {/* Fee Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Entry Fee:</span>
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="all">Free & Paid</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Entry</option>
              </select>
            </div>

            {/* Verified Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FF7A00]"
              />
              <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
              <span>Verified Organizers Only</span>
            </label>

          </div>

          <div className="text-gray-400">
            Showing <strong className="text-white font-bold">{filteredTournaments.length}</strong> tournaments
          </div>

        </div>
      </div>

      {/* Grid of Tournament Cards */}
      {filteredTournaments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#12131A] border border-white/5 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {statusFilter === 'live' 
              ? 'No Live Tournaments Available' 
              : statusFilter === 'upcoming' 
              ? 'No Upcoming Tournaments' 
              : statusFilter === 'ended'
              ? 'No Ended Tournaments'
              : 'No Tournaments Found'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No tournaments matching "${searchQuery}" found in the database.`
              : 'Organizers can submit new Free Fire community cups or scrims via the Submit Tournament tab.'}
          </p>
          {(searchQuery || formatFilter !== 'all' || feeFilter !== 'all' || verifiedOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setFormatFilter('all');
                setFeeFilter('all');
                setVerifiedOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
