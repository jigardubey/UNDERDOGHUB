import React, { useState } from 'react';
import { 
  ShieldCheck, X, CheckCircle2, QrCode, Sparkles, AlertCircle, 
  Building2, Mail, Phone, Link2, ArrowRight, Check, Upload, Copy, FileCheck, Image as ImageIcon
} from 'lucide-react';
import { VerificationRequest, PaymentSettings } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentSettings: PaymentSettings;
  onSubmitApplication: (req: Omit<VerificationRequest, 'id' | 'createdAt' | 'status'>) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  existingStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  paymentSettings,
  onSubmitApplication,
  onShowToast,
  existingStatus
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  // Form Fields
  const [organizerName, setOrganizerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [experience, setExperience] = useState('');
  const [reason, setReason] = useState('');

  // Payment Proof & UTR State
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotError, setScreenshotError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const currentPrice = paymentSettings.isLaunchOfferEnabled 
    ? paymentSettings.launchFee 
    : paymentSettings.regularFee;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOrg = organizerName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedOrg || !trimmedEmail || !trimmedPhone) {
      onShowToast('Missing Fields', 'Please fill in all required fields.', 'error');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      onShowToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }

    if (trimmedPhone.replace(/\D/g, '').length < 8) {
      onShowToast('Invalid Phone', 'Please enter a valid phone or WhatsApp number.', 'error');
      return;
    }

    setStep('payment');
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setScreenshotError('Only JPG, PNG, and WEBP image files are allowed.');
      onShowToast('Invalid File Type', 'Please select a JPG, PNG, or WEBP image file.', 'error');
      return;
    }

    // File size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('File size exceeds 5MB limit.');
      onShowToast('File Too Large', 'Screenshot must be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyUpi = () => {
    if (paymentSettings.upiId) {
      navigator.clipboard.writeText(paymentSettings.upiId);
      setCopiedUpi(true);
      onShowToast('UPI ID Copied', 'Paste in your UPI app to make payment.', 'info');
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!screenshotBase64) {
      setScreenshotError('Payment screenshot is required.');
      onShowToast('Missing Payment Proof', 'Please upload a screenshot of your payment.', 'error');
      return;
    }

    if (!utrNumber.trim()) {
      onShowToast('Missing UTR', 'Please enter the UTR or Transaction ID.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      onSubmitApplication({
        organizerName: organizerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        socialLinks: socialLinks.trim(),
        experience: experience.trim(),
        reason: reason.trim(),
        feePaid: currentPrice,
        paymentScreenshotUrl: screenshotBase64,
        utrNumber: utrNumber.trim(),
        paymentStatus: 'pending'
      });

      setStep('success');
      onShowToast(
        'Application Submitted!', 
        'Payment status: Pending Verification. Admin will review your screenshot and UTR ID.', 
        'success'
      );
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-[#16161D] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shadow-lg shadow-[#FF7A00]/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-extrabold uppercase tracking-widest border border-[#FF7A00]/20 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Verified Organizer Badge</span>
              </div>
              <h3 className="text-xl font-black text-white italic font-[#Sora]">Apply for Verified Badge</h3>
              <p className="text-xs text-white/50">Gain instant community trust, verified badges, and priority search ranking</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-1">

          {/* Status Alert if application exists */}
          {existingStatus && step === 'form' && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Application status: <strong className="uppercase font-extrabold text-white">{existingStatus}</strong></span>
              </div>
              <span className="text-[10px] text-white/50">Admin manual review</span>
            </div>
          )}

          {/* STEP 1: Application Form */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Pricing Box Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF7A00]/10 via-[#16161D] to-[#0B0B0F] border border-[#FF7A00]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#FF7A00] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Special Organizer Verification Offer</span>
                  </div>
                  <p className="text-[11px] text-white/60">Includes official profile badge & priority tournament approval</p>
                </div>

                <div className="text-right">
                  {paymentSettings.isLaunchOfferEnabled ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-400 line-through font-bold">₹{paymentSettings.regularFee}</span>
                      <span className="text-2xl font-black text-[#FF7A00] font-[#Sora]">₹{paymentSettings.launchFee}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-[#FF7A00] font-[#Sora]">₹{paymentSettings.regularFee}</span>
                  )}
                  {paymentSettings.isLaunchOfferEnabled && (
                    <span className="text-[9px] font-extrabold uppercase text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded border border-green-500/30">Launch Offer</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    Organizer / Brand Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder="e.g. Apex Esports Syndicate"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                    />
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    Official Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="organizer@esports.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                    />
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                    />
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    Social & Community Links
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={socialLinks}
                      onChange={(e) => setSocialLinks(e.target.value)}
                      placeholder="Discord, Instagram, YouTube links"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                    />
                    <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                  Tournament Experience
                </label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe past tournaments hosted (e.g. 10+ Free Fire Scrims hosted)..."
                  className="w-full p-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                  Reason for Verification
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why should your organization be granted a Verified Badge on UNDERDOG HUB?"
                  className="w-full p-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

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
                  <span>Proceed to Payment (₹{currentPrice})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: Scan & Pay + Upload Screenshot */}
          {step === 'payment' && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/50 block">Applicant</span>
                  <strong className="text-sm text-white font-bold">{organizerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50 block">Scan & Pay</span>
                  <div className="flex items-baseline gap-2">
                    {paymentSettings.isLaunchOfferEnabled && (
                      <span className="text-xs text-gray-400 line-through">₹{paymentSettings.regularFee}</span>
                    )}
                    <strong className="text-xl text-[#FF7A00] font-black font-[#Sora]">₹{currentPrice}</strong>
                  </div>
                </div>
              </div>

              {/* Scan & Pay QR Code & UPI Details */}
              <div className="p-5 rounded-2xl bg-[#0B0B0F] border border-white/10 text-center space-y-4">
                <h4 className="text-xs font-extrabold text-[#FF7A00] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  <span>Scan & Pay ₹{currentPrice} via Any UPI App</span>
                </h4>

                {/* QR Code Container */}
                <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                  {paymentSettings.qrCodeUrl ? (
                    <img 
                      src={paymentSettings.qrCodeUrl} 
                      alt="Admin UPI QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-2 rounded text-center">
                      <QrCode className="w-16 h-16 text-[#FF7A00] mb-1" />
                      <span className="text-[10px] font-mono text-gray-300">UPI QR READY</span>
                    </div>
                  )}
                </div>

                {/* UPI ID Display & Copy Button */}
                <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                  <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white tracking-wide truncate">
                    UPI ID: <strong>{paymentSettings.upiId || 'underdoghub@upi'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-2 rounded-xl bg-[#FF7A00]/20 hover:bg-[#FF7A00]/30 text-[#FF7A00] border border-[#FF7A00]/40 transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Payment Proof Requirements */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#FF7A00]" />
                  <span>Upload Payment Proof</span>
                </h4>

                {/* UTR / Transaction ID */}
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    UTR / Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 421098374821"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00] font-mono"
                  />
                  <span className="text-[10px] text-white/40 block mt-1">Found in your Google Pay, PhonePe, or Paytm payment receipt</span>
                </div>

                {/* Upload Payment Screenshot */}
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    Payment Screenshot (JPG, PNG, WEBP) *
                  </label>

                  {screenshotBase64 ? (
                    <div className="relative p-3 rounded-xl bg-[#0B0B0F] border border-[#FF7A00]/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={screenshotBase64} 
                          alt="Payment Screenshot Preview" 
                          className="w-12 h-12 object-cover rounded-lg border border-white/10"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">Screenshot Attached</span>
                          <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready for submission
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setScreenshotBase64('')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold border border-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-[#FF7A00] rounded-2xl bg-[#0B0B0F] cursor-pointer transition-colors group">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleScreenshotChange}
                        className="sr-only"
                      />
                      <Upload className="w-8 h-8 text-white/40 group-hover:text-[#FF7A00] mb-2 transition-colors" />
                      <span className="text-xs font-bold text-white mb-0.5">Click to upload payment screenshot</span>
                      <span className="text-[10px] text-white/40">JPG, PNG, or WEBP (Max 5MB)</span>
                    </label>
                  )}

                  {screenshotError && (
                    <p className="text-xs text-red-400 font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{screenshotError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white text-xs font-bold"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-black text-xs shadow-lg shadow-[#FF7A00]/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Submitting Payment Proof...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Submit Verification Application</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Success Status Screen */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mx-auto shadow-lg shadow-yellow-500/10">
                <FileCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                  Payment Status: Pending Verification
                </span>
                <h4 className="text-xl font-bold text-white font-[#Sora]">Application & Proof Submitted!</h4>
              </div>

              <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                Your payment screenshot and UTR (<strong>{utrNumber}</strong>) have been securely logged for Admin Review. Payment does not automatically grant verification. Once Admin approves your receipt, the <strong>Verified Organizer Badge</strong> will appear on your profile and listings.
              </p>

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs shadow-md shadow-[#FF7A00]/20"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
