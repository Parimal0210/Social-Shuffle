import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { googleSignIn, logoutGoogle, getAccessToken, sendViaGmailApi } from '../../services/googleAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const GoogleGmailConnectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultEmail = 'parimalmshete@gmail.com'
}) => {
  const [connecting, setConnecting] = useState(false);
  const [connectedUserEmail, setConnectedUserEmail] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);
  const [targetEmail, setTargetEmail] = useState(defaultEmail);

  // Check current server & client status on mount
  useEffect(() => {
    if (isOpen) {
      setTestResult(null);
      fetch('/api/communications/gmail-status')
        .then(r => r.json())
        .then(data => {
          if (data && data.connected) {
            setHasToken(true);
            setConnectedUserEmail(data.email || defaultEmail);
          }
        })
        .catch(() => {});

      getAccessToken().then(tok => {
        if (tok) setHasToken(true);
      });
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleGoogleConnect = async () => {
    setConnecting(true);
    setTestResult(null);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        setConnectedUserEmail(res.user.email);
        setHasToken(true);
        setTestResult({
          success: true,
          message: `Connected successfully as ${res.user.email}! You can now dispatch real emails.`
        });
      }
    } catch (err: any) {
      console.error('Sign in error', err);
      setTestResult({
        success: false,
        message: err?.message || 'Google Sign-In was cancelled or failed'
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutGoogle();
    setHasToken(false);
    setConnectedUserEmail(null);
    setTestResult(null);
  };

  const handleSendLiveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) return;
    setSendingTest(true);
    setTestResult(null);

    const token = await getAccessToken();

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E162B; color: #f8fafc; padding: 32px 24px; border-radius: 16px; max-width: 540px; margin: 20px auto; border: 1px solid #1F305E;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="background-color: #4AB4A4; color: #0E162B; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">Official Gmail API Dispatch</span>
          <h2 style="color: #ffffff; margin: 12px 0 6px 0; font-size: 22px; font-weight: 900;">Real Email Delivery Verified! 🎉</h2>
          <p style="color: #94A3B8; font-size: 13px; margin: 0;">Social Shuffle Pune • Outbound Mail Service</p>
        </div>
        <div style="background-color: #131E3A; border: 1px solid #283677; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 14px; margin-top: 0; color: #e2e8f0; line-height: 1.6;">
            Hello Parimal,<br/><br/>
            This is a real live test email dispatched via the official <strong>Google Gmail API</strong> from your Social Shuffle Pune platform.<br/><br/>
            All VIP event passes, entry QR codes, registration receipts, and community notifications are now delivering straight to your inbox with verified SPF, DKIM, and DMARC credentials.
          </p>
          <div style="border-top: 1px solid #283677; margin-top: 16px; padding-top: 14px; font-size: 12px; color: #94A3B8;">
            <div><strong>Recipient:</strong> ${targetEmail}</div>
            <div><strong>Dispatched At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</div>
            <div><strong>Channel:</strong> Official Google Gmail API (${connectedUserEmail || 'Authenticated Account'})</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 12px; color: #64748B;">
          Social Shuffle Pune • Board Game Community Platform
        </div>
      </div>
    `;

    try {
      if (token) {
        // Direct Client-Side Gmail API dispatch
        const res = await sendViaGmailApi(
          targetEmail,
          '🎲 Social Shuffle Pune — Real Live Test Email (Gmail API)',
          emailHtml,
          token
        );
        setTestResult({
          success: true,
          message: `Delivered directly to ${targetEmail} via Gmail API!`,
          messageId: res.messageId
        });
      } else {
        // Server route fallback
        const res = await fetch('/api/communications/test-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: targetEmail,
            subject: '🎲 Social Shuffle Pune — Live Verification Email',
            message: 'Live test email dispatched from Social Shuffle Pune platform.'
          })
        });
        const data = await res.json();
        if (data && data.success) {
          setTestResult({
            success: true,
            message: `Delivered to ${targetEmail}!`,
            messageId: data.messageId
          });
        } else {
          setTestResult({
            success: false,
            message: data?.error || 'Failed to dispatch test email'
          });
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed sending email via Gmail API'
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#131E3A] border border-[#283677] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#182255] border-b border-[#202B61] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-heading">Connect Gmail for Live Mail Delivery</h3>
              <p className="text-[11px] text-[#94A3B8]">Deliver VIP passes & notifications directly to inboxes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {hasToken ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Gmail Connected</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Connected account: <strong>{connectedUserEmail || defaultEmail}</strong>
              </p>
              <p className="text-[10px] text-[#94A3B8]">
                Real emails are dispatched natively via Google's official Gmail API with zero password requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[#94A3B8] leading-relaxed">
                Connect your Google account with one tap to grant the app permission to send official VIP entry passes and test emails directly to your Gmail inbox.
              </p>

              {/* Official Google Sign-In Styled Button */}
              <button
                type="button"
                onClick={handleGoogleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white text-slate-800 font-semibold text-xs hover:bg-slate-100 shadow transition-all disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Connecting Google Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Sign in with Google to Connect Gmail</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Test Send Form */}
          <form onSubmit={handleSendLiveTest} className="pt-3 border-t border-[#202B61] space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#CBD5E1] uppercase tracking-wider mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={e => setTargetEmail(e.target.value)}
                placeholder="parimalmshete@gmail.com"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0E162B] border border-[#283677] text-white focus:outline-none focus:border-[#4AB4A4]"
              />
            </div>

            <button
              type="submit"
              disabled={sendingTest}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FF751F] hover:bg-[#E66310] text-white font-bold transition-all disabled:opacity-50"
            >
              {sendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Live Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Real Test Email Now</span>
                </>
              )}
            </button>
          </form>

          {/* Result Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-medium">{testResult.message}</p>
                {testResult.messageId && (
                  <p className="text-[10px] text-[#94A3B8] font-mono break-all">
                    Message ID: {testResult.messageId}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#182255] border-t border-[#202B61] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OAuth 2.0 Secure Channel</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#202B61] text-[#CBD5E1] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
