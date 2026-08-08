import { Tournament, CustomMatch, UserProfile, VerificationRequest, PaymentSettings } from '../types';
import { INITIAL_TOURNAMENTS } from '../data/mockTournaments';
import { DEFAULT_PAYMENT_SETTINGS } from './constants';

const TOURNAMENTS_KEY = 'underdog_tournaments_v1';
const SAVED_IDS_KEY = 'underdog_saved_ids_v1';
const CUSTOM_MATCHES_KEY = 'underdog_custom_matches_v1';
const USER_PROFILE_KEY = 'underdog_user_profile_v1';
const VERIFICATION_REQUESTS_KEY = 'underdog_verification_requests_v1';
const VERIFICATION_FEE_KEY = 'underdog_verification_fee_v1';
const PAYMENT_SETTINGS_KEY = 'underdog_payment_settings_v1';

export function getStoredTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(TOURNAMENTS_KEY);
    if (!raw) {
      return INITIAL_TOURNAMENTS;
    }
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : INITIAL_TOURNAMENTS;
  } catch (e) {
    console.error('Failed to parse stored tournaments:', e);
    return INITIAL_TOURNAMENTS;
  }
}

export function saveStoredTournaments(tournaments: Tournament[]): void {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
  } catch (e) {
    console.error('Failed to save tournaments:', e);
  }
}

export function getSavedTournamentIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSavedTournamentIds(ids: string[]): void {
  try {
    localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save saved tournament ids:', e);
  }
}

export function getCustomMatches(): CustomMatch[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MATCHES_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomMatches(matches: CustomMatch[]): void {
  try {
    localStorage.setItem(CUSTOM_MATCHES_KEY, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save custom matches:', e);
  }
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    id: 'user-default',
    name: 'Esports Player',
    email: 'player@underdoghub.com',
    role: 'player',
    inGameId: '',
    squadName: ''
  };
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

const ADMIN_PASSCODE_KEY = 'underdog_admin_passcode_v1';

export function getAdminPasscode(): string {
  try {
    const raw = localStorage.getItem(ADMIN_PASSCODE_KEY);
    if (!raw || raw === 'admin123') return '1451';
    return raw;
  } catch {
    return '1451';
  }
}

export function saveAdminPasscode(passcode: string): void {
  try {
    localStorage.setItem(ADMIN_PASSCODE_KEY, passcode);
  } catch (e) {
    console.error('Failed to save admin passcode:', e);
  }
}

export function getPaymentSettings(): PaymentSettings {
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse payment settings:', e);
  }
  return DEFAULT_PAYMENT_SETTINGS;
}

export function savePaymentSettings(settings: PaymentSettings): void {
  try {
    localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save payment settings:', e);
  }
}

export function getVerificationFee(): number {
  try {
    const settings = getPaymentSettings();
    return settings.isLaunchOfferEnabled ? settings.launchFee : settings.regularFee;
  } catch {
    return 49;
  }
}

export function saveVerificationFee(fee: number): void {
  try {
    localStorage.setItem(VERIFICATION_FEE_KEY, fee.toString());
  } catch (e) {
    console.error('Failed to save verification fee:', e);
  }
}

export function getVerificationRequests(): VerificationRequest[] {
  try {
    const raw = localStorage.getItem(VERIFICATION_REQUESTS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveVerificationRequests(requests: VerificationRequest[]): void {
  try {
    localStorage.setItem(VERIFICATION_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save verification requests:', e);
  }
}

// Generate an .ics calendar file for reminders
export function downloadIcsCalendar(title: string, dateStr: string, timeStr: string, description: string) {
  try {
    // parse date/time into ICS format YYYYMMDDTHHMMSSZ
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = timeStr.replace(/[^0-9]/g, '').slice(0, 4) || '1800';
    const startIso = `${cleanDate}T${cleanTime}00`;
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UNDERDOG HUB//Free Fire Match Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:🎮 Free Fire Match: ${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `DTSTART:${startIso}`,
      `DTEND:${startIso}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${title} starts in 15 minutes!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Failed to generate ICS file:', e);
  }
}
