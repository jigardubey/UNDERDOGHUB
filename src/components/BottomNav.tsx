import React from 'react';
import { Home, Trophy, Bookmark, PlusCircle, Shield, User, Wallet, Bell, Flame } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  userRole?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenAuth,
  isLoggedIn,
  userRole
}) => {
  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 max-w-lg mx-auto sm:hidden">
      <div className="bg-[#12141D]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl shadow-black">
        
        {/* 1. Home */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-[#3B82F6] font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Home</span>
        </button>

        {/* 2. Tournaments */}
        <button
          onClick={() => {
            setActiveTab('tournaments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'tournaments'
              ? 'text-[#3B82F6] font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === 'tournaments' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Tournaments</span>
        </button>

        {/* 3. My Schedule / Saved */}
        <button
          onClick={() => {
            setActiveTab('my-tournaments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'my-tournaments'
              ? 'text-[#3B82F6] font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${activeTab === 'my-tournaments' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">My Schedule</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] font-black flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>

        {/* 4. Submit */}
        <button
          onClick={() => {
            setActiveTab('submit');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'submit'
              ? 'text-[#3B82F6] font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <PlusCircle className={`w-5 h-5 ${activeTab === 'submit' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Submit</span>
        </button>

        {/* 5. Profile / Auth */}
        <button
          onClick={onOpenAuth}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            isLoggedIn ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{isLoggedIn ? 'Profile' : 'Login'}</span>
        </button>

      </div>
    </div>
  );
};
