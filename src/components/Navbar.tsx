import React, { useState } from 'react';
import { Shield, Flame, Bookmark, PlusCircle, User, ShieldAlert, Menu, X, LogOut, Check, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  user: UserProfile;
  isAdminAuthenticated?: boolean;
  onOpenAuth: () => void;
  onToggleAdminRole: () => void;
  onOpenAdminAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  user,
  isAdminAuthenticated = false,
  onOpenAuth,
  onToggleAdminRole,
  onOpenAdminAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = Boolean(
    user &&
    user.uid &&
    user.uid !== 'guest' &&
    user.uid !== 'local-guest' &&
    user.id !== 'user-default'
  );

  const handleAdminButtonClick = () => {
    if (isAdminAuthenticated && user.role === 'admin') {
      setActiveTab('admin');
    } else if (onOpenAdminAuth) {
      onOpenAdminAuth();
    } else {
      onToggleAdminRole();
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'my-tournaments', label: 'My Tournaments', badge: savedCount },
    { id: 'submit', label: 'Submit Tournament' },
  ];

  if (user.role === 'admin' && isAdminAuthenticated) {
    navItems.push({ id: 'admin', label: 'Admin Panel', badge: 0 });
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0B0F]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 bg-[#FF7A00] rounded-lg flex items-center justify-center font-black text-black italic text-lg sm:text-xl shadow-md shadow-[#FF7A00]/20 group-hover:scale-105 transition-transform shrink-0">
              U
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black tracking-tighter text-base sm:text-xl text-white italic">UNDERDOG</span>
                <span className="font-black text-base sm:text-xl text-[#FF7A00] italic">HUB</span>
              </div>
              <p className="text-[10px] text-white/40 tracking-wider font-mono uppercase -mt-1 hidden sm:block">Platform for Free Fire Pros</p>
            </div>
          </div>

          {/* Navigation Links - Only show on large screens so it never pushes Login off-screen */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#16161D] p-1.5 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20 font-black'
                      : 'text-white/60 hover:text-[#FF7A00] hover:bg-white/5'
                  }`}
                >
                  {item.id === 'my-tournaments' && <Bookmark className="w-3.5 h-3.5" />}
                  {item.id === 'submit' && <PlusCircle className="w-3.5 h-3.5" />}
                  {item.id === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                  {item.label}

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                        isActive ? 'bg-black text-[#FF7A00]' : 'bg-[#FF7A00] text-black'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar - Always visible on tablet/desktop */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Mode Switcher for Private Admin */}
            <button
              onClick={handleAdminButtonClick}
              title="Private Admin Access Control"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all ${
                isAdminAuthenticated && user.role === 'admin'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30 shadow-md shadow-red-500/10'
                  : 'bg-white/5 text-white/70 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span className="hidden md:inline">{isAdminAuthenticated && user.role === 'admin' ? 'Admin Console' : 'Private Admin'}</span>
            </button>

            {/* Profile / Auth Login Button - Always shrink-0 */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-xs sm:text-sm font-bold shadow-lg shrink-0 ${
                isLoggedIn
                  ? 'bg-[#16161D] text-white border border-white/10 hover:border-[#FF7A00]'
                  : 'bg-[#FF7A00] text-black hover:bg-[#FF8A1F] shadow-[#FF7A00]/20 font-black'
              }`}
            >
              {isLoggedIn ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-[#FF7A00] text-black flex items-center justify-center font-black text-[11px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[90px]">{user.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Header Bar Buttons (< sm screens) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            {/* Mobile Direct Login / Account Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow-md shrink-0 ${
                isLoggedIn
                  ? 'bg-[#16161D] text-white border border-white/10'
                  : 'bg-[#FF7A00] text-black hover:bg-[#FF8A1F] shadow-[#FF7A00]/20'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? user.name.split(' ')[0] : 'Login'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#16161D] text-gray-300 hover:text-white border border-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0F] border-b border-white/5 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {/* Prominent Login Button at Top of Drawer */}
          <button
            onClick={() => {
              onOpenAuth();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF7A00] text-black font-black text-sm shadow-lg shadow-[#FF7A00]/20"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoggedIn ? `Logged in: ${user.name}` : 'Login / Create Account'}</span>
          </button>

          <div className="space-y-1.5 pt-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#FF7A00] text-black font-bold'
                    : 'bg-[#16161D] text-gray-200 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.id === 'my-tournaments' && <Bookmark className="w-4 h-4" />}
                  {item.id === 'submit' && <PlusCircle className="w-4 h-4" />}
                  {item.id === 'admin' && <ShieldAlert className="w-4 h-4" />}
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black text-[#FF7A00]">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

