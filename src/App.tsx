import React, { useState, useEffect } from 'react';
import { Tournament, CustomMatch, UserProfile, VerificationRequest, PaymentSettings } from './types';
import {
  getStoredTournaments,
  saveStoredTournaments,
  getSavedTournamentIds,
  saveSavedTournamentIds,
  getCustomMatches,
  saveCustomMatches,
  getUserProfile,
  saveUserProfile,
  getAdminPasscode,
  saveAdminPasscode,
  getVerificationRequests,
  saveVerificationRequests,
  getVerificationFee,
  saveVerificationFee,
  getPaymentSettings,
  savePaymentSettings
} from './lib/storage';

import {
  subscribeToAuthChanges,
  subscribeToTournaments,
  saveTournamentToFirestore,
  deleteTournamentFromFirestore,
  subscribeToUserSchedule,
  saveUserScheduleToFirestore,
  subscribeToUserCustomMatches,
  saveCustomMatchToFirestore,
  deleteCustomMatchFromFirestore,
  subscribeToVerificationRequests,
  saveVerificationRequestToFirestore
} from './lib/dbServices';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TournamentCard } from './components/TournamentCard';
import { TournamentDirectory } from './components/TournamentDirectory';
import { TournamentDetailModal } from './components/TournamentDetailModal';
import { MyTournaments } from './components/MyTournaments';
import { SubmitTournament } from './components/SubmitTournament';
import { AdminPanel } from './components/AdminPanel';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { AuthModal } from './components/AuthModal';
import { VerificationModal } from './components/VerificationModal';
import { UnderdogChatbot } from './components/UnderdogChatbot';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // State initialized with offline local storage cache for instant rendering
  const [tournaments, setTournaments] = useState<Tournament[]>(getStoredTournaments);
  const [savedIds, setSavedIds] = useState<string[]>(getSavedTournamentIds);
  const [customMatches, setCustomMatches] = useState<CustomMatch[]>(getCustomMatches);
  const [user, setUser] = useState<UserProfile>(getUserProfile);

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Verification & Payment System State
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(getVerificationRequests);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(getPaymentSettings);
  const [verificationFee, setVerificationFee] = useState<number>(getVerificationFee);

  // Private Admin Security State
  const [adminPasscode, setAdminPasscode] = useState<string>(getAdminPasscode);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState<boolean>(false);

  // 1. REAL-TIME AUTHENTICATION & USER DATA LISTENERS
  useEffect(() => {
    const unsubAuth = subscribeToAuthChanges((loggedInUser) => {
      if (loggedInUser) {
        setUser(loggedInUser);
        saveUserProfile(loggedInUser);

        // Sync user saved tournament schedule from Firestore across all devices
        const unsubSchedule = subscribeToUserSchedule(loggedInUser.uid, (cloudSavedIds) => {
          if (cloudSavedIds && cloudSavedIds.length > 0) {
            setSavedIds(cloudSavedIds);
            saveSavedTournamentIds(cloudSavedIds);
          }
        });

        // Sync user custom matches from Firestore across all devices
        const unsubMatches = subscribeToUserCustomMatches(loggedInUser.uid, (cloudMatches) => {
          if (cloudMatches && cloudMatches.length > 0) {
            setCustomMatches(cloudMatches);
            saveCustomMatches(cloudMatches);
          }
        });

        return () => {
          unsubSchedule();
          unsubMatches();
        };
      } else {
        const guestUser = getUserProfile();
        setUser(guestUser);
      }
    });

    return () => unsubAuth();
  }, []);

  // 2. REAL-TIME GLOBAL FIRESTORE SUBSCRIPTIONS (Tournaments & Verification Requests)
  useEffect(() => {
    const unsubTournaments = subscribeToTournaments((dbTournaments) => {
      if (dbTournaments && dbTournaments.length > 0) {
        setTournaments(dbTournaments);
        saveStoredTournaments(dbTournaments);
      }
    });

    const unsubVerifications = subscribeToVerificationRequests((dbVerifications) => {
      if (dbVerifications && dbVerifications.length > 0) {
        setVerificationRequests(dbVerifications);
        saveVerificationRequests(dbVerifications);
      }
    });

    return () => {
      unsubTournaments();
      unsubVerifications();
    };
  }, []);

  // 3. PERSISTENT LOCAL CACHING
  useEffect(() => {
    saveStoredTournaments(tournaments);
  }, [tournaments]);

  useEffect(() => {
    saveSavedTournamentIds(savedIds);
    if (user && user.uid && user.uid !== 'guest' && user.uid !== 'local-guest') {
      saveUserScheduleToFirestore(user.uid, savedIds);
    }
  }, [savedIds, user]);

  useEffect(() => {
    saveCustomMatches(customMatches);
  }, [customMatches]);

  useEffect(() => {
    saveUserProfile(user);
  }, [user]);

  useEffect(() => {
    saveVerificationRequests(verificationRequests);
  }, [verificationRequests]);

  useEffect(() => {
    saveVerificationFee(verificationFee);
  }, [verificationFee]);

  // Toast Notification Helper
  const addToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Saved Tournament in My Schedule
  const handleToggleSave = (id: string) => {
    let newSavedIds: string[];
    if (savedIds.includes(id)) {
      newSavedIds = savedIds.filter((item) => item !== id);
      addToast('Removed', 'Tournament removed from My Schedule.');
    } else {
      newSavedIds = [...savedIds, id];
      addToast('Saved!', 'Tournament added to your schedule.');
    }
    setSavedIds(newSavedIds);
    if (user && user.uid && user.uid !== 'guest' && user.uid !== 'local-guest') {
      saveUserScheduleToFirestore(user.uid, newSavedIds);
    }
  };

  // Admin Verification & Security Handlers
  const handleVerifyAdminPasscode = (inputPasscode: string): boolean => {
    if (inputPasscode === adminPasscode) {
      setIsAdminAuthenticated(true);
      setUser((prev) => ({ ...prev, role: 'admin' }));
      addToast('Admin Access Granted', 'Welcome to the Admin Control Panel.');
      return true;
    }
    return false;
  };

  const handleChangeAdminPasscode = (newPasscode: string) => {
    setAdminPasscode(newPasscode);
    saveAdminPasscode(newPasscode);
    addToast('Passcode Updated', 'Private Admin Passcode has been changed.', 'success');
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    setUser((prev) => ({ ...prev, role: 'player' }));
    addToast('Admin Session Locked', 'You have been logged out of the private admin console.', 'info');
    if (activeTab === 'admin') setActiveTab('home');
  };

  const handleOpenAdminAuth = () => {
    if (isAdminAuthenticated && user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setShowAdminPasscodeModal(true);
    }
  };

  const handleToggleAdminRole = () => {
    if (user.role === 'admin' && isAdminAuthenticated) {
      handleLockAdminSession();
    } else {
      setShowAdminPasscodeModal(true);
    }
  };

  const handleChangeVerificationFee = (newFee: number) => {
    setVerificationFee(newFee);
    saveVerificationFee(newFee);
    addToast('Verification Fee Updated', `New badge verification fee set to ₹${newFee}`);
  };

  const handleUpdatePaymentSettings = (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    savePaymentSettings(newSettings);
  };

  // Custom Match Handlers
  const handleAddCustomMatch = (newMatch: Omit<CustomMatch, 'id' | 'createdAt'>) => {
    const created: CustomMatch = {
      ...newMatch,
      id: `cm-${Date.now()}`,
      userUid: user.uid,
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...customMatches];
    setCustomMatches(updated);
    if (user && user.uid && user.uid !== 'guest' && user.uid !== 'local-guest') {
      saveCustomMatchToFirestore(created);
    }
  };

  const handleDeleteCustomMatch = (id: string) => {
    const updated = customMatches.filter((m) => m.id !== id);
    setCustomMatches(updated);
    deleteCustomMatchFromFirestore(id);
    addToast('Deleted', 'Custom match entry removed.');
  };

  const handleToggleCompleteMatch = (id: string) => {
    const updated = customMatches.map((m) => (m.id === id ? { ...m, isCompleted: !m.isCompleted } : m));
    setCustomMatches(updated);
    const target = updated.find((m) => m.id === id);
    if (target && user && user.uid && user.uid !== 'guest' && user.uid !== 'local-guest') {
      saveCustomMatchToFirestore(target);
    }
  };

  // Submission Handler
  const handleSubmitTournament = (newT: Omit<Tournament, 'id' | 'slotsFilled' | 'isVerified'>) => {
    const created: Tournament = {
      ...newT,
      id: `sub-${Date.now()}`,
      organizerUid: user.uid || 'guest',
      slotsFilled: 0,
      isVerified: false,
      isPendingApproval: true
    };
    setTournaments([created, ...tournaments]);
    saveTournamentToFirestore(created);
  };

  // Admin Actions
  const handleApproveSubmission = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, isPendingApproval: false };
      setTournaments(tournaments.map((t) => (t.id === id ? updated : t)));
      saveTournamentToFirestore(updated);
      addToast('Tournament Approved!', `"${target.name}" is now live on the platform.`);
    }
  };

  const handleRejectSubmission = (id: string) => {
    setTournaments(tournaments.filter((t) => t.id !== id));
    deleteTournamentFromFirestore(id);
    addToast('Submission Rejected', 'Tournament removed from queue.', 'info');
  };

  const handleDeleteTournament = (id: string) => {
    setTournaments(tournaments.filter((t) => t.id !== id));
    deleteTournamentFromFirestore(id);
    addToast('Deleted', 'Tournament permanently removed from directory.', 'info');
  };

  const handleUpdateStatus = (id: string, status: 'live' | 'upcoming' | 'ended') => {
    const target = tournaments.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, status };
      setTournaments(tournaments.map((t) => (t.id === id ? updated : t)));
      saveTournamentToFirestore(updated);
    }
  };

  const handleToggleVerified = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, isVerified: !target.isVerified };
      setTournaments(tournaments.map((t) => (t.id === id ? updated : t)));
      saveTournamentToFirestore(updated);
    }
  };

  const handleSaveTournament = (updated: Tournament) => {
    const exists = tournaments.some((t) => t.id === updated.id);
    if (exists) {
      setTournaments(tournaments.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      setTournaments([updated, ...tournaments]);
    }
    saveTournamentToFirestore(updated);
    addToast('Tournament Saved', `Updated details for ${updated.name}`);
  };

  // Verification System Handlers
  const handleSubmitVerification = (reqData: any) => {
    const newReq: VerificationRequest = {
      ...reqData,
      id: `vreq-${Date.now()}`,
      applicantUid: user.uid || 'guest',
      feePaid: verificationFee,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setVerificationRequests([newReq, ...verificationRequests]);
    saveVerificationRequestToFirestore(newReq);
    addToast('Application Submitted!', 'Verification application and payment received. Pending admin review.', 'success');
  };

  const handleApproveVerification = (requestId: string, organizerName: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (req) {
      const updatedReq: VerificationRequest = { ...req, status: 'approved', reviewedAt: new Date().toISOString() };
      setVerificationRequests(verificationRequests.map((r) => (r.id === requestId ? updatedReq : r)));
      saveVerificationRequestToFirestore(updatedReq);

      // Mark all tournaments by this organizer as verified
      const updatedTournaments = tournaments.map((t) =>
        t.organizer.trim().toLowerCase() === organizerName.trim().toLowerCase()
          ? { ...t, isVerified: true }
          : t
      );
      setTournaments(updatedTournaments);
      updatedTournaments.forEach((t) => {
        if (t.organizer.trim().toLowerCase() === organizerName.trim().toLowerCase()) {
          saveTournamentToFirestore(t);
        }
      });

      addToast('Badge Approved!', `Verified Organizer badge granted to ${organizerName}`);
    }
  };

  const handleRejectVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (req) {
      const updatedReq: VerificationRequest = { ...req, status: 'rejected', reviewedAt: new Date().toISOString() };
      setVerificationRequests(verificationRequests.map((r) => (r.id === requestId ? updatedReq : r)));
      saveVerificationRequestToFirestore(updatedReq);
      addToast('Application Rejected', `Verification application rejected.`, 'info');
    }
  };

  const handleRemoveVerification = (organizerName: string) => {
    const updatedTournaments = tournaments.map((t) =>
      t.organizer.trim().toLowerCase() === organizerName.trim().toLowerCase()
        ? { ...t, isVerified: false }
        : t
    );
    setTournaments(updatedTournaments);
    updatedTournaments.forEach((t) => {
      if (t.organizer.trim().toLowerCase() === organizerName.trim().toLowerCase()) {
        saveTournamentToFirestore(t);
      }
    });
    addToast('Badge Revoked', `Removed verified badge status from ${organizerName}`, 'info');
  };

  // Derived lists
  const approvedTournaments = tournaments.filter((t) => !t.isPendingApproval);
  const liveTournaments = approvedTournaments.filter((t) => t.status === 'live');
  const upcomingTournaments = approvedTournaments.filter((t) => t.status === 'upcoming');
  const endedTournaments = approvedTournaments.filter((t) => t.status === 'ended');
  const savedTournaments = approvedTournaments.filter((t) => savedIds.includes(t.id));
  const pendingSubmissions = tournaments.filter((t) => t.isPendingApproval);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col font-[#Sora] selection:bg-[#FF7A00] selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedIds.length + customMatches.length}
        user={user}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAuth={() => setShowAuthModal(true)}
        onToggleAdminRole={handleToggleAdminRole}
        onOpenAdminAuth={handleOpenAdminAuth}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <Hero
              tournaments={tournaments}
              onExplore={() => {
                setActiveTab('tournaments');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSubmit={() => {
                setActiveTab('submit');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* SECTION 1: LIVE TOURNAMENTS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white font-[#Sora]">Live In-Play Cups</h2>
                      <p className="text-xs text-gray-400">Ongoing matches right now</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('tournaments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
                  >
                    <span>View All ({approvedTournaments.length})</span>
                  </button>
                </div>

                {liveTournaments.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#12131A] border border-white/5 text-center text-gray-400 text-xs">
                    No Live Tournaments Available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveTournaments.map((t) => (
                      <TournamentCard
                        key={t.id}
                        tournament={t}
                        isSaved={savedIds.includes(t.id)}
                        onToggleSave={handleToggleSave}
                        onViewDetails={setSelectedTournament}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 2: UPCOMING TOURNAMENTS */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white font-[#Sora]">Upcoming Community Tournaments</h2>
                    <p className="text-xs text-gray-400">Open registration and upcoming custom rooms</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('tournaments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
                  >
                    <span>Explore Directory</span>
                  </button>
                </div>

                {upcomingTournaments.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#12131A] border border-white/5 text-center text-gray-400 text-xs">
                    No Upcoming Tournaments
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTournaments.slice(0, 6).map((t) => (
                      <TournamentCard
                        key={t.id}
                        tournament={t}
                        isSaved={savedIds.includes(t.id)}
                        onToggleSave={handleToggleSave}
                        onViewDetails={setSelectedTournament}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 3: ENDED TOURNAMENTS */}
              <section className="space-y-6 pb-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white font-[#Sora]">Recent Completed Cups</h2>
                    <p className="text-xs text-gray-400">Past tournament archives and standings</p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('tournaments');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-[#FF7A00] hover:underline flex items-center gap-1"
                  >
                    <span>Archived Tournaments</span>
                  </button>
                </div>

                {endedTournaments.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#12131A] border border-white/5 text-center text-gray-400 text-xs">
                    No Ended Tournaments
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {endedTournaments.map((t) => (
                      <TournamentCard
                        key={t.id}
                        tournament={t}
                        isSaved={savedIds.includes(t.id)}
                        onToggleSave={handleToggleSave}
                        onViewDetails={setSelectedTournament}
                      />
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        )}

        {/* TOURNAMENT DIRECTORY VIEW */}
        {activeTab === 'tournaments' && (
          <TournamentDirectory
            tournaments={approvedTournaments}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectTournament={setSelectedTournament}
          />
        )}

        {/* MY SCHEDULE VIEW */}
        {activeTab === 'my-tournaments' && (
          <MyTournaments
            savedTournaments={savedTournaments}
            customMatches={customMatches}
            onRemoveSaved={handleToggleSave}
            onAddCustomMatch={handleAddCustomMatch}
            onDeleteCustomMatch={handleDeleteCustomMatch}
            onToggleCompleteMatch={handleToggleCompleteMatch}
            onViewDetails={setSelectedTournament}
            onShowToast={addToast}
          />
        )}

        {/* SUBMIT TOURNAMENT VIEW */}
        {activeTab === 'submit' && (
          <SubmitTournament
            onSubmitTournament={handleSubmitTournament}
            pendingSubmissions={pendingSubmissions}
            onOpenVerificationModal={() => setShowVerificationModal(true)}
            paymentSettings={paymentSettings}
            onShowToast={addToast}
          />
        )}

        {/* ADMIN PANEL VIEW */}
        {activeTab === 'admin' && (
          <AdminPanel
            tournaments={tournaments}
            verificationRequests={verificationRequests}
            verificationFee={verificationFee}
            paymentSettings={paymentSettings}
            isAdminAuthenticated={isAdminAuthenticated}
            onVerifyPasscode={handleVerifyAdminPasscode}
            onLockAdminSession={handleLockAdminSession}
            onChangePasscode={handleChangeAdminPasscode}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
            onDeleteTournament={handleDeleteTournament}
            onUpdateStatus={handleUpdateStatus}
            onToggleVerified={handleToggleVerified}
            onSaveTournament={handleSaveTournament}
            onApproveVerification={handleApproveVerification}
            onRejectVerification={handleRejectVerification}
            onRemoveVerification={handleRemoveVerification}
            onChangeVerificationFee={handleChangeVerificationFee}
            onUpdatePaymentSettings={handleUpdatePaymentSettings}
            onShowToast={addToast}
          />
        )}

      </main>

      {/* Footer */}
      <Footer onNavClick={setActiveTab} tournamentsCount={approvedTournaments.length} />

      {/* Underdog AI Chatbot - Available on every page */}
      <UnderdogChatbot
        tournaments={approvedTournaments}
        savedIds={savedIds}
        customMatches={customMatches}
        onNavClick={setActiveTab}
        onViewTournament={setSelectedTournament}
      />

      {/* MODALS */}
      {selectedTournament && (
        <TournamentDetailModal
          tournament={selectedTournament}
          isSaved={savedIds.includes(selectedTournament.id)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedTournament(null)}
          onShowToast={addToast}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          currentUser={user}
          onShowToast={addToast}
        />
      )}

      {showAdminPasscodeModal && (
        <AdminPasscodeModal
          isOpen={showAdminPasscodeModal}
          onClose={() => setShowAdminPasscodeModal(false)}
          onVerifyPasscode={handleVerifyAdminPasscode}
          onShowToast={addToast}
          onSuccess={() => {
            setShowAdminPasscodeModal(false);
            setActiveTab('admin');
          }}
        />
      )}

      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          paymentSettings={paymentSettings}
          onSubmitApplication={handleSubmitVerification}
          onShowToast={addToast}
          existingStatus={
            verificationRequests.find((r) => r.organizerName.toLowerCase() === user.name.toLowerCase())?.status
          }
        />
      )}

      {/* Toast Notification Queue */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
