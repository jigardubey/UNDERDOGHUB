import React, { useState } from 'react';
import { Tournament, MatchFormat, VerificationRequest } from '../types';
import { 
  ShieldCheck, Check, X, Edit2, Trash2, Plus, CheckCircle2, Clock, Play, 
  CheckCircle, AlertTriangle, Search, Lock, KeyRound, Eye, EyeOff, LogOut, Key, Shield,
  Award, DollarSign, ExternalLink, Mail, Phone, Link2
} from 'lucide-react';

interface AdminPanelProps {
  tournaments: Tournament[];
  verificationRequests: VerificationRequest[];
  verificationFee: number;
  isAdminAuthenticated: boolean;
  onVerifyPasscode: (passcode: string) => boolean;
  onLockAdminSession: () => void;
  onChangePasscode: (newPasscode: string) => void;
  onApproveSubmission: (id: string) => void;
  onRejectSubmission: (id: string) => void;
  onDeleteTournament: (id: string) => void;
  onUpdateStatus: (id: string, status: 'live' | 'upcoming' | 'ended') => void;
  onToggleVerified: (id: string) => void;
  onSaveTournament: (tournament: Tournament) => void;
  onApproveVerification: (requestId: string, organizerName: string) => void;
  onRejectVerification: (requestId: string) => void;
  onRemoveVerification: (organizerName: string) => void;
  onChangeVerificationFee: (newFee: number) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tournaments,
  verificationRequests,
  verificationFee,
  isAdminAuthenticated,
  onVerifyPasscode,
  onLockAdminSession,
  onChangePasscode,
  onApproveSubmission,
  onRejectSubmission,
  onDeleteTournament,
  onUpdateStatus,
  onToggleVerified,
  onSaveTournament,
  onApproveVerification,
  onRejectVerification,
  onRemoveVerification,
  onChangeVerificationFee,
  onShowToast
}) => {
  const [adminTab, setAdminTab] = useState<'pending' | 'verifications' | 'manage' | 'create'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // Fee setting state
  const [customFeeInput, setCustomFeeInput] = useState<string>(verificationFee.toString());

  // Private Access Login States
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Change Passcode Modal State
  const [showChangePasscodeModal, setShowChangePasscodeModal] = useState(false);
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [changeError, setChangeError] = useState('');

  const pendingList = tournaments.filter((t) => t.isPendingApproval);
  const activeList = tournaments.filter((t) => !t.isPendingApproval);

  const filteredActive = activeList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setLoginError('Please enter the Admin Passcode.');
      return;
    }

    const isValid = onVerifyPasscode(passcode);
    if (isValid) {
      setLoginError('');
      setPasscode('');
      onShowToast('Access Granted', 'Welcome to the Private Admin Console.', 'success');
    } else {
      setLoginError('Incorrect Passcode! Access Denied.');
      onShowToast('Access Denied', 'Invalid passcode.', 'error');
    }
  };

  const handleChangePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPasscode || !newPasscode) {
      setChangeError('Both fields are required.');
      return;
    }

    const isOldValid = onVerifyPasscode(oldPasscode);
    if (!isOldValid) {
      setChangeError('Current passcode is incorrect.');
      return;
    }

    if (newPasscode.length < 4) {
      setChangeError('New passcode must be at least 4 characters long.');
      return;
    }

    onChangePasscode(newPasscode);
    setShowChangePasscodeModal(false);
    setOldPasscode('');
    setNewPasscode('');
    setChangeError('');
    onShowToast('Passcode Updated', 'Admin passcode updated successfully.', 'success');
  };

  // IF NOT AUTHENTICATED -> SHOW PRIVATE GATEWAY LOCK SCREEN
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="rounded-2xl bg-[#16161D] border border-white/10 p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7A00] opacity-5 blur-[80px] pointer-events-none" />

          {/* Icon Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-extrabold uppercase tracking-widest border border-red-500/20">
              Private Admin Area
            </div>
            <h2 className="text-2xl font-black text-white italic font-[#Sora]">
              Admin Control Gateway
            </h2>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              This section is strictly private. Enter the secret admin passcode to manage tournament approvals and official listings.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleGateSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                Enter Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter secret passcode"
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

              {loginError && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-sm shadow-xl shadow-[#FF7A00]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Form for creating or editing official tournament
  const [form, setForm] = useState<Partial<Tournament>>({
    name: '',
    organizer: 'UNDERDOG Official',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    status: 'upcoming',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '18:00 IST',
    prizePool: '₹1,00,000',
    entryFee: 'Free',
    registrationUrl: 'https://underdoghub.gg/register',
    matchFormat: 'Battle Royale Squad',
    description: 'Official tournament created by Underdog Hub Admin.',
    rules: ['Must follow Free Fire official tournament code of conduct.'],
    slotsTotal: 48,
    slotsFilled: 0
  });

  const handleEditClick = (t: Tournament) => {
    setEditingTournament(t);
    setForm(t);
    setAdminTab('create');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.organizer) {
      onShowToast('Error', 'Name and Organizer are required.', 'error');
      return;
    }

    const tournamentToSave: Tournament = {
      id: editingTournament ? editingTournament.id : `official-${Date.now()}`,
      name: form.name || 'Official Cup',
      organizer: form.organizer || 'UNDERDOG Hub',
      isVerified: form.isVerified ?? true,
      bannerUrl: form.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
      status: form.status || 'upcoming',
      startDate: form.startDate || new Date().toISOString().split('T')[0],
      startTime: form.startTime || '18:00 IST',
      prizePool: form.prizePool || '₹50,000',
      entryFee: form.entryFee || 'Free',
      registrationUrl: form.registrationUrl || 'https://underdoghub.gg',
      matchFormat: (form.matchFormat as MatchFormat) || 'Battle Royale Squad',
      description: form.description || '',
      rules: Array.isArray(form.rules) ? form.rules : [form.rules || 'Official rules.'],
      slotsTotal: form.slotsTotal || 48,
      slotsFilled: form.slotsFilled || 0,
      isPendingApproval: false
    };

    onSaveTournament(tournamentToSave);
    setEditingTournament(null);
    setAdminTab('manage');
    onShowToast('Success!', editingTournament ? 'Tournament details updated.' : 'New official tournament created.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-[#FF7A00] font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Private Admin Console</span>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] border border-green-500/30 font-mono">AUTHENTICATED</span>
          </div>
          <h1 className="text-3xl font-black text-white italic font-[#Sora]">
            Tournament Management Console
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Review user submissions, edit listings, toggle verified badges, and update live status.
          </p>
        </div>

        {/* Header Security Controls & Tab Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowChangePasscodeModal(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold border border-white/5 flex items-center gap-1.5 transition-colors"
            title="Change Admin Passcode"
          >
            <Key className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Change PIN</span>
          </button>

          <button
            onClick={onLockAdminSession}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 flex items-center gap-1.5 transition-colors"
            title="Lock Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>

          {/* Tab Buttons */}
          <div className="flex items-center gap-1 bg-[#16161D] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setAdminTab('pending')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                adminTab === 'pending' ? 'bg-red-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingList.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('verifications')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                adminTab === 'verifications' ? 'bg-[#FF7A00] text-black font-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Verifications ({verificationRequests.filter(r => r.status === 'pending').length})</span>
            </button>

            <button
              onClick={() => setAdminTab('manage')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                adminTab === 'manage' ? 'bg-[#FF7A00] text-black font-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Listings ({activeList.length})</span>
            </button>

            <button
              onClick={() => {
                setEditingTournament(null);
                setAdminTab('create');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                adminTab === 'create' ? 'bg-[#FF7A00] text-black font-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingTournament ? 'Edit' : 'Create Official'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Passcode Modal */}
      {showChangePasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#16161D] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#FF7A00]" />
                <h3 className="text-lg font-bold text-white font-[#Sora]">Change Admin Passcode</h3>
              </div>
              <button onClick={() => setShowChangePasscodeModal(false)} className="p-1 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Current Passcode</label>
                <input
                  type="password"
                  required
                  value={oldPasscode}
                  onChange={(e) => setOldPasscode(e.target.value)}
                  placeholder="Enter current passcode"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">New Passcode</label>
                <input
                  type="password"
                  required
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode (min 4 chars)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              {changeError && (
                <div className="text-xs text-red-400 font-medium">{changeError}</div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasscodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs shadow-md shadow-[#FF7A00]/20"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: PENDING USER SUBMISSIONS */}
      {adminTab === 'pending' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white font-[#Sora]">
            Pending Submissions Requiring Approval ({pendingList.length})
          </h2>

          {pendingList.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#12131A] border border-white/5 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="text-base font-bold text-white">All caught up!</h3>
              <p className="text-xs text-gray-400">There are no pending organizer submissions right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((t) => (
                <div key={t.id} className="p-6 rounded-2xl bg-[#12131A] border border-yellow-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                  <div className="flex gap-4 items-start">
                    <img
                      src={t.bannerUrl}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="space-y-1">
                      <span className="text-xs text-[#FF7A00] font-bold uppercase">{t.matchFormat}</span>
                      <h3 className="text-lg font-bold text-white">{t.name}</h3>
                      <p className="text-xs text-gray-300">By <strong>{t.organizer}</strong> • Prize: {t.prizePool} ({t.entryFee})</p>
                      <p className="text-xs text-gray-400">Starts: {t.startDate} at {t.startTime}</p>
                      <p className="text-xs text-blue-400 truncate max-w-md">{t.registrationUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        onRejectSubmission(t.id);
                        onShowToast('Rejected', 'Submission rejected.');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      onClick={() => {
                        onApproveSubmission(t.id);
                        onShowToast('Approved!', `${t.name} is now published on UNDERDOG HUB.`);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-green-500/20"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORGANIZER VERIFICATION REQUESTS & FEE CONFIG */}
      {adminTab === 'verifications' && (
        <div className="space-y-6">
          
          {/* Fee Configuration Box */}
          <div className="p-6 rounded-2xl bg-[#12131A] border border-[#FF7A00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-[#Sora]">Organizer Verification Fee Setting</h3>
                <p className="text-xs text-white/50">Configure the verification application fee for organizers</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseInt(customFeeInput, 10);
                if (isNaN(num) || num < 0) {
                  onShowToast('Invalid Fee', 'Please enter a valid amount.', 'error');
                  return;
                }
                onChangeVerificationFee(num);
                onShowToast('Verification Fee Updated', `New fee set to ₹${num}`, 'success');
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={customFeeInput}
                  onChange={(e) => setCustomFeeInput(e.target.value)}
                  placeholder="499"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0B0B0F] border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#FF7A00]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-xs transition-all shadow-md shadow-[#FF7A00]/10 shrink-0"
              >
                Update Fee
              </button>
            </form>
          </div>

          {/* Verification Requests List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white font-[#Sora]">
              Verification Applications ({verificationRequests.length})
            </h2>

            {verificationRequests.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#12131A] border border-white/5 text-center space-y-2">
                <Shield className="w-12 h-12 text-white/20 mx-auto" />
                <h3 className="text-base font-bold text-white">No Verification Requests Yet</h3>
                <p className="text-xs text-gray-400">When organizers submit verification forms, they will appear here for your review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationRequests.map((req) => (
                  <div key={req.id} className="p-6 rounded-2xl bg-[#12131A] border border-white/10 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{req.organizerName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            req.status === 'approved' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : req.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {req.status === 'approved' ? '✔ Approved' : req.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold font-mono">
                          Payment: Completed (₹{req.feePaid})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                      <div>
                        <span className="text-white/40 block font-semibold uppercase text-[10px]">Contact Info</span>
                        <div>Email: <strong className="text-white">{req.email}</strong></div>
                        <div>Phone: <strong className="text-white">{req.phone}</strong></div>
                      </div>

                      <div>
                        <span className="text-white/40 block font-semibold uppercase text-[10px]">Social & Community</span>
                        <div className="text-blue-400 truncate">{req.socialLinks || 'None provided'}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-white/40 block font-semibold uppercase text-[10px]">Tournament Experience</span>
                        <p className="text-white/80 p-3 rounded-xl bg-[#0B0B0F] border border-white/5">{req.experience}</p>
                      </div>

                      <div>
                        <span className="text-white/40 block font-semibold uppercase text-[10px]">Reason for Verification</span>
                        <p className="text-white/80 p-3 rounded-xl bg-[#0B0B0F] border border-white/5">{req.reason}</p>
                      </div>
                    </div>

                    {/* Admin Actions for this request */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                      {req.status !== 'approved' ? (
                        <button
                          onClick={() => {
                            onApproveVerification(req.id, req.organizerName);
                            onShowToast('Verification Approved!', `${req.organizerName} is now a Verified Organizer with ✔ badge.`);
                          }}
                          className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-green-500/20"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          Approve Verification
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onRemoveVerification(req.organizerName);
                            onShowToast('Badge Removed', `Verified badge removed for ${req.organizerName}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-colors"
                        >
                          Remove Verified Badge
                        </button>
                      )}

                      {req.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            onRejectVerification(req.id);
                            onShowToast('Verification Rejected', `Request rejected for ${req.organizerName}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors"
                        >
                          Reject Request
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 3: MANAGE ALL ACTIVE TOURNAMENTS */}
      {adminTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white font-[#Sora]">
              Active Listings ({activeList.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12131A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#12131A]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0B0B0F] text-gray-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-bold">
                <tr>
                  <th className="p-4">Tournament</th>
                  <th className="p-4">Organizer</th>
                  <th className="p-4">Prize / Fee</th>
                  <th className="p-4">Status Toggle</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActive.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={t.bannerUrl} alt={t.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white text-sm line-clamp-1">{t.name}</div>
                          <div className="text-[10px] text-gray-400">{t.startDate} • {t.matchFormat}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-gray-200">
                      {t.organizer}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{t.prizePool}</div>
                      <div className="text-[10px] text-gray-400">{t.entryFee}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onUpdateStatus(t.id, 'live');
                            onShowToast('Status Updated', `${t.name} marked as LIVE`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                            t.status === 'live' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          Live
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(t.id, 'upcoming');
                            onShowToast('Status Updated', `${t.name} marked as UPCOMING`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                            t.status === 'upcoming' ? 'bg-[#FF7A00] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          Upcoming
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(t.id, 'ended');
                            onShowToast('Status Updated', `${t.name} marked as ENDED`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                            t.status === 'ended' ? 'bg-gray-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          Ended
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => {
                          onToggleVerified(t.id);
                          onShowToast('Verified Badge Toggled', `${t.organizer} status updated.`);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          t.isVerified
                            ? 'bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/40'
                            : 'bg-white/5 text-gray-500 border-white/10'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {t.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTournament(t.id);
                            onShowToast('Deleted', 'Tournament removed from platform.');
                          }}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE OR EDIT OFFICIAL TOURNAMENT */}
      {adminTab === 'create' && (
        <form onSubmit={handleSaveForm} className="p-6 sm:p-8 rounded-2xl bg-[#12131A] border border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-white font-[#Sora]">
            {editingTournament ? `Edit Tournament: ${editingTournament.name}` : 'Create Official Tournament Listing'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tournament Title *</label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Organizer Name *</label>
              <input
                type="text"
                required
                value={form.organizer || ''}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
              <select
                value={form.status || 'upcoming'}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live Now</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Verified Badge Status</label>
              <select
                value={form.isVerified ? 'yes' : 'no'}
                onChange={(e) => setForm({ ...form, isVerified: e.target.value === 'yes' })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="yes">Verified (Orange Check)</option>
                <option value="no">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Prize Pool</label>
              <input
                type="text"
                value={form.prizePool || ''}
                onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Entry Fee</label>
              <input
                type="text"
                value={form.entryFee || ''}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Banner Image URL</label>
              <input
                type="text"
                value={form.bannerUrl || ''}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Registration Link</label>
              <input
                type="text"
                value={form.registrationUrl || ''}
                onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setEditingTournament(null);
                setAdminTab('manage');
              }}
              className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs shadow-md shadow-[#FF7A00]/20"
            >
              {editingTournament ? 'Update Listing' : 'Publish Official Tournament'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
