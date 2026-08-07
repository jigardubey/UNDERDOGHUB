import React, { useState } from 'react';
import { 
  ShieldCheck, X, CheckCircle2, QrCode, CreditCard, Sparkles, AlertCircle, 
  Building2, Mail, Phone, Link2, Award, HelpCircle, ArrowRight, Check
} from 'lucide-react';
import { VerificationRequest } from '../types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationFee: number;
  onSubmitApplication: (req: Omit<VerificationRequest, 'id' | 'createdAt' | 'status'>) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  existingStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  verificationFee,
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

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'qr' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedOrg = organizerName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedOrg || !trimmedEmail || !trimmedPhone || !experience.trim() || !reason.trim()) {
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

  const handlePayAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      onSubmitApplication({
        organizerName,
        email,
        phone,
        socialLinks,
        experience,
        reason,
        feePaid: verificationFee,
        paymentStatus: 'completed'
      });

      setStep('success');
      onShowToast(
        'Payment Completed!', 
        `Payment of ₹${verificationFee} successful. Application status: Payment Completed → Pending Review.`, 
        'success'
      );
    }, 1500);
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
                <span>Organizer Verification</span>
              </div>
              <h3 className="text-xl font-black text-white italic font-[#Sora]">Apply for Verified Organizer Badge</h3>
              <p className="text-xs text-white/50">Build player trust, get verified badges, and unlock priority listing</p>
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

          {/* If already submitted */}
          {existingStatus && step === 'form' && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Your application status: <strong className="uppercase font-extrabold text-white">{existingStatus}</strong></span>
              </div>
              <span className="text-[10px] text-white/50">Admin review in progress</span>
            </div>
          )}

          {/* STEP 1: Application Form */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
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
                  Tournament Experience *
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={2}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Describe tournaments you have organized (e.g. 10+ Free Fire Scrims hosted, total prize pool distributed)..."
                    className="w-full p-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                  Reason for Verification *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why should your organization be verified on UNDERDOG HUB?"
                  className="w-full p-3 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              {/* Fee Notice Box */}
              <div className="p-4 rounded-xl bg-[#0B0B0F] border border-[#FF7A00]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase font-mono">Verification Fee</div>
                  <div className="text-[11px] text-white/50">One-time processing & admin review fee</div>
                </div>
                <div className="text-xl font-black text-[#FF7A00]">₹{verificationFee}</div>
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
                  <span>Proceed to Payment (₹{verificationFee})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: Payment Gateway */}
          {step === 'payment' && (
            <form onSubmit={handlePayAndSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/50 block">Applicant</span>
                  <strong className="text-sm text-white font-bold">{organizerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50 block">Amount Payable</span>
                  <strong className="text-lg text-[#FF7A00] font-black">₹{verificationFee}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00]'
                        : 'bg-[#0B0B0F] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>UPI Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'qr'
                        ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00]'
                        : 'bg-[#0B0B0F] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Scan QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#FF7A00]/20 border-[#FF7A00] text-[#FF7A00]'
                        : 'bg-[#0B0B0F] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Card / NetBanking</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Enter UPI ID (GPay / PhonePe / Paytm)</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. organizer@okaxis"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="p-4 rounded-xl bg-[#0B0B0F] border border-white/10 text-center space-y-2">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-black" />
                  </div>
                  <p className="text-xs text-white/60">Scan with any UPI App to pay <strong>₹{verificationFee}</strong></p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number (4000 0000 0000 0000)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white text-xs font-bold"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-6 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black font-black text-xs shadow-lg shadow-[#FF7A00]/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Pay ₹{verificationFee} & Submit</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-[#Sora]">Payment Completed → Pending Review</h4>
              <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                Thank you! Your payment of <strong>₹{verificationFee}</strong> was received successfully. Your verification request is now <strong>Pending Admin Review</strong>. Once approved, the Verified Badge will automatically display on your organizer profile and all your tournament listings.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#FF7A00] text-black font-extrabold text-xs shadow-md shadow-[#FF7A00]/20"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
