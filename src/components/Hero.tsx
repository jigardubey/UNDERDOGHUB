import React from 'react';
import { Trophy, Flame, PlusCircle, Bell, ShieldCheck, Users, CalendarDays, Sparkles } from 'lucide-react';
import { Tournament } from '../types';

interface HeroProps {
  tournaments: Tournament[];
  onExplore: () => void;
  onSubmit: () => void;
}

export const Hero: React.FC<HeroProps> = ({ tournaments, onExplore, onSubmit }) => {
  const approved = tournaments.filter((t) => !t.isPendingApproval);
  const liveCount = approved.filter((t) => t.status === 'live').length;
  const upcomingCount = approved.filter((t) => t.status === 'upcoming').length;
  const verifiedOrgCount = new Set(approved.filter((t) => t.isVerified).map((t) => t.organizer)).size;
  const totalCount = approved.length;

  return (
    <div className="relative overflow-hidden bg-[#0B0B0F] pt-6 pb-12 lg:pt-10 lg:pb-16">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7A00] opacity-5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Card Container */}
        <header className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#16161D] to-[#0B0B0F] border border-white/5 p-8 sm:p-10 lg:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00] opacity-5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#FF7A00]/30 text-[#FF7A00] text-[10px] font-bold uppercase tracking-widest mb-4 bg-[#FF7A00]/5">
              <span>UNDERDOG HUB</span>
              <span className="text-white/30">•</span>
              <span className="text-white/70">By Jigar Dubey (@ig_jigardubey)</span>
            </div>

            {/* Italic Uppercase Hero Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight tracking-tight italic uppercase text-white font-[#Sora]">
              Never Miss a <span className="text-[#FF7A00]">Tournament</span> Again
            </h1>

            {/* Subtitle */}
            <p className="text-white/60 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              Discover, track, and manage your Free Fire tournament schedule. Real, verified community cups and official scrims in one platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 bg-[#FF7A00] text-black font-bold rounded-xl hover:bg-[#FF8A1F] transition-colors shadow-lg shadow-[#FF7A00]/20 flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5 fill-black" />
                <span>Explore Tournaments</span>
              </button>

              <button
                onClick={onSubmit}
                className="px-6 py-3.5 border border-white/10 bg-white/5 rounded-xl font-bold hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-[#FF7A00]" />
                <span>Submit Yours</span>
              </button>
            </div>
          </div>
        </header>

        {/* Live Database Esports Stats Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#16161D] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">🔴 Live Tournaments</p>
            <p className="text-2xl font-black italic text-[#FF7A00] font-[#Sora]">{liveCount}</p>
          </div>

          <div className="bg-[#16161D] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">⏰ Upcoming Cups</p>
            <p className="text-2xl font-black italic text-white font-[#Sora]">{upcomingCount}</p>
          </div>

          <div className="bg-[#16161D] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">✔ Verified Organizers</p>
            <p className="text-2xl font-black italic text-white font-[#Sora]">{verifiedOrgCount}</p>
          </div>

          <div className="bg-[#16161D] p-5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Listed</p>
            <p className="text-2xl font-black italic text-white font-[#Sora]">{totalCount}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
