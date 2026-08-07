import React from 'react';
import { ShieldCheck, Instagram } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
  tournamentsCount?: number;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, tournamentsCount = 0 }) => {
  return (
    <footer className="bg-[#0B0B0F] border-t border-white/5 pt-12 text-white/40 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavClick('home')}>
              <div className="w-8 h-8 rounded-lg bg-[#FF7A00] flex items-center justify-center text-black font-black italic text-lg">
                U
              </div>
              <span className="font-black text-lg text-white italic tracking-tight font-[#Sora]">
                UNDERDOG <span className="text-[#FF7A00]">HUB</span>
              </span>
            </div>

            <p className="text-white/60 text-xs leading-relaxed max-w-sm">
              The ultimate Free Fire esports discovery engine. Created & Owned by <strong className="text-white">Jigar Dubey</strong>. Discover verified tournaments, track live cups, and manage match schedules seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[11px] text-white/50 font-mono pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                <span>Verified Esports Directory</span>
              </div>
              <span className="hidden sm:inline text-white/20">•</span>
              <a 
                href="https://instagram.com/ig_jigardubey" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 text-[#FF7A00] hover:underline font-bold"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@ig_jigardubey</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-[#Sora]">Navigation</h4>
            <ul className="space-y-1.5 text-white/60">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-[#FF7A00] transition-colors">Home Page</button>
              </li>
              <li>
                <button onClick={() => onNavClick('tournaments')} className="hover:text-[#FF7A00] transition-colors">Discover Tournaments</button>
              </li>
              <li>
                <button onClick={() => onNavClick('my-tournaments')} className="hover:text-[#FF7A00] transition-colors">My Schedule</button>
              </li>
              <li>
                <button onClick={() => onNavClick('submit')} className="hover:text-[#FF7A00] transition-colors">Submit Tournament</button>
              </li>
            </ul>
          </div>

          {/* Owner & Community */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-[#Sora]">Owner & Socials</h4>
            <ul className="space-y-1.5 text-white/60">
              <li className="text-white/80 font-medium">Owner: Jigar Dubey</li>
              <li>
                <a 
                  href="https://instagram.com/ig_jigardubey" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-[#FF7A00] transition-colors flex items-center gap-1 text-[#FF7A00]"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram @ig_jigardubey</span>
                </a>
              </li>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-[#FF7A00] transition-colors">Discord Community</a></li>
            </ul>
          </div>

        </div>

      </div>

      {/* Bottom Professional Polish Status Bar */}
      <div className="px-4 sm:px-8 py-3 bg-[#0B0B0F] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-white/40 tracking-wider uppercase">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center sm:justify-start">
          <span>SYSTEM: <strong className="text-green-400 font-bold">STABLE</strong></span>
          <span>LISTED TOURNAMENTS: <strong className="text-white font-bold">{tournamentsCount}</strong></span>
          <span className="text-[#FF7A00]">OWNER: JIGAR DUBEY (@IG_JIGARDUBEY)</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <span className="text-white/20">•</span>
          <span>© {new Date().getFullYear()} UNDERDOG HUB</span>
        </div>
      </div>
    </footer>
  );
};
