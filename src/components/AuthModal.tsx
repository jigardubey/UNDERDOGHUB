import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  resetPassword,
  updateUserProfileData
} from '../lib/dbServices';
import { X, Mail, Lock, User, LogIn, LogOut, KeyRound, Shield, AlertCircle, CheckCircle2, Sparkles, Gamepad2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bgmiId, setBgmiId] = useState(currentUser?.bgmiId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onShowToast('Welcome back!', 'Successfully signed in with Google.', 'success');
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('Please fill in email and password.');
          setLoading(false);
          return;
        }
        await loginWithEmail(email, password);
        onShowToast('Logged in!', 'Your account and schedule are now synced across devices.', 'success');
        onClose();
      } else if (mode === 'register') {
        if (!email || !password || !displayName) {
          setError('Please complete all registration fields.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
        onShowToast('Account Created!', 'Welcome to Underdog Hub! Your account is active.', 'success');
        onClose();
      } else if (mode === 'forgot') {
        if (!email) {
          setError('Please enter your email address.');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        onShowToast('Password Reset Email Sent', 'Check your inbox for password reset instructions.', 'info');
        setMode('login');
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please login instead.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      onShowToast('Logged Out', 'You have been signed out successfully.', 'info');
      onClose();
    } catch (err: any) {
      onShowToast('Error', 'Failed to log out.', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateUserProfileData(currentUser.uid, {
        name: displayName || currentUser.name,
        bgmiId: bgmiId
      });
      onShowToast('Profile Updated', 'Your gamer profile details have been saved.', 'success');
      onClose();
    } catch (err: any) {
      onShowToast('Error', 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = currentUser && currentUser.uid !== 'guest' && currentUser.uid !== 'local-guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#12131A] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF7A00]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoggedIn && mode !== 'profile' ? (
          /* LOGGED IN USER CARD */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1A1C26] border-2 border-[#FF7A00] flex items-center justify-center text-[#FF7A00] font-black text-2xl shadow-lg shadow-[#FF7A00]/10">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-[#Sora]">{currentUser.name}</h2>
              <p className="text-xs text-gray-400">{currentUser.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20">
                {currentUser.role} Account
              </span>
            </div>

            {currentUser.bgmiId && (
              <div className="p-3 rounded-xl bg-[#1A1C26] border border-white/5 text-xs text-gray-300 flex items-center justify-between">
                <span className="text-gray-400">BGMI/In-Game ID:</span>
                <span className="font-mono font-bold text-white">{currentUser.bgmiId}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#1A1C26]/50 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Cross-Device Cloud Syncing Active</span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setDisplayName(currentUser.name);
                  setBgmiId(currentUser.bgmiId || '');
                  setMode('profile');
                }}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-colors"
              >
                Edit Gamer Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        ) : mode === 'profile' ? (
          /* EDIT PROFILE FORM */
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-white font-[#Sora]">Edit Profile</h2>
              <p className="text-xs text-gray-400">Update your gamer display details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Gamer / Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-sm focus:border-[#FF7A00] outline-none"
                    placeholder="Your In-Game Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">BGMI Character ID (Optional)</label>
                <div className="relative">
                  <Gamepad2 className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={bgmiId}
                    onChange={(e) => setBgmiId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-sm focus:border-[#FF7A00] outline-none"
                    placeholder="e.g. 5123456789"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-bold text-sm transition-colors"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN / REGISTER / FORGOT FORM */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white font-[#Sora]">
                {mode === 'login' && 'Gamer Sign In'}
                {mode === 'register' && 'Create Gamer Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-gray-400">
                {mode === 'login' && 'Sync your schedule and tournaments across devices'}
                {mode === 'register' && 'Join Underdog Hub and save your custom matches'}
                {mode === 'forgot' && "Enter your email address to receive reset instructions"}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            {mode !== 'forgot' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-sm transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-white/10 w-full"></div>
                  <span className="bg-[#12131A] px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Or Email
                  </span>
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-sm focus:border-[#FF7A00] outline-none"
                      placeholder="Gamer Alias"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-sm focus:border-[#FF7A00] outline-none"
                    placeholder="gamer@example.com"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-300">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setMode('forgot');
                        }}
                        className="text-[11px] text-[#FF7A00] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-sm focus:border-[#FF7A00] outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-bold text-sm transition-colors shadow-lg shadow-[#FF7A00]/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Please wait...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Register Account'}
                      {mode === 'forgot' && 'Send Reset Email'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Modes */}
            <div className="text-center pt-2 border-t border-white/5">
              {mode === 'login' ? (
                <p className="text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('register');
                    }}
                    className="text-[#FF7A00] font-bold hover:underline"
                  >
                    Create one now
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('login');
                    }}
                    className="text-[#FF7A00] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
