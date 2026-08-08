import React, { useState } from 'react';
import { Shield, Flame, Bookmark, PlusCircle, User, ShieldAlert, Menu, X, LogOut, Check, LogIn, Wallet, Bell } from 'lucide-react';
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
    { id: 'my-tournaments', label: 'My Schedule', badge: savedCount },
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
    <header className="sticky top-0 z-40 bg-[#0F1018]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 bg-[#FF7A00] rounded-xl flex items-center justify-center font-black text-black italic text-xl shadow-lg shadow-[#FF7A00]/30 group-hover:scale-105 transition-transform shrink-0">
              U
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black tracking-tighter text-lg sm:text-2xl text-white italic">UNDERDOG</span>
                <span className="font-black text-xs sm:text-sm text-[#FF7A00] italic bg-[#FF7A00]/10 px-2 py-0.5 rounded border border-[#FF7A00]/30">HUB</span>
              </div>
              <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold hidden sm:block">Platform for Free Fire Pros</p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#141622] p-1.5 rounded-2xl border border-white/10">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 font-extrabold'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.id === 'my-tournaments' && <Bookmark className="w-3.5 h-3.5" />}
                  {item.id === 'submit' && <PlusCircle className="w-3.5 h-3.5" />}
                  {item.id === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                  {item.label}

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                        isActive ? 'bg-white text-[#2563EB]' : 'bg-[#2563EB] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Wallet / Coin Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-[#141622] border border-white/10 text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>₹0</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => handleNavClick('my-tournaments')}
              className="p-2 rounded-xl bg-[#141622] text-gray-300 hover:text-white border border-white/10 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            {/* Admin Toggle */}
            <button
              onClick={handleAdminButtonClick}
              title="Private Admin Access"
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isAdminAuthenticated && user.role === 'admin'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                  : 'bg-[#141622] text-gray-300 border-white/10 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Admin</span>
            </button>

            {/* Auth / Profile Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-xs font-extrabold shadow-md shrink-0 ${
                isLoggedIn
                  ? 'bg-[#141622] text-white border border-white/10 hover:border-[#3B82F6]'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-600/20'
              }`}
            >
              {isLoggedIn ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-[11px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[80px] hidden sm:inline">{user.name}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </>
              )}
            </button>

            {/* Hamburger menu for small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#141622] text-gray-300 hover:text-white border border-white/10 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F1018] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <button
            onClick={() => {
              onOpenAuth();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs shadow-lg shadow-blue-600/20"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoggedIn ? `Account: ${user.name}` : 'Login / Register'}</span>
          </button>

          <div className="space-y-1.5 pt-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#141622] text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.id === 'my-tournaments' && <Bookmark className="w-4 h-4" />}
                  {item.id === 'submit' && <PlusCircle className="w-4 h-4" />}
                  {item.id === 'admin' && <ShieldAlert className="w-4 h-4" />}
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#2563EB]">
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


