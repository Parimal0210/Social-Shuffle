import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Lock,
  Server,
  Zap,
  Globe,
  Users,
  Settings,
  ChevronRight,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
// WhatsApp templates & helper imports temporarily commented out
/*
import {
  WHATSAPP_COMMUNITY_PRESETS,
  OFFICIAL_WHATSAPP_GROUPS,
  formatWhatsAppMessage,
  getWhatsAppShareUrl
} from '../../utils/whatsappTemplates';
import { cleanWhatsAppNumber } from '../../services/notificationEmailService';
*/

export const AdminCommunications: React.FC = () => {
  const { events, registrations, participants, currentUser, notifications } = useApp();

  const [activeTab, setActiveTab] = useState<'email' | 'logs'>('email');

  // Config State
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Email Test State
  const [testToEmail, setTestToEmail] = useState<string>(currentUser?.email || 'parimalmshete@gmail.com');
  const [testSubject, setTestSubject] = useState<string>('🎲 Test Email from Social Shuffle Pune');
  const [testMessage, setTestMessage] = useState<string>(
    'Hello! This is a live test email sent directly from your Social Shuffle Pune platform. Real outbound mail transmission is active!'
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<any>(null);

  // SMTP Settings Form State
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaveMsg, setConfigSaveMsg] = useState<string | null>(null);

  /*
  // WhatsApp State & Helpers temporarily commented out
  const [selectedPresetId, setSelectedPresetId] = useState<string>('announcement');
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState<string>('');
  const [selectedTargetEventId, setSelectedTargetEventId] = useState<string>(events[0]?.id || '');
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedAttendeeRegId, setSelectedAttendeeRegId] = useState<string>(registrations[0]?.id || '');
  */

  // Load config on mount
  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const data = await api.getCommunicationsConfig();
      if (data && data.success) {
        setConfig(data);
        if (data.email) {
          setSmtpHost(data.email.host || '');
          setSmtpPort(data.email.port || 587);
          setSmtpSecure(Boolean(data.email.secure));
          setSmtpUser(data.email.user || '');
          setSmtpPass(data.email.pass || '');
          setSmtpFrom(data.email.fromEmail || '');
        }
      }
    } catch (e) {
      console.warn('Failed to fetch communications config', e);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testToEmail) return;
    setSendingEmail(true);
    setEmailResult(null);

    try {
      const res = await api.testSendEmail(testToEmail, testSubject, testMessage);
      setEmailResult(res);
      fetchConfig();
    } catch (err: any) {
      setEmailResult({ success: false, error: err?.message || 'Failed to dispatch test email' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSaveMsg(null);

    try {
      const res = await api.updateCommunicationsConfig({
        email: {
          enabled: true,
          provider: smtpHost.includes('gmail') ? 'gmail' : 'smtp',
          host: smtpHost,
          port: Number(smtpPort),
          secure: smtpSecure,
          user: smtpUser,
          pass: smtpPass,
          fromEmail: smtpFrom || `"Social Shuffle Pune" <notifications@socialshuffle.in>`
        }
      });

      if (res.success) {
        setConfigSaveMsg('SMTP Configuration saved successfully!');
        fetchConfig();
        setTimeout(() => setConfigSaveMsg(null), 4000);
      } else {
        setConfigSaveMsg(res.message || 'Error saving configuration');
      }
    } catch (err: any) {
      setConfigSaveMsg(err?.message || 'Network error saving configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const isRealSmtp = config?.email?.isRealSmtp;
  const activeProvider = config?.email?.activeProvider || 'smtp';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-heading font-bold text-[#F8FAFC] tracking-tight">
              Mail Communications Hub
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4AB4A4]/15 border border-[#4AB4A4]/30 text-[#4AB4A4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AB4A4] animate-pulse" />
              Live Sending Enabled
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Outbound SMTP email transmission, digital QR door pass delivery, and automated OTP delivery
          </p>
        </div>

        <button
          onClick={fetchConfig}
          disabled={loadingConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151E4D] border border-[#283677] hover:border-[#FF751F] text-xs font-semibold text-[#CBD5E1] transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FF751F] ${loadingConfig ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Top 3 Live Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Email Outbound Status */}
        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold">Outbound Email Engine</span>
            <div className="w-7 h-7 rounded-lg bg-[#4AB4A4]/15 flex items-center justify-center text-[#4AB4A4]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-heading font-bold text-[#F8FAFC]">
              {isRealSmtp ? 'Authenticated SMTP Relay' : 'Ethereal Live SMTP'}
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4AB4A4]" />
            <span className="text-[#4AB4A4] font-semibold">
              {isRealSmtp ? `Transmitting via ${activeProvider}` : 'Real SMTP network active (Live Previews)'}
            </span>
          </div>
        </div>

        {/* Card 2: Pass & OTP Deliverability */}
        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold">Inbox Delivery Guarantee</span>
            <div className="w-7 h-7 rounded-lg bg-[#4AB4A4]/15 flex items-center justify-center text-[#4AB4A4]">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-heading font-bold text-[#F8FAFC]">
              Real Outbound Active
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4AB4A4]" />
            <span className="text-[#4AB4A4] font-semibold">
              Automated OTPs & Entry Passes
            </span>
          </div>
        </div>

        {/* Card 3: Target Community Reach */}
        <div className="p-4 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[#94A3B8] mb-1">
            <span className="text-xs font-semibold">Registered Contact Reach</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFD230]/15 flex items-center justify-center text-[#FFD230]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-[#FFD230]">
              {participants.length} Shufflers
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#94A3B8]">
            <strong className="text-[#F8FAFC]">{registrations.length}</strong> active booking contacts
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex items-center gap-2 border-b border-[#283677] pb-3">
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all ${
            activeTab === 'email'
              ? 'bg-[#FF751F] text-white shadow-lg shadow-[#FF751F]/20'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E4D]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Dispatcher & SMTP Relay</span>
        </button>

        {/* WhatsApp Messaging tab temporarily commented out */}
        {/*
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-[#25D366] text-[#10173E] font-black shadow-lg shadow-[#25D366]/20'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E4D]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Messaging & Community</span>
        </button>
        */}

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all ${
            activeTab === 'logs'
              ? 'bg-[#4AB4A4] text-[#10173E] font-black shadow-lg shadow-[#4AB4A4]/20'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E4D]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Outbound Delivery Logs ({notifications.length})</span>
        </button>
      </div>

      {/* TAB 1: EMAIL DISPATCHER & SMTP CONFIGURATION */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Live Test Email Sender */}
          <div className="p-5 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#283677]">
              <div className="w-8 h-8 rounded-lg bg-[#4AB4A4]/15 flex items-center justify-center text-[#4AB4A4]">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-[#F8FAFC]">
                  Live Test Email Dispatcher
                </h3>
                <p className="text-[11px] text-[#94A3B8]">
                  Transmit a real test email over SMTP to verify end-to-end inbox delivery
                </p>
              </div>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">
                  Recipient Email Address <span className="text-[#FF751F]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={testToEmail}
                  onChange={e => setTestToEmail(e.target.value)}
                  placeholder="parimalmshete@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={e => setTestSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <button
                type="submit"
                disabled={sendingEmail || !testToEmail}
                className={`w-full py-2.5 rounded-xl font-heading font-bold flex items-center justify-center gap-2 transition-all ${
                  sendingEmail
                    ? 'bg-[#202B61] text-[#94A3B8] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#4AB4A4] to-[#258B7E] text-[#10173E] hover:opacity-95 shadow-lg shadow-[#4AB4A4]/25'
                }`}
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting over SMTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Real Test Email</span>
                  </>
                )}
              </button>
            </form>

            {/* Email Test Result Box */}
            {emailResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                  emailResult.success
                    ? 'bg-[#4AB4A4]/15 border-[#4AB4A4]/40 text-[#4AB4A4]'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {emailResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#4AB4A4]" />
                      <span>Email Transmitted Successfully!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Email Transmission Failed</span>
                    </>
                  )}
                </div>
                {emailResult.messageId && (
                  <div className="font-mono text-[10px] text-[#CBD5E1]">
                    Message ID: {emailResult.messageId}
                  </div>
                )}
                {emailResult.previewUrl && (
                  <div className="pt-1">
                    <a
                      href={emailResult.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#10173E] border border-[#4AB4A4]/40 text-[#4AB4A4] font-bold text-[11px] hover:bg-[#151E4D]"
                    >
                      <span>View Live Email in Webmail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {emailResult.error && (
                  <div className="text-[11px] text-rose-300">
                    Reason: {emailResult.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Custom SMTP / Gmail Relay Configuration */}
          <div className="p-5 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#283677]">
              <div className="w-8 h-8 rounded-lg bg-[#FF751F]/15 flex items-center justify-center text-[#FF751F]">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-[#F8FAFC]">
                  Custom SMTP / Gmail Relay Settings
                </h3>
                <p className="text-[11px] text-[#94A3B8]">
                  Connect your own Gmail address or custom SMTP server for branded sending
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSmtpConfig} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[#94A3B8] font-semibold mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={e => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={e => setSmtpPort(Number(e.target.value))}
                    placeholder="587"
                    className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Username / Gmail Address</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={e => setSmtpUser(e.target.value)}
                  placeholder="parimalmshete@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#94A3B8] font-semibold">Password / Gmail App Password</label>
                  <span className="text-[10px] text-[#FFD230]">16-digit Google App Password</span>
                </div>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={e => setSmtpPass(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Sender "From" Name & Email</label>
                <input
                  type="text"
                  value={smtpFrom}
                  onChange={e => setSmtpFrom(e.target.value)}
                  placeholder='"Social Shuffle Pune" <notifications@socialshuffle.in>'
                  className="w-full px-3 py-2 rounded-xl bg-[#10173E] border border-[#283677] text-white focus:outline-none focus:border-[#FF751F]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#10173E] border border-[#202B61] text-[11px] text-[#94A3B8] leading-relaxed">
                💡 <strong>Gmail Tip:</strong> To send emails from your personal or Google Workspace account without two-factor prompts, generate a 16-character <strong>App Password</strong> in your Google Account: <code className="text-[#FFD230]">Google Account → Security → 2-Step Verification → App Passwords</code>.
              </div>

              {configSaveMsg && (
                <div className="p-2.5 rounded-xl bg-[#4AB4A4]/20 border border-[#4AB4A4]/40 text-[#4AB4A4] text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{configSaveMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingConfig}
                className="w-full py-2.5 rounded-xl font-heading font-bold bg-[#FF751F] hover:bg-[#E66310] text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF751F]/20"
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Save Communications Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 
      =======================================================================
      TAB 2: WHATSAPP MESSAGING & COMMUNITY (Temporarily commented out per request)
      =======================================================================
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          ...
        </div>
      )}
      ======================================================================= */}

      {/* TAB 3: LIVE OUTBOUND LOGS */}
      {activeTab === 'logs' && (
        <div className="p-5 rounded-2xl bg-[#151E4D] border border-[#283677] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#283677]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4AB4A4]/15 flex items-center justify-center text-[#4AB4A4]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-[#F8FAFC]">
                  Outbound Communication & Pass Dispatch Logs
                </h3>
                <p className="text-[11px] text-[#94A3B8]">
                  Live real-time records of sent registration passes, broadcast notifications, and OTP codes
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#10173E] border border-[#283677] text-[#4AB4A4]">
              {notifications.length} Dispatch Records
            </span>
          </div>

          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                No communications dispatched yet. Use the Test Mailer or send an event broadcast to generate live logs.
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#1A255C]/60 border border-[#283677] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-[#4AB4A4]/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#4AB4A4]/15 flex items-center justify-center text-[#4AB4A4] shrink-0 mt-0.5">
                      <Mail className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-1">{item.message}</p>
                      {item.recipientEmail && (
                        <span className="text-[10px] text-[#4AB4A4] font-mono">
                          To: {item.recipientEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-[10px] text-[#64748B]">{item.timestamp}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4AB4A4]/20 text-[#4AB4A4]">
                      Delivered
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
