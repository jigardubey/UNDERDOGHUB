import { PaymentSettings } from '../types';

export const DEFAULT_UNDERDOG_BANNER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="100%" height="100%" fill="%2312131A"/><rect x="0" y="0" width="800" height="400" fill="url(%23grad)" opacity="0.2"/><defs><radialGradient id="grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23FF7A00"/><stop offset="100%" stop-color="%230B0B0F"/></radialGradient></defs><g transform="translate(400,200)" text-anchor="middle"><text y="-10" font-family="sans-serif" font-weight="900" font-size="32" fill="%23FF7A00" letter-spacing="4">UNDERDOG HUB</text><text y="25" font-family="sans-serif" font-weight="700" font-size="14" fill="%23FFFFFF" opacity="0.6" letter-spacing="2">OFFICIAL FREE FIRE TOURNAMENT</text></g></svg>`;

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: 'underdoghub@upi',
  qrCodeUrl: '',
  regularFee: 199,
  launchFee: 49,
  isLaunchOfferEnabled: true
};
