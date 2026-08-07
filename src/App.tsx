import React, { useState, useEffect } from 'react';
import { Tournament, CustomMatch, UserProfile, VerificationRequest } from './types';
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
  saveVerificationFee
} from './lib/storage';

import {
  auth,
  onAuthStateChanged,
  FirebaseUser
} from './lib/firebase';

import {
  subscribeTournamentsDb,
  saveTournamentToDb,
  deleteTournamentFromDb,
  subscribeVerificationRequestsDb,
  saveVerificationRequestToDb,
  subscribeSettingsDb,
  saveSettingsToDb,
  subscribeUserProfileDb,
  saveUserProfileToDb,
  subscribeUserSavedDataDb,
  saveUserSavedDataToDb,
  logActivityToDb
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

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Verification System State
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(getVerificationRequests);
  const [verificationFee, setVerificationFee] = useState<number>(getVerificationFee);

  // Private Admin Security State
  const [adminPasscode, setAdminPasscode] = useState<string>(getAdminPasscode);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState<boolean>(false);

  // 1. FIREBASE AUTHENTICATION LISTENER
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Sync user profile with Firestore
        const defaultProfile: UserProfile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || user.name || 'Gamer_' + fbUser.uid.substring(0, 5),
          email: fbUser.email || '',
          role: user.role === 'admin' ? 'admin' : 'player',
          inGameId: user.inGameId || '',
          squadName: user.squadName || '',
          createdAt: new Date().toISOString()
        };
        setUser((prev) => ({ ...prev, id: fbUser.uid, uid: fbUser.uid, email: fbUser.email || prev.email }));
        saveUserProfileToDb(defaultProfile);

        // Subscribe to user saved data in Firestore
        const unsubUserData = subscribeUserSavedDataDb(fbUser.uid, (data) => {
          if (data.savedIds) setSavedIds(data.savedIds);
          if (data.customMatches) setCustomMatches(data.customMatches);
        });

        // Subscribe to user profile changes
        const unsubProfile = subscribeUserProfileDb(fbUser.uid, (prof) => {
          if (prof) setUser(prof);
        });

        return () => {
          unsubUserData();
          unsubProfile();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. FIRESTORE REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    // Subscribe to Tournaments Collection
    const unsubTournaments = subscribeTournamentsDb((dbTournaments) => {
      if (dbTournaments && dbTournaments.length > 0) {
        setTournaments(dbTournaments);
        saveStoredTournaments(dbTournaments);
      } else if (tournaments.length > 0) {
        // Seed initial tournaments to Firestore if empty
        tournaments.forEach((t) => saveTournamentToDb(t));
      }
    });

    // Subscribe to Verification Requests Collection
    const unsubVerifications = subscribeVerificationRequestsDb((dbVerifications) => {
      if (dbVerifications) {
        setVerificationRequests(dbVerifications);
        saveVerificationRequests(dbVerifications);
      }
    });

    // Subscribe to Settings Collection (Fee & Admin Passcode)
    const unsubSettings = subscribeSettingsDb((data) => {
      if (data.verificationFee) {
        setVerificationFee(data.verificationFee);
        saveVerificationFee(data.verificationFee);
      }
      if (data.adminPasscode) {
        setAdminPasscode(data.adminPasscode);
        saveAdminPasscode(data.adminPasscode);
      }
    });

    return () => {
      unsubTournaments();
      unsubVerifications();
      unsubSettings();
    };
  }, []);

  // 3. PERSISTENT STORAGE FALLBACK CACHING
  useEffect(() => {
    saveStoredTournaments(tournaments);
  }, [tournaments]);

  useEffect(() => {
    saveSavedTournamentIds(savedIds);
    if (firebaseUser) {
      saveUserSavedDataToDb(firebaseUser.uid, savedIds, customMatches);
    }
  }, [savedIds]);

  useEffect(() => {
    saveCustomMatches(customMatches);
    if (firebaseUser) {
      saveUserSavedDataToDb(firebaseUser.uid, savedIds, customMatches);
    }
  }, [customMatches]);

  useEffect(() => {
    saveUserProfile(user);
    if (firebaseUser) {
      saveUserProfileToDb(user);
    }
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
    if (firebaseUser) {
      saveUserSavedDataToDb(firebaseUser.uid, newSavedIds, customMatches);
    }
  };

  // Admin Verification & Security Handlers
  const handleVerifyAdminPasscode = (inputPasscode: string): boolean => {
    if (inputPasscode === adminPasscode) {
      setIsAdminAuthenticated(true);
      setUser((prev) => ({ ...prev, role: 'admin' }));
      logActivityToDb('ADMIN_LOGIN', 'Admin authenticated with passcode', firebaseUser?.uid, user.email);
      addToast('Admin Access Granted', 'Welcome to the Admin Control Panel.');
      return true;
    }
    logActivityToDb('FAILED_ADMIN_LOGIN', 'Incorrect passcode attempt', firebaseUser?.uid, user.email);
    return false;
  };

  const handleChangeAdminPasscode = (newPasscode: string) => {
    setAdminPasscode(newPasscode);
    saveAdminPasscode(newPasscode);
    saveSettingsToDb({ adminPasscode: newPasscode });
    logActivityToDb('CHANGE_ADMIN_PASSCODE', 'Admin passcode updated', firebaseUser?.uid, user.email);
    addToast('Passcode Updated', 'Private Admin Passcode has been changed.', 'success');
  };

  const handleLockAdminSession = () => {
    setIsAdminAuthenticated(false);
    setUser((prev) => ({ ...prev, role: 'player' }));
    logActivityToDb('ADMIN_LOGOUT', 'Admin session locked', firebaseUser?.uid, user.email);
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
    saveSettingsToDb({ verificationFee: newFee });
    logActivityToDb('CHANGE_FEE', `Verification fee changed to ₹${newFee}`, firebaseUser?.uid, user.email);
    addToast('Verification Fee Updated', `New badge verification fee set to ₹${newFee}`);
  };

  // Custom Match Handlers
  const handleAddCustomMatch = (newMatch: Omit<CustomMatch, 'id' | 'createdAt'>) => {
    const created: CustomMatch = {
      ...newMatch,
      id: `cm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...customMatches];
    setCustomMatches(updated);
    if (firebaseUser) {
      saveUserSavedDataToDb(firebaseUser.uid, savedIds, updated);
    }
  };

  const handleDeleteCustomMatch = (id: string) => {
    const updated = customMatches.filter((m) => m.id !== id);
    setCustomMatches(updated);
    if (firebaseUser) {
      saveUserSavedDataToDb(firebaseUser.uid, savedIds, updated);
    }
    addToast('Deleted', 'Custom match entry removed.');
  };

  const handleToggleCompleteMatch = (id: string) => {
    const updated = customMatches.map((m) => (m.id === id ? { ...m, isCompleted: !m.isCompleted } : m));
    setCustomMatches(updated);
    if (firebaseUser) {
      saveUserSavedDataToDb(firebaseUser.uid, savedIds, updated);
    }
  };

  // Submission Handler
  const handleSubmitTournament = (newT: Omit<Tournament, 'id' | 'slotsFilled' | 'isVerified'>) => {
    const created: Tournament = {
      ...newT,
      id: `sub-${Date.now()}`,
      organizerUid: firebaseUser?.uid || 'guest',
      slotsFilled: 0,
      isVerified: false,
      isPendingApproval: true
    };
    setTournaments([created, ...tournaments]);
    saveTournamentToDb(created);
    logActivityToDb('SUBMIT_TOURNAMENT', `Tournament "${created.name}" submitted by ${created.organizer}`, firebaseUser?.uid, user.email);
  };

  // Admin Actions
  const handleApproveSubmission = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, isPendingApproval: false };
      setTournaments(tournaments.map((t) => (t.id === id ? updated : t)));
      saveTournamentToDb(updated);
      logActivityToDb('APPROVE_TOURNAMENT', `Approved tournament "${target.name}"`, firebaseUser?.uid, user.email);
      addToast('Tournament Approved!', `"${target.name}" is now live on the platform.`);
    }
  };

  const handleRejectSubmission = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    setTournaments(tournaments.filter((t) => t.id !== id));
    deleteTournamentFromDb(id);
    if (target) {
      logActivityToDb('REJECT_TOURNAMENT', `Rejected tournament "${target.name}"`, firebaseUser?.uid, user.email);
    }
    addToast('Submission Rejected', 'Tournament removed from queue.', 'info');
  };

  const handleDeleteTournament = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    setTournaments(tournaments.filter((t) => t.id !== id));
    deleteTournamentFromDb(id);
    if (target) {
      logActivityToDb('DELETE_TOURNAMENT', `Deleted tournament "${target.name}"`, firebaseUser?.uid, user.email);
    }
    addToast('Deleted', 'Tournament permanently removed from directory.', 'info');
  };

  const handleUpdateStatus = (id: string, status: 'live' | 'upcoming' | 'ended') => {
    const target = tournaments.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, status };
      setTournaments(tournaments.map((t) => (t.id === id ? updated : t)));
      saveTournamentToDb(updated);
      logActivityToDb('UPDATE_STATUS', `Updated status of "${target.name}" to ${status}`, firebaseUser?.uid, user.email);
    }
  };

  const handleToggleVerified = (id: string) => {
    const target = tournaments.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, isVerified: !target.isVerified };
      setTournaments(tournaments.map((t) => (t.id === id ? updated : t)));
      saveTournamentToDb(updated);
      logActivityToDb('TOGGLE_VERIFIED', `Toggled verification for "${target.name}"`, firebaseUser?.uid, user.email);
    }
  };

  const handleSaveTournament = (updated: Tournament) => {
    const exists = tournaments.some((t) => t.id === updated.id);
    if (exists) {
      setTournaments(tournaments.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      setTournaments([updated, ...tournaments]);
    }
    saveTournamentToDb(updated);
    logActivityToDb('SAVE_TOURNAMENT', `Saved edits for "${updated.name}"`, firebaseUser?.uid, user.email);
    addToast('Tournament Saved', `Updated details for ${updated.name}`);
  };

  // Verification System Handlers
  const handleSubmitVerification = (reqData: any) => {
    const newReq: VerificationRequest = {
      ...reqData,
      id: `vreq-${Date.now()}`,
      applicantUid: firebaseUser?.uid || 'guest',
      feePaid: verificationFee,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setVerificationRequests([newReq, ...verificationRequests]);
    saveVerificationRequestToDb(newReq);
    logActivityToDb('SUBMIT_VERIFICATION', `Verification requested for ${newReq.organizerName}`, firebaseUser?.uid, user.email);
    addToast('Application Submitted!', 'Verification application and payment received. Pending admin review.', 'success');
  };

  const handleApproveVerification = (requestId: string, organizerName: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (req) {
      const updatedReq: VerificationRequest = { ...req, status: 'approved', reviewedAt: new Date().toISOString() };
      setVerificationRequests(verificationRequests.map((r) => (r.id === requestId ? updatedReq : r)));
      saveVerificationRequestToDb(updatedReq);

      // Mark all tournaments by this organizer as verified
      const updatedTournaments = tournaments.map((t) =>
        t.organizer.trim().toLowerCase() === organizerName.trim().toLowerCase()
          ? { ...t, isVerified: true }
          : t
      );
      setTournaments(updatedTournaments);
      updatedTournaments.forEach((t) => {
        if (t.organizer.trim().toLowerCase() === organizerName.trim().toLowerCase()) {
          saveTournamentToDb(t);
        }
      });

      logActivityToDb('APPROVE_VERIFICATION', `Approved verification for ${organizerName}`, firebaseUser?.uid, user.email);
      addToast('Badge Approved!', `Verified Organizer badge granted to ${organizerName}`);
    }
  };

  const handleRejectVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (req) {
      const updatedReq: VerificationRequest = { ...req, status: 'rejected', reviewedAt: new Date().toISOString() };
      setVerificationRequests(verificationRequests.map((r) => (r.id === requestId ? updatedReq : r)));
      saveVerificationRequestToDb(updatedReq);
      logActivityToDb('REJECT_VERIFICATION', `Rejected verification for ${req.organizerName}`, firebaseUser?.uid, user.email);
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
        saveTournamentToDb(t);
      }
    });
    logActivityToDb('REMOVE_VERIFICATION', `Revoked verification badge from ${organizerName}`, firebaseUser?.uid, user.email);
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
              onOpenVerificationModal={() => setShowVerificationModal(true)}
              verificationFee={verificationFee}
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
        {activeTab === 'my-schedule' && (
          <MyTournaments
            savedTournaments={savedTournaments}
            customMatches={customMatches}
            onToggleSave={handleToggleSave}
            onAddCustomMatch={handleAddCustomMatch}
            onDeleteCustomMatch={handleDeleteCustomMatch}
            onToggleCompleteMatch={handleToggleCompleteMatch}
            onViewDetails={setSelectedTournament}
            onExploreClick={() => setActiveTab('tournaments')}
          />
        )}

        {/* SUBMIT TOURNAMENT VIEW */}
        {activeTab === 'submit' && (
          <SubmitTournament
            onSubmitTournament={handleSubmitTournament}
            pendingSubmissions={pendingSubmissions}
            onOpenVerificationModal={() => setShowVerificationModal(true)}
            verificationFee={verificationFee}
            onShowToast={addToast}
          />
        )}

        {/* ADMIN PANEL VIEW */}
        {activeTab === 'admin' && (
          <AdminPanel
            tournaments={tournaments}
            verificationRequests={verificationRequests}
            verificationFee={verificationFee}
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
          user={user}
          firebaseUser={firebaseUser}
          onSaveProfile={(updated) => {
            setUser(updated);
            if (firebaseUser) {
              saveUserProfileToDb(updated);
            }
          }}
          onClose={() => setShowAuthModal(false)}
          onShowToast={addToast}
        />
      )}

      {showAdminPasscodeModal && (
        <AdminPasscodeModal
          isOpen={showAdminPasscodeModal}
          onClose={() => setShowAdminPasscodeModal(false)}
          onVerify={handleVerifyAdminPasscode}
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
          verificationFee={verificationFee}
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
