import React, { useState } from 'react';
import { Tournament, CustomMatch } from '../types';
import { Bookmark, Plus, Calendar, Clock, Bell, Trash2, CheckCircle, ExternalLink, Download, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { downloadIcsCalendar } from '../lib/storage';

interface MyTournamentsProps {
  savedTournaments: Tournament[];
  customMatches: CustomMatch[];
  onRemoveSaved: (id: string) => void;
  onAddCustomMatch: (match: Omit<CustomMatch, 'id' | 'createdAt'>) => void;
  onDeleteCustomMatch: (id: string) => void;
  onToggleCompleteMatch: (id: string) => void;
  onViewDetails: (t: Tournament) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

export const MyTournaments: React.FC<MyTournamentsProps> = ({
  savedTournaments,
  customMatches,
  onRemoveSaved,
  onAddCustomMatch,
  onDeleteCustomMatch,
  onToggleCompleteMatch,
  onViewDetails,
  onShowToast
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    tournamentName: '',
    organizer: '',
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: '18:00',
    notes: ''
  });

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tournamentName.trim()) {
      onShowToast('Missing Name', 'Please enter a tournament or match name.', 'error');
      return;
    }

    onAddCustomMatch({
      tournamentName: formData.tournamentName,
      organizer: formData.organizer || 'Custom Match',
      matchDate: formData.matchDate,
      matchTime: formData.matchTime,
      notes: formData.notes,
      isCompleted: false
    });

    setFormData({
      tournamentName: '',
      organizer: '',
      matchDate: new Date().toISOString().split('T')[0],
      matchTime: '18:00',
      notes: ''
    });
    setShowAddForm(false);
    onShowToast('Match Saved!', 'Custom tournament added to your match schedule.');
  };

  const requestBrowserNotification = (title: string, date: string, time: string) => {
    if (!('Notification' in window)) {
      onShowToast('Notifications Unsupported', 'Your browser does not support desktop notifications.', 'info');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(`🎮 Match Reminder Set: ${title}`, {
        body: `Match scheduled for ${date} at ${time}. We will remind you 15m before!`,
        icon: '/favicon.ico'
      });
      onShowToast('Reminder Active!', `Browser notification scheduled for ${title}.`);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          onShowToast('Notifications Enabled!', 'You will receive match alerts before game time.');
        }
      });
    } else {
      onShowToast('Permissions Blocked', 'Please allow notifications in browser settings.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#FF7A00] font-bold text-xs uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4 fill-[#FF7A00]" />
            <span>Personal Schedule Manager</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-[#Sora]">
            My Tournament Schedule
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Keep track of saved tournaments, add custom scrim rooms, and never miss a match start.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF9225] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF7A00]/20 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          {showAddForm ? 'Cancel Form' : 'Log Custom Match'}
        </button>
      </div>

      {/* Form to manually save custom match */}
      {showAddForm && (
        <form onSubmit={handleSubmitCustom} className="p-6 rounded-2xl bg-[#16161D] border border-[#FF7A00]/40 space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-white font-[#Sora] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF7A00]" />
            Add Custom Tournament or Scrim Match
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tournament / Scrim Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Free Fire Tier 1 Scrim Group B"
                value={formData.tournamentName}
                onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Organizer (Optional)</label>
              <input
                type="text"
                placeholder="e.g. IndiScrims Community"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Match Date *</label>
              <input
                type="date"
                required
                value={formData.matchDate}
                onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Match Time *</label>
              <input
                type="time"
                required
                value={formData.matchTime}
                onChange={(e) => setFormData({ ...formData, matchTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Match Notes (Room ID, Password, Spawn Strategy)</label>
              <textarea
                rows={2}
                placeholder="e.g. Room ID will be shared on Discord at 20:45. Drop spot: Peak & Clock Tower."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/5 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs shadow-md shadow-[#FF7A00]/20"
            >
              Save Match Entry
            </button>
          </div>
        </form>
      )}

      {/* Section 1: Saved Official Tournaments */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-[#Sora] flex items-center justify-between">
          <span>Saved Official Tournaments ({savedTournaments.length})</span>
        </h2>

        {savedTournaments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#16161D] border border-white/5 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No saved tournaments yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Explore live and upcoming Free Fire tournaments from the Home or Tournaments tab and click "Save to My Tournaments".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTournaments.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-[#16161D] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] font-bold text-[10px] uppercase">
                      {t.status}
                    </span>
                    <button
                      onClick={() => {
                        onRemoveSaved(t.id);
                        onShowToast('Removed', `Removed ${t.name} from schedule.`);
                      }}
                      className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2">{t.name}</h3>
                  
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>{t.startDate} at {t.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>Prize: <strong>{t.prizePool}</strong> ({t.entryFee})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      downloadIcsCalendar(t.name, t.startDate, t.startTime, t.description);
                      onShowToast('Exported!', 'Calendar .ics downloaded');
                    }}
                    className="p-2.5 rounded-xl bg-[#1A1B26] hover:bg-[#252738] text-white border border-white/10 text-xs font-semibold"
                    title="Download .ics Calendar Reminder"
                  >
                    <Download className="w-4 h-4 text-[#FF7A00]" />
                  </button>

                  <button
                    onClick={() => requestBrowserNotification(t.name, t.startDate, t.startTime)}
                    className="p-2.5 rounded-xl bg-[#1A1B26] hover:bg-[#252738] text-white border border-white/10 text-xs font-semibold"
                    title="Enable Browser Notification"
                  >
                    <Bell className="w-4 h-4 text-[#FF7A00]" />
                  </button>

                  <button
                    onClick={() => onViewDetails(t)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs transition-transform active:scale-95 text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Custom Saved Scrims & Matches */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <h2 className="text-xl font-bold text-white font-[#Sora]">
          Manually Logged Matches ({customMatches.length})
        </h2>

        {customMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#16161D] border border-white/5 text-center space-y-2">
            <FileText className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-400">No custom matches logged yet. Click "Log Custom Match" to record private scrims and room credentials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customMatches.map((cm) => (
              <div 
                key={cm.id} 
                className={`p-5 rounded-2xl bg-[#16161D] border transition-all ${
                  cm.isCompleted ? 'border-gray-800 opacity-60' : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{cm.organizer}</span>
                    <h4 className={`text-base font-bold ${cm.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                      {cm.tournamentName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleCompleteMatch(cm.id)}
                      title={cm.isCompleted ? "Mark Uncompleted" : "Mark Completed"}
                      className={`p-1.5 rounded-lg border text-xs font-semibold ${
                        cm.isCompleted ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCustomMatch(cm.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300 p-2.5 rounded-xl bg-[#0B0B0F]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>{cm.matchDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>{cm.matchTime}</span>
                  </div>
                </div>

                {cm.notes && (
                  <p className="mt-3 text-xs text-gray-400 italic bg-[#1A1B26] p-2.5 rounded-lg border border-white/5">
                    "{cm.notes}"
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      downloadIcsCalendar(cm.tournamentName, cm.matchDate, cm.matchTime, cm.notes || '');
                      onShowToast('Calendar File Saved', '.ics exported.');
                    }}
                    className="text-[#FF7A00] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Export to Calendar
                  </button>

                  <button
                    onClick={() => requestBrowserNotification(cm.tournamentName, cm.matchDate, cm.matchTime)}
                    className="text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" /> Set Alarm
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
