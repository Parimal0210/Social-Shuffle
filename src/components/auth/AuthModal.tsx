import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Dices,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  UserCheck,
  KeyRound,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialShuffleIcon } from '../SocialShuffleLogo';
import { GoogleUserProfile } from '../../types';
import { api } from '../../services/api';

// Official Google 'G' Multicolor Logo
const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const DEVICE_ACCOUNTS_STORAGE_KEY = 'social_shuffle_device_google_accounts';

const DEFAULT_DEVICE_ACCOUNTS: GoogleUserProfile[] = [
  {
    email: 'parimalmshete@gmail.com',
    name: 'Parimal Shete',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    area: 'Koregaon Park',
    phone: '+91 98220 99887'
  },
  {
    email: 'parimal.work@gmail.com',
    name: 'Parimal Shete (Work)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    area: 'Baner',
    phone: '+91 98220 55443'
  },
  {
    email: 'rohan.kulkarni@gmail.com',
    name: 'Rohan Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    area: 'Kothrud',
    phone: '+91 98220 12345'
  }
];

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    registerParticipant,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    signUpWithGoogle,
    continueWithGoogle
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // Registration multi-step state: 'form' -> 'otp_verify'
  const [regStep, setRegStep] = useState<'form' | 'otp_verify'>('form');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Google Chooser state
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleChooserMode, setGoogleChooserMode] = useState<'login' | 'register'>('login');
  const [deviceAccounts, setDeviceAccounts] = useState<GoogleUserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(DEVICE_ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_DEVICE_ACCOUNTS;
  });

  const [registeredEmails, setRegisteredEmails] = useState<string[]>([]);
  const [unregisteredAccountNotice, setUnregisteredAccountNotice] = useState<GoogleUserProfile | null>(null);

  // Custom Google account form state inside chooser
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGooglePhone, setCustomGooglePhone] = useState('');
  const [customGoogleArea, setCustomGoogleArea] = useState('Koregaon Park');
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regArea, setRegArea] = useState('Koregaon Park');
  const [regBio, setRegBio] = useState('');

  // 60-second OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (regStep === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [regStep, otpTimer]);

  // Fetch device accounts and registered status from backend
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await api.getGoogleDeviceAccounts();
        if (isMounted && data) {
          if (data.registeredEmails && Array.isArray(data.registeredEmails)) {
            setRegisteredEmails(data.registeredEmails.map(e => e.toLowerCase()));
          }
          if (data.accounts && data.accounts.length > 0) {
            setDeviceAccounts(prev => {
              const merged = [...prev];
              data.accounts.forEach((acc: any) => {
                if (!merged.some(m => m.email.toLowerCase() === acc.email.toLowerCase())) {
                  merged.push(acc);
                }
              });
              try {
                localStorage.setItem(DEVICE_ACCOUNTS_STORAGE_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch {}
    })();
    return () => {
      isMounted = false;
    };
  }, [showAuthModal]);

  // Keep activeTab in sync with context
  useEffect(() => {
    setActiveTab(authModalMode);
    setError(null);
    setShowGoogleChooser(false);
    setRegStep('form');
    setOtpDigits(['', '', '', '', '', '']);
  }, [authModalMode, showAuthModal]);

  if (!showAuthModal) return null;

  const puneAreas = [
    'Koregaon Park',
    'Baner',
    'Viman Nagar',
    'Kothrud',
    'FC Road / Deccan',
    'Aundh',
    'Wakad / Hinjewadi',
    'Kalyani Nagar',
    'Magarpatta / Hadapsar',
    'Camp / Bund Garden',
    'Bavdhan',
    'Other'
  ];

  // Open Google Chooser for specific flow
  const handleOpenGoogleChooser = (mode: 'login' | 'register') => {
    setGoogleChooserMode(mode);
    setError(null);
    setShowGoogleChooser(true);
    setShowAddAccountForm(false);
  };

  // User selects an account from the list of logged-in Google accounts
  const handleAccountSelection = async (account: GoogleUserProfile) => {
    setError(null);
    setLoading(true);

    if (googleChooserMode === 'register') {
      // 1. SIGN UP WITH GOOGLE ACCOUNT
      setLoadingMessage(`Registering ${account.name} via Google...`);
      try {
        const res = await signUpWithGoogle(account);
        setLoading(false);
        if (!res.success) {
          setError(res.message);
        } else {
          setRegisteredEmails(prev => [...prev, account.email.toLowerCase()]);
          setShowGoogleChooser(false);
        }
      } catch {
        setLoading(false);
        setError('Failed to complete Google registration. Please try again.');
      }
    } else {
      // 2. CONTINUE WITH GOOGLE (LOGIN)
      setLoadingMessage(`Verifying ${account.email}...`);
      try {
        const res = await continueWithGoogle(account);
        setLoading(false);

        if (!res.success) {
          if (res.code === 'USER_NOT_REGISTERED' || res.message === 'Username not registered') {
            setError('Username not registered');
            setUnregisteredAccountNotice(account);
            setShowGoogleChooser(false);

            setActiveTab('register');
            setAuthModalMode('register');
            setRegStep('form');

            setRegName(account.name);
            setRegEmail(account.email);
            setRegPhone(account.phone || '');
            if (account.area) setRegArea(account.area);
          } else {
            setError(res.message || 'Unable to sign in with Google');
          }
        } else {
          setShowGoogleChooser(false);
        }
      } catch {
        setLoading(false);
        setError('Failed to authenticate with Google. Please try again.');
      }
    }
  };

  // Add another Google account on this device
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleName.trim()) {
      setError('Please provide full name and Google email address');
      return;
    }

    const cleanEmail = customGoogleEmail.trim().toLowerCase();
    const cleanName = customGoogleName.trim();
    const newAccount: GoogleUserProfile = {
      email: cleanEmail,
      name: cleanName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      area: customGoogleArea,
      phone: customGooglePhone.trim() || '+91 98220 ' + Math.floor(10000 + Math.random() * 90000)
    };

    setDeviceAccounts(prev => {
      const updated = prev.filter(a => a.email.toLowerCase() !== cleanEmail);
      const nextList = [newAccount, ...updated];
      try {
        localStorage.setItem(DEVICE_ACCOUNTS_STORAGE_KEY, JSON.stringify(nextList));
      } catch {}
      return nextList;
    });

    api.addGoogleDeviceAccount(newAccount).catch(() => {});
    handleAccountSelection(newAccount);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setLoadingMessage('Signing in...');
    setError(null);

    const res = await login({
      emailOrPhone: loginIdentifier.trim(),
      password: loginPassword
    });

    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  // --- Step 1: User submits Participant Registration Form ---
  // Triggers sending 6-digit OTP to user's email address
  const handleInitiateEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setError('Please enter a valid email address (e.g. yourname@example.com)');
      return;
    }
    if (!regPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // STRICT ACCESS CONTROL: Registration is strictly for participants
    const cleanMail = regEmail.trim().toLowerCase();
    if (cleanMail === 'admin@socialshuffle.com' || cleanMail.includes('admin@') || regPhone.trim().replace(/[^0-9]/g, '') === '9822011223') {
      setError('Administrator accounts cannot be registered from the application. Please sign in via the Sign In tab.');
      return;
    }

    // If email is already verified, proceed to finish registration
    if (isEmailVerified) {
      await handleCompleteRegistration();
      return;
    }

    setOtpSending(true);
    setError(null);

    try {
      const res = await sendRegistrationOtp(cleanMail, regName.trim());
      setOtpSending(false);

      if (res.success) {
        setOtpPreview(res.otpPreview || null);
        setOtpTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        setRegStep('otp_verify');
        // Auto-focus first digit input after transition
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(res.message || 'Failed to dispatch verification email');
      }
    } catch {
      setOtpSending(false);
      setError('Could not send verification email. Please check internet connection.');
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (otpTimer > 0 || otpSending) return;
    setOtpSending(true);
    setError(null);

    try {
      const res = await sendRegistrationOtp(regEmail.trim().toLowerCase(), regName.trim());
      setOtpSending(false);
      if (res.success) {
        setOtpPreview(res.otpPreview || null);
        setOtpTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        setError(res.message);
      }
    } catch {
      setOtpSending(false);
      setError('Failed to resend verification OTP');
    }
  };

  // Handle individual digit input in OTP boxes
  const handleOtpDigitChange = (index: number, value: string) => {
    // Handle paste of full 6 digits
    if (value.length > 1) {
      const cleaned = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (cleaned.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || '';
        }
        setOtpDigits(newDigits);
        const nextFocus = Math.min(cleaned.length, 5);
        otpInputRefs.current[nextFocus]?.focus();
        return;
      }
    }

    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next box if digit typed
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // --- Step 2: Verify entered OTP and finish registration ---
  // Only users with verified emails can finish signup process!
  const handleVerifyOtpAndFinish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setLoadingMessage('Verifying OTP code...');
    setError(null);

    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const verifyRes = await verifyRegistrationOtp(cleanEmail, fullOtp);

      if (!verifyRes.success || !verifyRes.verified) {
        setLoading(false);
        setError(verifyRes.message || 'Invalid verification code. Please check your email.');
        return;
      }

      // Email matches and is verified!
      setIsEmailVerified(true);
      setLoadingMessage('Email verified! Finalizing Shuffler account...');

      // Finish participant signup process with verified flag
      const regRes = await registerParticipant(
        {
          name: regName.trim(),
          email: cleanEmail,
          phone: regPhone.trim(),
          password: regPassword || 'shuffler123',
          area: regArea,
          bio: regBio.trim() || 'Pune board game lover!'
        },
        { verifiedByOtp: true }
      );

      setLoading(false);
      if (!regRes.success) {
        setError(regRes.message);
      }
    } catch {
      setLoading(false);
      setError('Failed to verify OTP. Please try again.');
    }
  };

  // Direct registration if email was previously verified
  const handleCompleteRegistration = async () => {
    setLoading(true);
    setLoadingMessage('Creating Shuffler Account...');
    setError(null);

    const res = await registerParticipant(
      {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPassword || 'shuffler123',
        area: regArea,
        bio: regBio.trim() || 'Pune board game lover!'
      },
      { verifiedByOtp: true }
    );

    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (ident: string, pass: string) => {
    setLoading(true);
    setLoadingMessage('Signing in...');
    setError(null);
    await login({
      emailOrPhone: ident,
      password: pass
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-[#151E4D] border border-[#283677] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative p-5 pb-4 bg-[#182255] border-b border-[#202B61]">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <SocialShuffleIcon size={38} />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-heading">
                {activeTab === 'login' ? 'Sign In to Social Shuffle' : 'Join Pune Board Game Community'}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {activeTab === 'login'
                  ? 'Access your RSVPs, badges, and games'
                  : (regStep === 'otp_verify' ? 'Step 2 of 2: Verify email address' : 'Register free with Google or email verification')}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#10173E] p-1 rounded-xl mt-4 border border-[#283677]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setAuthModalMode('login');
                setError(null);
                setShowGoogleChooser(false);
                setUnregisteredAccountNotice(null);
                setRegStep('form');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-[#FF751F] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setAuthModalMode('register');
                setError(null);
                setShowGoogleChooser(false);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-[#4AB4A4] text-[#10173E] font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Register Participant
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* USERNAME NOT REGISTERED REDIRECTION NOTICE */}
          {unregisteredAccountNotice && activeTab === 'register' && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Username not registered: {unregisteredAccountNotice.email}</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                This Google account is not registered in our database yet. You have been redirected to <strong className="text-white">Register participant</strong>. Complete registration below or click <strong className="text-[#4AB4A4]">Sign up with Google Account</strong> to register with 1 tap.
              </p>
              <button
                type="button"
                onClick={() => handleAccountSelection(unregisteredAccountNotice)}
                className="w-full py-2 px-3 rounded-lg bg-[#4AB4A4] hover:bg-[#2EB899] text-[#10173E] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <GoogleLogoSvg className="w-3.5 h-3.5" />
                <span>Register with {unregisteredAccountNotice.name} now</span>
              </button>
            </div>
          )}

          {error && !unregisteredAccountNotice && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PRIMARY GOOGLE SIGN-IN / SIGN-UP BUTTON */}
          {!showGoogleChooser && regStep === 'form' ? (
            <div className="space-y-3">
              <button
                type="button"
                id="btn-google-auth"
                onClick={() => handleOpenGoogleChooser(activeTab === 'login' ? 'login' : 'register')}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all border active:scale-[0.99] disabled:opacity-50 bg-white hover:bg-slate-100 text-slate-900 border-slate-200"
              >
                <GoogleLogoSvg className="w-4 h-4 shrink-0" />
                <span>
                  {activeTab === 'login' ? 'Continue with Google' : 'Sign up with Google Account'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#283677]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] font-heading">
                  {activeTab === 'login' ? 'Or sign in with details' : 'Or fill in your details with Email OTP'}
                </span>
                <div className="flex-grow border-t border-[#283677]"></div>
              </div>
            </div>
          ) : null}

          {/* GOOGLE ACCOUNT CHOOSER DIALOG */}
          {showGoogleChooser && (
            <div className="p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-3.5 animate-in fade-in shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#202B61]">
                <div className="flex items-center gap-2">
                  <GoogleLogoSvg className="w-4 h-4" />
                  <span className="text-xs font-bold text-white font-heading">
                    {googleChooserMode === 'register' ? 'Sign up with Google Account' : 'Continue with Google'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-[11px] text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-white">
                  {googleChooserMode === 'register'
                    ? 'Select an account to register your participant profile'
                    : 'Choose an account to continue to Social Shuffle Pune'}
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Logged-in Google accounts detected on this browser/device:
                </p>
              </div>

              <div className="space-y-2">
                {deviceAccounts.map(account => {
                  const isRegistered = registeredEmails.includes(account.email.toLowerCase());
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleAccountSelection(account)}
                      disabled={loading}
                      className="w-full p-2.5 rounded-xl bg-[#151E4D] hover:bg-[#202D6E] border border-[#283677] hover:border-[#FF751F]/50 flex items-center justify-between text-left transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={account.avatar}
                          alt={account.name}
                          className="w-9 h-9 rounded-full border border-[#283677] object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white group-hover:text-[#FF7A59] font-heading">
                              {account.name}
                            </span>
                            {isRegistered ? (
                              <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/25 flex items-center gap-0.5">
                                <UserCheck className="w-2.5 h-2.5" /> Registered
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 text-[9px] font-medium bg-blue-500/15 text-blue-300 rounded border border-blue-500/20">
                                Device Account
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{account.email}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#FF751F] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#202B61]">
                {!showAddAccountForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddAccountForm(true)}
                    className="text-[11px] font-semibold text-[#FF7A59] hover:underline flex items-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Use another Google account on this device</span>
                  </button>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5 mt-2 bg-[#151E4D] p-3 rounded-lg border border-[#283677]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white font-heading">Add Device Google Account</span>
                      <button
                        type="button"
                        onClick={() => setShowAddAccountForm(false)}
                        className="text-[10px] text-[#94A3B8] hover:text-white"
                      >
                        Hide
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={customGoogleName}
                        onChange={e => setCustomGoogleName(e.target.value)}
                        placeholder="Google Account Full Name"
                        className="w-full bg-[#1A255C] border border-[#283677] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#FF751F]"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={e => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-[#1A255C] border border-[#283677] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#FF751F]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        value={customGooglePhone}
                        onChange={e => setCustomGooglePhone(e.target.value)}
                        placeholder="Phone (optional)"
                        className="w-full bg-[#1A255C] border border-[#283677] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#FF751F]"
                      />
                      <select
                        value={customGoogleArea}
                        onChange={e => setCustomGoogleArea(e.target.value)}
                        className="w-full bg-[#1A255C] border border-[#283677] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#FF751F]"
                      >
                        {puneAreas.map(area => (
                          <option key={area} value={area} className="bg-[#151E4D] text-white">
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-lg bg-[#FF751F] hover:bg-[#E66310] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <GoogleLogoSvg className="w-3.5 h-3.5" />
                      <span>{loading ? 'Processing...' : (googleChooserMode === 'register' ? 'Sign up with this Google Account' : 'Continue with this Google Account')}</span>
                    </button>
                  </form>
                )}
              </div>

              {loading && (
                <div className="text-center py-2 text-xs text-[#94A3B8] flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#FF751F] border-t-transparent rounded-full animate-spin"></div>
                  <span>{loadingMessage || 'Processing...'}</span>
                </div>
              )}
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'login' && !showGoogleChooser && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. rohan.kulkarni@example.com or 9822012345"
                    className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#FF751F] focus:ring-1 focus:ring-[#FF751F] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password (optional for demo accounts)"
                    className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#FF751F] focus:ring-1 focus:ring-[#FF751F] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#FF751F] hover:bg-[#E66310] text-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In as Participant'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Logins */}
              <div className="pt-3 border-t border-[#202B61]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 font-heading">
                  1-Tap Demo Access:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('priya.nair@example.com', 'shuffler123')}
                    className="p-2 text-left rounded-lg bg-[#1A255C] border border-[#283677] hover:border-[#FF751F] transition-all text-xs"
                  >
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF751F]"></span>
                      Priya Nair
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">Participant (Wakad)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rohan.kulkarni@example.com', 'shuffler123')}
                    className="p-2 text-left rounded-lg bg-[#1A255C] border border-[#283677] hover:border-[#4AB4A4] transition-all text-xs"
                  >
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4AB4A4]"></span>
                      Rohan K.
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">Participant (KP)</div>
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@socialshuffle.com', 'admin123')}
                    className="w-full p-2 text-left rounded-lg bg-[#1A255C] border border-[#283677] hover:border-[#FF751F] transition-all text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FF751F]" />
                      <span className="font-semibold text-white">Aman Joshi</span>
                    </div>
                    <span className="text-[10px] bg-[#FF751F]/15 text-[#FF7A59] px-1.5 py-0.5 rounded font-mono">
                      Organizer / Admin
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER STEP 1: PARTICIPANT DETAILS FORM */}
          {activeTab === 'register' && !showGoogleChooser && regStep === 'form' && (
            <form onSubmit={handleInitiateEmailOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                  Full Name <span className="text-[#FF751F]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#CBD5E1]">
                      Email Address <span className="text-[#FF751F]">*</span>
                    </label>
                    {isEmailVerified && (
                      <span className="text-[10px] text-[#4AB4A4] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => {
                        setRegEmail(e.target.value);
                        setIsEmailVerified(false);
                      }}
                      placeholder="priya@example.com"
                      className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Phone / WhatsApp <span className="text-[#FF751F]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+91 98220 54321"
                      className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Pune Locality
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                    <select
                      value={regArea}
                      onChange={e => setRegArea(e.target.value)}
                      className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4] rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none transition-all"
                    >
                      {puneAreas.map(area => (
                        <option key={area} value={area} className="bg-[#151E4D] text-white">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                  About you & Favorite Games (Optional)
                </label>
                <div className="relative">
                  <Dices className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regBio}
                    onChange={e => setRegBio(e.target.value)}
                    placeholder="e.g. Love Catan, Codenames, Secret Hitler! Looking to play on weekends."
                    className="w-full bg-[#1A255C] border border-[#283677] focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Requirement reminder notice */}
              <div className="p-3 bg-[#1A255C] border border-[#283677] rounded-xl flex items-start gap-2.5 text-xs text-[#CBD5E1]">
                <ShieldCheck className="w-4 h-4 text-[#4AB4A4] shrink-0 mt-0.5" />
                <span>
                  <strong>Email Verification Required:</strong> An OTP will be sent to your email to verify ownership before finishing signup.
                </span>
              </div>

              <button
                type="submit"
                disabled={otpSending || loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#4AB4A4] hover:bg-[#2EB899] text-[#10173E] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {otpSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Verification OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email & Complete Signup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER STEP 2: EMAIL OTP VERIFICATION SCREEN */}
          {activeTab === 'register' && !showGoogleChooser && regStep === 'otp_verify' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* OTP Header Card */}
              <div className="text-center p-4 rounded-xl bg-[#1A255C] border border-[#283677] space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#4AB4A4]/15 border border-[#4AB4A4]/30 flex items-center justify-center text-[#4AB4A4]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight font-heading">Verify Your Email Address</h3>
                <p className="text-xs text-[#94A3B8]">
                  We sent a 6-digit verification code to:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151E4D] border border-[#283677] rounded-lg text-xs font-mono text-[#4AB4A4]">
                  <Mail className="w-3.5 h-3.5 text-[#4AB4A4]" />
                  <span>{regEmail}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRegStep('form');
                      setError(null);
                    }}
                    title="Change Email"
                    className="ml-1 text-[#94A3B8] hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* DEMO TEST HELPER: Quick 1-tap fill for generated OTP */}
              {otpPreview && (
                <div className="p-3 bg-[#151E4D] border border-[#283677] rounded-xl text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[#94A3B8] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#FF751F]" />
                      Email Dispatched (Demo Preview):
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">10 min expiry</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#1A255C] px-3 py-1.5 rounded-lg border border-[#283677]">
                    <span className="font-mono text-white tracking-widest font-bold text-sm">{otpPreview}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const split = otpPreview.split('');
                        setOtpDigits(split);
                        setError(null);
                      }}
                      className="px-2.5 py-1 bg-[#FF751F] hover:bg-[#E66310] text-white font-bold text-[10px] rounded transition-all cursor-pointer"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                </div>
              )}

              {/* 6-DIGIT OTP INPUT BOXES */}
              <div className="space-y-2">
                <label className="block text-center text-xs font-medium text-[#CBD5E1]">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={e => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border transition-all outline-none ${
                        digit
                          ? 'border-[#4AB4A4] bg-[#1A255C] text-white shadow-sm ring-1 ring-[#4AB4A4]'
                          : 'border-[#283677] bg-[#1A255C] text-white focus:border-[#4AB4A4] focus:ring-1 focus:ring-[#4AB4A4]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons: Verify & Finish Signup */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyOtpAndFinish}
                  disabled={loading || otpDigits.join('').length < 6}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#4AB4A4] hover:bg-[#2EB899] text-[#10173E] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{loadingMessage || 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Email & Finish Signup</span>
                    </>
                  )}
                </button>

                {/* Resend OTP & Back Controls */}
                <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegStep('form');
                      setError(null);
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Back to details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpTimer > 0 || otpSending}
                    className={`font-semibold transition-colors flex items-center gap-1 ${
                      otpTimer > 0
                        ? 'text-[#64748B] cursor-not-allowed'
                        : 'text-[#4AB4A4] hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${otpSending ? 'animate-spin' : ''}`} />
                    <span>
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend OTP Code'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#10173E] border-t border-[#202B61] text-center text-[10px] text-[#94A3B8] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4AB4A4]" />
          <span>Email Verification Required · Secured with PBKDF2</span>
        </div>
      </div>
    </div>
  );
};
