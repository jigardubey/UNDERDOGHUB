import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, Shield, Flame, Check, Mail, Lock, LogOut, KeyRound, AlertCircle } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  firebaseSignOut, 
  sendPasswordResetEmail,
  FirebaseUser 
} from '../lib/firebase';
import { logActivityToDb } from '../lib/dbServices';

interface AuthModalProps {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  firebaseUser,
  onSaveProfile,
  onClose,
  onShowToast
}) => {
  const [authMode, setAuthMode] = useState<'profile' | 'login' | 'register' | 'forgot'>(
    firebaseUser ? 'profile' : 'login'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user.name || '');
  const [inGameId, setInGameId] = useState(user.inGameId || '');
  const [squadName, setSquadName] = useState(user.squadName || '');
  const [role, setRole] = useState(user.role || 'player');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      logActivityToDb('LOGIN', 'User logged in via email', res.user.uid, res.user.email || '');
      onShowToast('Welcome back!', `Logged in as ${res.user.email}`);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password. Please check your credentials.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newProfile: UserProfile = {
        id: res.user.uid,
        uid: res.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: role,
        inGameId: inGameId.trim(),
        squadName: squadName.trim(),
        createdAt: new Date().toISOString()
      };
      onSaveProfile(newProfile);
      logActivityToDb('REGISTER', 'New user registered', res.user.uid, res.user.email || '');
      onShowToast('Account Created!', `Welcome to UNDERDOG HUB, ${name}!`);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please log in.');
      } else {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      logActivityToDb('GOOGLE_LOGIN', 'User logged in via Google', res.user.uid, res.user.email || '');
      onShowToast('Google Auth Success', `Signed in as ${res.user.displayName || res.user.email}`);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setErrorMsg(`Unauthorized Domain: "${domain}" is not authorized in Firebase Console. Go to Firebase Console → Authentication → Settings → Authorized domains and add "${domain}".`);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your account email.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      onShowToast('Reset Email Sent', `Password reset link sent to ${email}`, 'info');
      setAuthMode('login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      logActivityToDb('LOGOUT', 'User logged out', user.uid || user.id, user.email);
      onShowToast('Logged Out', 'Successfully logged out.');
      onClose();
    } catch (err: any) {
      onShowToast('Logout Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      inGameId: inGameId.trim(),
      squadName: squadName.trim(),
      role: role
    };
    onSaveProfile(updated);
    onShowToast('Profile Updated', 'Your player details have been saved.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-[#12131A] border border-white/15 p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FF7A00]/20 text-[#FF7A00]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-[#Sora]">
                {authMode === 'login' ? 'Account Login' : authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Reset Password' : 'Player Profile'}
              </h3>
              <p className="text-xs text-gray-400">
                {authMode === 'login' ? 'Sign in to sync your tournaments & squad' : authMode === 'register' ? 'Join UNDERDOG HUB esports platform' : authMode === 'forgot' ? 'Recover your account access' : `Signed in as ${user.email || 'Player'}`}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE: LOGIN */}
        {authMode === 'login' && (
          <div className="space-y-4">
            {/* Primary Google 1-Click Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-gray-100 font-extrabold text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-white/10 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Authenticating with Google...' : 'Instant 1-Click Sign In with Google'}</span>
            </button>

            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative bg-[#12131A] px-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">OR EMAIL LOGIN</span>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@underdoghub.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-300">Password *</label>
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setAuthMode('forgot'); }}
                    className="text-[11px] text-[#FF7A00] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-xs transition-all shadow-md shadow-[#FF7A00]/20 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Email'}
              </button>

              <p className="text-center text-xs text-gray-400 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setErrorMsg(''); setAuthMode('register'); }}
                  className="text-[#FF7A00] hover:underline font-bold"
                >
                  Create Account
                </button>
              </p>
            </form>
          </div>
        )}

        {/* MODE: REGISTER */}
        {authMode === 'register' && (
          <div className="space-y-4">
            {/* Primary Google 1-Click Register Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-gray-100 font-extrabold text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-white/10 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Registering with Google...' : 'Quick 1-Click Register with Google'}</span>
            </button>

            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative bg-[#12131A] px-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">OR MANUAL FORM</span>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Gamer Tag / Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ProGamer_77"
                className="w-full px-4 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@underdoghub.com"
                className="w-full px-4 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password * (min 6 chars)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Free Fire In-Game UID</label>
                <input
                  type="text"
                  placeholder="589120482"
                  value={inGameId}
                  onChange={(e) => setInGameId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Squad / Team</label>
                <input
                  type="text"
                  placeholder="VIPERS_FF"
                  value={squadName}
                  onChange={(e) => setSquadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="player">Player / Competitor</option>
                <option value="organizer">Tournament Organizer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-xs transition-all shadow-md shadow-[#FF7A00]/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthMode('login'); }}
                className="text-[#FF7A00] hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Enter Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@underdoghub.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-xs transition-all shadow-md shadow-[#FF7A00]/20 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Password Reset Link'}
            </button>

            <p className="text-center text-xs text-gray-400">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setAuthMode('login'); }}
                className="text-white hover:underline font-bold"
              >
                ← Back to Login
              </button>
            </p>
          </form>
        )}

        {/* MODE: PROFILE EDIT / LOGOUT (When authenticated) */}
        {authMode === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Logged In Account</span>
                <span className="text-white font-bold">{user.email || firebaseUser?.email || 'Authenticated User'}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name / Gamer Tag *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Free Fire In-Game UID</label>
              <input
                type="text"
                placeholder="e.g. 589120482"
                value={inGameId}
                onChange={(e) => setInGameId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Squad / Team Name</label>
              <input
                type="text"
                placeholder="e.g. UNDERDOG_VIPERS"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Account Role Mode</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="player">Player / Competitor</option>
                <option value="organizer">Tournament Organizer</option>
                <option value="verified_organizer">Verified Organizer</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Switch Account
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs shadow-md shadow-[#FF7A00]/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
