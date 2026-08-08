export type TournamentStatus = 'live' | 'upcoming' | 'ended';

export type MatchFormat = 'Battle Royale Squad' | 'Battle Royale Duo' | 'Battle Royale Solo' | 'Clash Squad 4v4' | 'Custom Room';

export interface Tournament {
  id: string;
  name: string;
  organizer: string;
  organizerUid?: string;
  isVerified: boolean;
  bannerUrl: string;
  status: TournamentStatus;
  startDate: string; // ISO date string or formatted date
  startTime: string; // e.g. "18:00 IST"
  prizePool: string; // e.g. "₹2,50,000" or "$5,000"
  entryFee: string; // e.g. "Free" or "₹50/Squad"
  registrationUrl: string;
  matchFormat: MatchFormat;
  description: string;
  rules: string[];
  slotsTotal: number;
  slotsFilled: number;
  featured?: boolean;
  isPendingApproval?: boolean;
  submittedAt?: string;
}

export interface CustomMatch {
  id: string;
  tournamentName: string;
  organizer?: string;
  matchDate: string;
  matchTime: string;
  notes?: string;
  isCompleted?: boolean;
  createdAt: string;
}

export type UserRole = 'guest' | 'user' | 'player' | 'organizer' | 'verified_organizer' | 'admin';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  inGameId?: string;
  squadName?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id?: string;
  type: string;
  message: string;
  userUid?: string;
  userEmail?: string;
  timestamp: string;
}

export interface VerificationRequest {
  id: string;
  applicantUid?: string;
  organizerName: string;
  email: string;
  phone: string;
  socialLinks?: string;
  experience?: string;
  reason?: string;
  feePaid: number;
  paymentScreenshotUrl?: string;
  utrNumber: string;
  paymentStatus: 'pending' | 'completed' | 'rejected';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface PaymentSettings {
  upiId: string;
  qrCodeUrl?: string;
  regularFee: number;
  launchFee: number;
  isLaunchOfferEnabled: boolean;
}

export interface FilterState {
  searchQuery: string;
  status: 'all' | 'live' | 'upcoming' | 'ended';
  format: 'all' | MatchFormat;
  feeType: 'all' | 'free' | 'paid';
  verifiedOnly: boolean;
}
