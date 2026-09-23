import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialShuffleIcon } from '../SocialShuffleLogo';
import { GoogleUserProfile } from '../../types';

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

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    registerParticipant,
    loginWithGoogle
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  // Custom Google account form state inside chooser
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleArea, setCustomGoogleArea] = useState('Koregaon Park');

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

  // Keep activeTab in sync with context
  React.useEffect(() => {
    setActiveTab(authModalMode);
    setError(null);
    setShowGoogleChooser(false);
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

  // Quick Google preset accounts for instant sign in
  const presetGoogleAccounts: GoogleUserProfile[] = [
    {
      email: 'parimalmshete@gmail.com',
      name: 'Parimal Shete',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      area: 'Koregaon Park',
      phone: '+91 98220 99887'
    },
    {
      email: 'rohan.kulkarni@gmail.com',
      name: 'Rohan Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      area: 'Koregaon Park',
      phone: '+91 98220 12345'
    }
  ];

  const handleExecuteGoogleLogin = async (profile: GoogleUserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(profile);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    } catch {
      setLoading(false);
      setError('Unable to authenticate with Google. Please try again.');
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleName.trim()) {
      setError('Please provide your Google email address and name');
      return;
    }
    handleExecuteGoogleLogin({
      email: customGoogleEmail.trim().toLowerCase(),
      name: customGoogleName.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customGoogleName.trim())}`,
      area: customGoogleArea,
      phone: '+91 98220 ' + Math.floor(10000 + Math.random() * 90000)
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    setLoading(true);
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!regPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await registerParticipant({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword || 'shuffler123',
      area: regArea,
      bio: regBio.trim() || 'Pune board game lover!'
    });

    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (ident: string, pass: string) => {
    setLoading(true);
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
        className="w-full sm:max-w-md bg-[#0D1527] border border-[#1F305E] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative p-5 pb-4 bg-gradient-to-b from-[#111C3B] to-[#0D1527] border-b border-[#1F305E]/80">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <SocialShuffleIcon size={38} />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {activeTab === 'login' ? 'Sign In to Social Shuffle' : 'Join Pune Board Game Community'}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === 'login'
                  ? 'Access your RSVPs, badges, and games'
                  : 'Register free with Google or fill your details'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#0A1128] p-1 rounded-xl mt-4 border border-[#1F305E]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setAuthModalMode('login');
                setError(null);
                setShowGoogleChooser(false);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
                  ? 'bg-gradient-to-r from-[#35C8A8] to-[#20B2AA] text-[#0A1128] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Participant
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PRIMARY GOOGLE SIGN-IN / REGISTER OPTION */}
          {!showGoogleChooser ? (
            <div className="space-y-3">
              <button
                type="button"
                id="btn-google-auth"
                onClick={() => setShowGoogleChooser(true)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all border border-slate-200 active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleLogoSvg className="w-4 h-4 shrink-0" />
                <span>
                  {activeTab === 'login' ? 'Continue with Google' : 'Sign up with Google Account'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#1F305E]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {activeTab === 'login' ? 'Or sign in with details' : 'Or fill in your details'}
                </span>
                <div className="flex-grow border-t border-[#1F305E]"></div>
              </div>
            </div>
          ) : (
            /* GOOGLE ACCOUNT CHOOSER DIALOG */
            <div className="p-4 rounded-xl bg-[#091024] border border-[#1F305E] space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#1F305E]">
                <div className="flex items-center gap-2">
                  <GoogleLogoSvg className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Choose a Google Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                to continue to <strong className="text-white">Social Shuffle Pune</strong>
              </p>

              {/* Preset accounts */}
              <div className="space-y-1.5">
                {presetGoogleAccounts.map(account => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleExecuteGoogleLogin(account)}
                    disabled={loading}
                    className="w-full p-2.5 rounded-lg bg-[#111C3B] hover:bg-[#18264e] border border-[#1F305E] hover:border-blue-500/50 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                          {account.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{account.email}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              {/* Or enter another Google account */}
              <div className="pt-2 border-t border-[#1F305E]">
                <details className="text-xs group">
                  <summary className="cursor-pointer text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 select-none">
                    <span>Use another Google account</span>
                  </summary>
                  <form onSubmit={handleCustomGoogleSubmit} className="mt-3 space-y-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        value={customGoogleName}
                        onChange={e => setCustomGoogleName(e.target.value)}
                        placeholder="Google Account Full Name"
                        className="w-full bg-[#111C3B] border border-[#1F305E] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={e => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-[#111C3B] border border-[#1F305E] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={customGoogleArea}
                        onChange={e => setCustomGoogleArea(e.target.value)}
                        className="w-full bg-[#111C3B] border border-[#1F305E] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                      >
                        {puneAreas.map(area => (
                          <option key={area} value={area} className="bg-[#0D1527] text-white">
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
                    >
                      <GoogleLogoSvg className="w-3.5 h-3.5" />
                      <span>{loading ? 'Connecting...' : 'Sign in with this Google Account'}</span>
                    </button>
                  </form>
                </details>
              </div>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. rohan.kulkarni@example.com or 9822012345"
                    className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#FF6036] focus:ring-1 focus:ring-[#FF6036] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password (optional for demo accounts)"
                    className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#FF6036] focus:ring-1 focus:ring-[#FF6036] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF6036]/20 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In as Participant'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Logins */}
              <div className="pt-3 border-t border-[#1F305E]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  1-Tap Demo Access:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rohan.kulkarni@example.com', 'shuffler123')}
                    className="p-2 text-left rounded-lg bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/60 transition-all text-xs"
                  >
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#35C8A8]"></span>
                      Rohan K.
                    </div>
                    <div className="text-[10px] text-slate-400">Participant (KP)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ananya.d@example.com', 'shuffler123')}
                    className="p-2 text-left rounded-lg bg-[#111C3B] border border-[#1F305E] hover:border-[#35C8A8]/60 transition-all text-xs"
                  >
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FFC226]"></span>
                      Ananya D.
                    </div>
                    <div className="text-[10px] text-slate-400">Participant (Baner)</div>
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@socialshuffle.com', 'admin123')}
                    className="w-full p-2 text-left rounded-lg bg-[#111C3B]/60 border border-[#1F305E] hover:border-[#FF6036]/60 transition-all text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FF6036]" />
                      <span className="font-semibold text-slate-200">Aman Joshi</span>
                    </div>
                    <span className="text-[10px] bg-[#FF6036]/15 text-[#FF8566] px-1.5 py-0.5 rounded font-mono">
                      Organizer / Admin
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-[#FF6036]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] focus:ring-1 focus:ring-[#35C8A8] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address <span className="text-[#FF6036]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] focus:ring-1 focus:ring-[#35C8A8] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone / WhatsApp <span className="text-[#FF6036]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+91 98220 54321"
                      className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] focus:ring-1 focus:ring-[#35C8A8] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pune Locality
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={regArea}
                      onChange={e => setRegArea(e.target.value)}
                      className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] focus:ring-1 focus:ring-[#35C8A8] rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none transition-all"
                    >
                      {puneAreas.map(area => (
                        <option key={area} value={area} className="bg-[#0D1527] text-white">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] focus:ring-1 focus:ring-[#35C8A8] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  About you & Favorite Games (Optional)
                </label>
                <div className="relative">
                  <Dices className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regBio}
                    onChange={e => setRegBio(e.target.value)}
                    placeholder="e.g. Love Catan, Codenames, Secret Hitler! Looking to play on weekends."
                    className="w-full bg-[#111C3B] border border-[#1F305E] focus:border-[#35C8A8] focus:ring-1 focus:ring-[#35C8A8] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#111C3B]/60 border border-[#1F305E] rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-[#35C8A8] shrink-0 mt-0.5" />
                <span>
                  By registering, you get a unique Pune Shuffler profile to RSVP to meetups, track attended games, earn badges, and join Pune's board gamer community!
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#35C8A8] to-[#20B2AA] text-[#0A1128] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#35C8A8]/20 disabled:opacity-50"
              >
                {loading ? 'Creating Shuffler Account...' : 'Complete Registration & Join'}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0A1128] border-t border-[#1F305E] text-center text-[11px] text-slate-400">
          Social Shuffle Pune • Board Game Community Management Platform
        </div>
      </div>
    </div>
  );
};
