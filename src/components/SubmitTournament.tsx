import React, { useState } from 'react';
import { MatchFormat, Tournament } from '../types';
import { PlusCircle, Image, CheckCircle, ShieldAlert, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface SubmitTournamentProps {
  onSubmitTournament: (newTournament: Omit<Tournament, 'id' | 'slotsFilled' | 'isVerified'>) => void;
  pendingSubmissions: Tournament[];
  onOpenVerificationModal?: () => void;
  verificationFee?: number;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

const PRESET_BANNERS = [
  { id: '1', name: 'Esports Arena Neon', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop' },
  { id: '2', name: 'Battle Royale Night', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop' },
  { id: '3', name: 'Championship Stage', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop' },
  { id: '4', name: 'Tactical Firestorm', url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1200&auto=format&fit=crop' },
];

export const SubmitTournament: React.FC<SubmitTournamentProps> = ({
  onSubmitTournament,
  pendingSubmissions,
  onOpenVerificationModal,
  verificationFee = 499,
  onShowToast
}) => {
  const [form, setForm] = useState({
    name: '',
    organizer: '',
    bannerUrl: PRESET_BANNERS[0].url,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '18:00 IST',
    prizePool: '₹25,000',
    entryFee: 'Free',
    registrationUrl: '',
    matchFormat: 'Battle Royale Squad' as MatchFormat,
    description: '',
    rules: '',
    slotsTotal: 48
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedOrganizer = form.organizer.trim();
    let trimmedRegUrl = form.registrationUrl.trim();

    if (!trimmedName || !trimmedOrganizer || !trimmedRegUrl) {
      onShowToast('Missing Fields', 'Please complete all required fields.', 'error');
      return;
    }

    if (!trimmedRegUrl.startsWith('http://') && !trimmedRegUrl.startsWith('https://')) {
      trimmedRegUrl = `https://${trimmedRegUrl}`;
    }

    // URL validation
    try {
      new URL(trimmedRegUrl);
    } catch {
      onShowToast('Invalid Link', 'Please provide a valid registration URL.', 'error');
      return;
    }

    // Check custom image file format if user typed a custom URL
    if (form.bannerUrl && !PRESET_BANNERS.some(b => b.url === form.bannerUrl)) {
      const lower = form.bannerUrl.toLowerCase();
      if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
        onShowToast('Invalid Banner Image', 'Banner URL must start with http:// or https://', 'error');
        return;
      }
    }

    // Duplicate submission prevention
    const isDuplicate = pendingSubmissions.some(
      (t) => t.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
             t.organizer.trim().toLowerCase() === trimmedOrganizer.toLowerCase()
    );

    if (isDuplicate) {
      onShowToast('Duplicate Submission', 'A tournament with this exact name and organizer is already pending approval.', 'error');
      return;
    }

    const parsedRules = form.rules
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    onSubmitTournament({
      name: trimmedName,
      organizer: trimmedOrganizer,
      bannerUrl: form.bannerUrl,
      status: 'upcoming',
      startDate: form.startDate,
      startTime: form.startTime,
      prizePool: form.prizePool,
      entryFee: form.entryFee,
      registrationUrl: trimmedRegUrl,
      matchFormat: form.matchFormat,
      description: form.description.trim() || 'Official Free Fire tournament submitted by organizer.',
      rules: parsedRules.length > 0 ? parsedRules : ['Official Free Fire Esports Rules apply.', 'No emulators permitted.'],
      slotsTotal: Number(form.slotsTotal) || 48,
      isPendingApproval: true,
      submittedAt: new Date().toISOString()
    });

    setSubmittedSuccess(true);
    onShowToast('Tournament Submitted!', 'Your listing is pending admin verification.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-xs font-bold text-[#FF7A00]">
          <PlusCircle className="w-4 h-4" />
          <span>Organizer Submission Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-[#Sora]">
          Submit Your Free Fire Tournament
        </h1>
        <p className="text-sm text-gray-300 max-w-xl mx-auto">
          Host scrims, community leagues, or major cups? Submit your tournament details below. Once verified by admins, it will go live for 15,000+ players.
        </p>
      </div>

      {/* Verified Badge Callout Banner */}
      {onOpenVerificationModal && (
        <div className="p-6 rounded-2xl bg-[#16161D] border border-[#FF7A00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shrink-0">
              <CheckCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-[#Sora]">Want a Verified Organizer Badge?</h3>
                <span className="px-2 py-0.5 rounded bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-black uppercase border border-[#FF7A00]/30">✔ VERIFIED</span>
              </div>
              <p className="text-xs text-white/60">Get official trust mark, priority listing, and instant automated approvals for ₹{verificationFee}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenVerificationModal}
            className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-extrabold text-xs shadow-lg shadow-[#FF7A00]/20 shrink-0"
          >
            Apply for Verified Badge
          </button>
        </div>
      )}

      {submittedSuccess && (
        <div className="p-6 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/40 text-center space-y-3 shadow-xl">
          <CheckCircle className="w-12 h-12 text-[#FF7A00] mx-auto" />
          <h3 className="text-xl font-bold text-white font-[#Sora]">Submission Received!</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Your tournament has been added to the pending verification queue. You can submit another or check admin approval status below.
          </p>
          <button
            onClick={() => setSubmittedSuccess(false)}
            className="px-6 py-2.5 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs"
          >
            Submit Another Tournament
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-[#16161D] border border-white/5 space-y-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white font-[#Sora] border-b border-white/5 pb-3 flex items-center justify-between">
          <span>Tournament Details</span>
          <span className="text-xs text-white/40 font-normal">* Required fields</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Tournament Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Booyah Master Championship Season 3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Organizer / Gaming Org Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Esports Community"
              value={form.organizer}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          {/* Banner Preset Selector */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-gray-300">Tournament Banner Image</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_BANNERS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setForm({ ...form, bannerUrl: preset.url })}
                  className={`relative h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    form.bannerUrl === preset.url ? 'border-[#FF7A00] scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                placeholder="Or paste custom Banner Image URL (https://...)"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Match Format *</label>
            <select
              value={form.matchFormat}
              onChange={(e) => setForm({ ...form, matchFormat: e.target.value as MatchFormat })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="Battle Royale Squad">Battle Royale Squad (4v4v4v4...)</option>
              <option value="Clash Squad 4v4">Clash Squad 4v4</option>
              <option value="Battle Royale Duo">Battle Royale Duo</option>
              <option value="Battle Royale Solo">Battle Royale Solo</option>
              <option value="Custom Room">Custom Room Scrims</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Total Squad Capacity</label>
            <input
              type="number"
              min="2"
              max="100"
              value={form.slotsTotal}
              onChange={(e) => setForm({ ...form, slotsTotal: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Start Time *</label>
            <input
              type="text"
              required
              placeholder="e.g. 18:00 IST or 20:30 IST"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Prize Pool *</label>
            <input
              type="text"
              required
              placeholder="e.g. ₹50,000 or $1,000"
              value={form.prizePool}
              onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Entry Fee *</label>
            <input
              type="text"
              required
              placeholder="e.g. Free or ₹100/Squad"
              value={form.entryFee}
              onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Registration Link (Google Form / Website / Discord) *</label>
            <input
              type="url"
              required
              placeholder="https://forms.gle/... or https://organizer.com/register"
              value={form.registrationUrl}
              onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Tournament Description</label>
            <textarea
              rows={3}
              placeholder="Describe the format, stream details, map sequence..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Rules (One rule per line)</label>
            <textarea
              rows={3}
              placeholder="1. Level 40+ requirement&#10;2. No emulators or iPads&#10;3. Room ID shared 15m early"
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-[#FF7A00] hover:bg-[#FF9225] text-black font-extrabold text-base transition-all shadow-xl shadow-[#FF7A00]/25"
        >
          Submit Tournament for Approval
        </button>
      </form>

      {/* Pending User Submissions Queue */}
      {pendingSubmissions.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#12131A] border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white font-[#Sora] flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Your Submissions Pending Verification ({pendingSubmissions.length})
          </h3>
          <div className="space-y-3">
            {pendingSubmissions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl bg-[#0B0B0F] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                  <p className="text-xs text-gray-400">{sub.organizer} • {sub.startDate} at {sub.startTime}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold uppercase">
                  Pending Approval
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
