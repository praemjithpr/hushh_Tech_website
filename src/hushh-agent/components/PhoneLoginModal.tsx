/**
 * Phone Login Modal for Hushh Agent
 * Beautiful UI for phone number input and OTP verification
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePhoneAuth, type AuthStep } from '../hooks/usePhoneAuth';

// Country codes for dropdown
const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

interface PhoneLoginModalProps {
  onSuccess?: () => void;
}

const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({ onSuccess }) => {
  const {
    isLoading,
    error,
    step,
    isConfigured,
    requestOTP,
    confirmOTP,
    clearError,
    resetToPhoneStep,
  } = usePhoneAuth();

  // Phone input state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // OTP input state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle phone number submission
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      return;
    }
    
    const fullNumber = `${countryCode}${phoneNumber}`;
    const success = await requestOTP(fullNumber);
    
    if (success) {
      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').slice(0, 6);
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  // Handle OTP keydown
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    const success = await confirmOTP(otpString);
    if (success) {
      onSuccess?.();
    }
  };

  // Auto-verify when OTP is complete
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === 6 && step === 'otp' && !isLoading) {
      handleVerifyOTP();
    }
  }, [otp, step, isLoading]);

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202] p-6">
        <div className="max-w-md w-full glass rounded-[48px] p-10 text-center border border-white/10">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-4xl text-amber-500"></i>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Configuration Required
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Phone authentication is not configured. Please add Firebase configuration to enable this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020202] p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Logo */}
      <div className="mb-12 text-center relative z-10">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-white/5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/50 font-black">
            hushh Sovereign • Neural Matrix
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
          Access the Collective
        </h1>
        <p className="text-white/40 text-sm max-w-sm">
          Verify your identity to unlock the hushh Sovereign agents
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md glass rounded-[48px] p-10 border border-white/10 relative z-10">
        
        {/* Phone Step */}
        {step === 'phone' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <i className="fas fa-mobile-alt text-3xl text-blue-400"></i>
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-2">
                Enter Phone Number
              </h2>
              <p className="text-white/40 text-sm">
                We'll send you a verification code
              </p>
            </div>

            {/* Phone Input */}
            <div className="space-y-4">
              <div className="flex gap-3">
                {/* Country Code Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="h-14 px-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xl">
                      {COUNTRY_CODES.find(c => c.code === countryCode)?.flag}
                    </span>
                    <span className="text-white font-medium">{countryCode}</span>
                    <i className="fas fa-chevron-down text-white/30 text-xs"></i>
                  </button>

                  {showCountryPicker && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl z-50 max-h-64 overflow-y-auto">
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setCountryCode(country.code);
                            setShowCountryPicker(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="text-white/70 text-sm flex-1 text-left">{country.country}</span>
                          <span className="text-white/40 text-sm">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors text-lg tracking-wider"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <i className="fas fa-exclamation-circle text-red-400"></i>
                  <span className="text-red-300 text-sm">{error}</span>
                  <button
                    onClick={clearError}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={isLoading || phoneNumber.length < 10}
              className="w-full py-5 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black uppercase tracking-[0.3em] text-sm hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <i className="fas fa-shield-alt text-3xl text-green-400"></i>
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-2">
                Enter Verification Code
              </h2>
              <p className="text-white/40 text-sm">
                Code sent to {countryCode} {phoneNumber}
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-14 md:w-14 md:h-16 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-2xl font-bold focus:outline-none focus:border-green-500/50 transition-colors"
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <i className="fas fa-exclamation-circle text-red-400"></i>
                <span className="text-red-300 text-sm">{error}</span>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-5 rounded-3xl bg-gradient-to-r from-green-600 to-green-500 text-white font-black uppercase tracking-[0.3em] text-sm hover:from-green-500 hover:to-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Access</span>
                    <i className="fas fa-unlock"></i>
                  </>
                )}
              </button>

              <button
                onClick={resetToPhoneStep}
                className="w-full py-4 rounded-2xl text-white/50 text-sm hover:text-white transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Change Phone Number
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-white/20 text-[10px] uppercase tracking-[0.3em] text-center relative z-10">
        Secured by hushh Neural Architecture
      </p>
    </div>
  );
};

export default PhoneLoginModal;
