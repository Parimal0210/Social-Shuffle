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
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialShuffleIcon } from '../SocialShuffleLogo';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    registerParticipant
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-[#0D1527] border border-[#1F305E] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
                  : 'Register free as a participant in under 30 seconds'}
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
