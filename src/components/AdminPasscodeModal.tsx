import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, X, KeyRound, AlertCircle } from 'lucide-react';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onVerifyPasscode: (passcode: string) => boolean;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onVerifyPasscode,
  onShowToast
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the Admin Passcode.');
      return;
    }

    const isValid = onVerifyPasscode(passcode);
    if (isValid) {
      setError('');
      setPasscode('');
      onShowToast('Admin Access Granted', 'Private admin control panel unlocked.', 'success');
      onSuccess();
      onClose();
    } else {
      setError('Invalid Admin Passcode! Access Denied.');
      onShowToast('Access Denied', 'Incorrect passcode provided.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-[#16161D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shadow-lg shadow-[#FF7A00]/10">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-extrabold uppercase tracking-widest border border-red-500/20 mb-1">
                Restricted Access
              </div>
              <h3 className="text-xl font-black text-white italic font-[#Sora]">Private Admin Gateway</h3>
              <p className="text-xs text-white/50">Enter security passcode to unlock management tools</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
              Secret Admin Passcode
            </label>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin passcode"
                autoFocus
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-[#FF7A00] transition-colors"
              />
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-xs shadow-lg shadow-[#FF7A00]/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Access</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
