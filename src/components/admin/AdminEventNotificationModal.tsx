import React, { useState } from 'react';
import {
  ShuffleEvent,
  Registration,
  EmailNotificationType,
  EventEmailBroadcastRequest,
  DualPushNotificationResult
} from '../../types';
import {
  Bell,
  Mail,
  Send,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit3,
  QrCode,
  Sparkles,
  Info,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  generateCustomBroadcastEmailHtml,
  generateEventReminderEmailHtml,
  generateEventWhatsAppNotification,
  isWhatsAppEligiblePhone,
  getDirectWhatsAppUrl
} from '../../services/notificationEmailService';

interface AdminEventNotificationModalProps {
  event: ShuffleEvent;
  registrations: Registration[];
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (request: EventEmailBroadcastRequest) => Promise<DualPushNotificationResult & { sentCount?: number; message?: string }>;
}

export const AdminEventNotificationModal: React.FC<AdminEventNotificationModalProps> = ({
  event,
  registrations,
  isOpen,
  onClose,
  onBroadcast
}) => {
  const eventRegs = registrations.filter(r => r.eventId === event.id && r.attendanceStatus !== 'Cancelled');
  const confirmedRegs = eventRegs.filter(r => r.paymentStatus === 'Confirmed');
  const pendingRegs = eventRegs.filter(r => r.attendanceStatus === 'Pending');

  // Form states
  const [notificationType, setNotificationType] = useState<EmailNotificationType>('event_reminder');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'confirmed_only' | 'pending_only'>('all');
  const [subject, setSubject] = useState<string>(
    `⏳ Reminder: ${event.title} is coming up this weekend!`
  );
  const [message, setMessage] = useState<string>(
    `Hey {name}! The board games are packed, cafe tables are reserved, and hosts are prepping rule guides! We cannot wait to see you for {event_title} at {event_venue}. Please arrive 10 minutes early so our hosts can seat you and start game walk-throughs promptly!`
  );
  const [includeQrPass, setIncludeQrPass] = useState(true);
  const [includeVenueMap, setIncludeVenueMap] = useState(true);

  // Dual-channel options
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);

  // UI tabs & states
  const [activeTab, setActiveTab] = useState<'compose' | 'email_preview' | 'whatsapp_preview' | 'recipients'>('compose');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<DualPushNotificationResult | null>(null);

  if (!isOpen) return null;

  // Compute targeted recipients
  let targetRecipients = eventRegs;
  if (recipientFilter === 'confirmed_only') {
    targetRecipients = confirmedRegs;
  } else if (recipientFilter === 'pending_only') {
    targetRecipients = pendingRegs;
  }
  const totalPaxTargeted = targetRecipients.reduce((acc, curr) => acc + curr.paxCount, 0);

  // Calculate WhatsApp eligibility among target recipients
  const whatsappReadyRecipients = targetRecipients.filter(r => isWhatsAppEligiblePhone(r.participantPhone));
  const whatsappUnavailableRecipients = targetRecipients.filter(r => !isWhatsAppEligiblePhone(r.participantPhone));

  // Template selector helper
  const handleSelectPreset = (type: 'reminder' | 'qr_pass' | 'starting_soon' | 'venue_directions' | 'custom') => {
    if (type === 'reminder') {
      setNotificationType('event_reminder');
      setSubject(`⏳ Reminder: ${event.title} is coming up!`);
      setMessage(
        `Hey {name}! Just a quick friendly reminder that {event_title} is happening at {event_venue} ({event_time}). We have reserved {pax_count} seat(s) for your party. Check-in is completely seamless with your digital QR pass attached below!`
      );
      setIncludeQrPass(true);
    } else if (type === 'qr_pass') {
      setNotificationType('custom_broadcast');
      setSubject(`🎫 Your Digital Entry Pass for ${event.title}`);
      setMessage(
        `Hey {name}! To speed up check-in at {event_venue}, our host team has generated your VIP entry pass. Simply show the scannable QR code below at the reception desk for instant check-in!`
      );
      setIncludeQrPass(true);
    } else if (type === 'starting_soon') {
      setNotificationType('custom_broadcast');
      setSubject(`🚀 Starting in 2 Hours: ${event.title}!`);
      setMessage(
        `Hey {name}! We are kicking off in just 2 hours at {event_venue}! Hosts are already setting up board game tables. Look out for the Social Shuffle welcome board near the entrance.`
      );
      setIncludeQrPass(true);
    } else if (type === 'venue_directions') {
      setNotificationType('custom_broadcast');
      setSubject(`📍 Venue Directions & Parking for ${event.title}`);
      setMessage(
        `Hey {name}! Here are quick directions for {event_title} at {event_venue} (${event.address}). Dedicated two-wheeler & four-wheeler parking is available nearby. If you have any trouble finding the place, host Aman is available on WhatsApp!`
      );
      setIncludeQrPass(false);
    } else {
      setNotificationType('custom_broadcast');
      setSubject(`📢 Important Host Update: ${event.title}`);
      setMessage(
        `Hey {name}!\n\nWrite your custom update to all participants here.`
      );
    }
  };

  const insertPlaceholder = (tag: string) => {
    setMessage(prev => prev + ' ' + tag);
  };

  const handleSendBroadcast = async () => {
    if (targetRecipients.length === 0) return;
    setIsSending(true);
    setSendResult(null);

    try {
      const result = await onBroadcast({
        eventId: event.id,
        subject,
        message,
        notificationType,
        recipientFilter,
        includeQrPass,
        includeVenueMap,
        channels: enableWhatsApp ? ['email', 'whatsapp'] : ['email']
      });
      setSendResult(result);
    } catch {
      setSendResult({
        success: false,
        eventId: event.id,
        eventTitle: event.title,
        totalRecipients: targetRecipients.length,
        emailSentCount: 0,
        whatsappSentCount: 0,
        whatsappUnavailableCount: targetRecipients.length,
        fallbackEmailOnlyCount: 0,
        message: 'Failed to dispatch push notifications.',
        recipients: []
      });
    } finally {
      setIsSending(false);
    }
  };

  // Sample attendee for live preview
  const sampleAttendee: Registration = targetRecipients[0] || {
    id: 'sample-reg-1',
    eventId: event.id,
    participantId: 'p-1',
    participantName: 'Aditi Sharma',
    participantEmail: 'aditi.sharma@example.com',
    participantPhone: '+91 98901 23456',
    participantArea: event.area,
    paxCount: 2,
    guests: [{ id: 'g-1', name: 'Rohan Sharma' }],
    paymentStatus: 'Confirmed',
    attendanceStatus: 'Pending',
    gamesPlayed: [],
    registeredAt: new Date().toISOString(),
    qrCodeToken: 'SS-REG-SAMPLE-1',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SS-REG-SAMPLE-1'
  };

  const previewHtml = notificationType === 'event_reminder'
    ? generateEventReminderEmailHtml(sampleAttendee, event, message)
    : generateCustomBroadcastEmailHtml(sampleAttendee, event, subject, message, includeQrPass);

  const previewWhatsAppText = generateEventWhatsAppNotification(sampleAttendee, event, message);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#151E4D] border border-[#283677] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-6 bg-[#1A255C] border-b border-[#202B61] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#FF751F]/15 border border-[#FF751F]/30 text-[#FF751F] shrink-0 mt-0.5 relative">
              <Bell className="w-6 h-6 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center border-2 border-[#1A255C]">
                <MessageSquare className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF751F]/20 text-[#FF751F] border border-[#FF751F]/30">
                  Dual-Channel Push Dispatcher
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                  Email + WhatsApp
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4AB4A4]/20 text-[#4AB4A4]">
                  {targetRecipients.length} Attendees ({totalPaxTargeted} Pax)
                </span>
              </div>
              <h2 className="text-xl font-heading font-bold text-[#F8FAFC] mt-1.5 flex items-center gap-2">
                Push Notification for {event.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[#F8FAFC]">
                  <Calendar className="w-3.5 h-3.5 text-[#4AB4A4]" />
                  {event.time}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#F8FAFC]">
                  <MapPin className="w-3.5 h-3.5 text-[#FF751F]" />
                  {event.venue} ({event.area})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#202B61] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Delivery Channel Guarantee Banner */}
        <div className="px-6 py-2.5 bg-[#0C1230] border-b border-[#202B61] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <ShieldCheck className="w-4 h-4 text-[#4AB4A4] shrink-0" />
            <span>
              <strong>Dual Channel Dispatch:</strong> Notifies attendees on both <strong>Email</strong> and <strong>WhatsApp</strong>.
            </span>
          </div>
          <div className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FFD230]/15 text-[#FFD230] border border-[#FFD230]/30 font-medium self-start sm:self-auto flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-[#FFD230]" />
            <span>If WhatsApp unavailable, <strong>Email is sent anyway</strong></span>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 py-2.5 bg-[#10173E] border-b border-[#202B61] flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'compose'
                  ? 'bg-[#FF751F] text-white shadow-md shadow-[#FF751F]/25'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A255C]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Compose Message</span>
            </button>
            <button
              onClick={() => setActiveTab('email_preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'email_preview'
                  ? 'bg-[#4AB4A4] text-[#10173E] font-black shadow-md shadow-[#4AB4A4]/25'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A255C]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp_preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'whatsapp_preview'
                  ? 'bg-[#25D366] text-[#0C1230] font-black shadow-md shadow-[#25D366]/25'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A255C]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('recipients')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'recipients'
                  ? 'bg-[#9440DD] text-white shadow-md shadow-[#9440DD]/25'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A255C]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Recipients ({targetRecipients.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-[#94A3B8] hidden md:flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#25D366]">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              {whatsappReadyRecipients.length} WA Ready
            </span>
            <span className="flex items-center gap-1 text-[#FFD230]">
              <span className="w-2 h-2 rounded-full bg-[#FFD230]" />
              {whatsappUnavailableRecipients.length} Email-only Fallback
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success Banner if Sent */}
          {sendResult && (
            <div
              className={`p-5 rounded-2xl border flex flex-col gap-3 animate-in fade-in ${
                sendResult.success
                  ? 'bg-[#4AB4A4]/15 border-[#4AB4A4]/40 text-[#4AB4A4]'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#4AB4A4] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Push Notifications Dispatched Successfully!
                    </h4>
                    <p className="text-xs text-[#CBD5E1] mt-0.5">
                      {sendResult.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSendResult(null)}
                  className="text-xs opacity-75 hover:opacity-100 text-white p-1"
                >
                  Dismiss
                </button>
              </div>

              {/* Delivery Stats Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#4AB4A4]/30 text-xs">
                <div className="p-2.5 rounded-xl bg-[#10173E] border border-[#202B61] flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#4AB4A4]" />
                    Email Dispatched
                  </span>
                  <span className="font-bold text-white">
                    {sendResult.emailSentCount} / {sendResult.totalRecipients} (100%)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#10173E] border border-[#202B61] flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    WhatsApp Dispatched
                  </span>
                  <span className="font-bold text-[#25D366]">
                    {sendResult.whatsappSentCount} attendees
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#10173E] border border-[#202B61] flex items-center justify-between">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FFD230]" />
                    WA Unavailable (Email Sent)
                  </span>
                  <span className="font-bold text-[#FFD230]">
                    {sendResult.whatsappUnavailableCount} attendees
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: COMPOSE */}
          {activeTab === 'compose' && (
            <div className="space-y-5">
              {/* Presets Row */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD230]" />
                  <span>Quick Message Presets</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('reminder')}
                    className="p-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] hover:border-[#FF751F] text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-[#F8FAFC] group-hover:text-[#FF751F] flex items-center gap-1">
                      <span>⏳ Event Reminder</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 line-clamp-1">Upcoming meetup countdown</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('qr_pass')}
                    className="p-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] hover:border-[#4AB4A4] text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-[#F8FAFC] group-hover:text-[#4AB4A4] flex items-center gap-1">
                      <span>🎫 Resend Passes</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 line-clamp-1">Digital QR check-in pass</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('starting_soon')}
                    className="p-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] hover:border-[#FFD230] text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-[#F8FAFC] group-hover:text-[#FFD230] flex items-center gap-1">
                      <span>🚀 Starting in 2h</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 line-clamp-1">Day-of-event alert</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('venue_directions')}
                    className="p-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] hover:border-[#4AB4A4] text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-[#F8FAFC] group-hover:text-[#4AB4A4] flex items-center gap-1">
                      <span>📍 Directions</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 line-clamp-1">Parking & cafe directions</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('custom')}
                    className="p-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] hover:border-[#9440DD] text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-[#F8FAFC] group-hover:text-[#9440DD] flex items-center gap-1">
                      <span>✍️ Custom Update</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 line-clamp-1">Manual announcement</p>
                  </button>
                </div>
              </div>

              {/* Recipient Audience Filter & Dual Channel Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                    Target Recipient Filter
                  </label>
                  <select
                    value={recipientFilter}
                    onChange={e => setRecipientFilter(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10173E] border border-[#283677] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="all">All Registered Participants ({eventRegs.length} attendees)</option>
                    <option value="confirmed_only">Confirmed Payment Only ({confirmedRegs.length} attendees)</option>
                    <option value="pending_only">Pending Check-in Only ({pendingRegs.length} attendees)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                    Notification Category
                  </label>
                  <select
                    value={notificationType}
                    onChange={e => setNotificationType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10173E] border border-[#283677] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#FF751F]"
                  >
                    <option value="event_reminder">Event Countdown Reminder</option>
                    <option value="custom_broadcast">Organizer Event Broadcast</option>
                  </select>
                </div>
              </div>

              {/* Subject Line Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
                  <span>Subject Line / Title</span>
                  <span className="text-[11px] text-[#64748B] lowercase font-normal">{subject.length} characters</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Enter notification subject line..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10173E] border border-[#283677] text-[#F8FAFC] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#FF751F]"
                  />
                </div>
              </div>

              {/* Message Body & Placeholders */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                    Message Body (Dispatched on Email & WhatsApp)
                  </label>
                  <span className="text-[11px] text-[#64748B]">Insert dynamic tag:</span>
                </div>

                {/* Placeholders Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { tag: '{name}', label: 'Attendee Name' },
                    { tag: '{event_title}', label: 'Event Title' },
                    { tag: '{event_venue}', label: 'Venue' },
                    { tag: '{event_time}', label: 'Date/Time' },
                    { tag: '{pax_count}', label: 'Pax Count' },
                    { tag: '{qr_code}', label: 'QR Token' }
                  ].map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => insertPlaceholder(item.tag)}
                      className="px-2 py-1 rounded-lg bg-[#1A255C] hover:bg-[#202B61] border border-[#283677] text-[11px] text-[#4AB4A4] font-mono transition-colors"
                      title={`Insert ${item.label}`}
                    >
                      +{item.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Compose notification message..."
                  className="w-full p-4 rounded-xl bg-[#10173E] border border-[#283677] text-[#F8FAFC] text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#FF751F] font-sans"
                />
              </div>

              {/* Dispatch Channel Options & Fallback Notice */}
              <div className="p-4 rounded-2xl bg-[#10173E] border border-[#202B61] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                    Active Delivery Channels
                  </span>
                  <span className="text-[11px] text-[#4AB4A4] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Fail-Safe Fallback Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email Channel */}
                  <label className="p-3 rounded-xl bg-[#151E4D] border border-[#283677] flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableEmail}
                      disabled={true} // Email is guaranteed fallback, cannot be disabled
                      className="w-4 h-4 rounded text-[#4AB4A4] bg-[#10173E] border-[#283677] mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#4AB4A4]" />
                        <span className="text-xs font-bold text-[#F8FAFC]">Email Notification</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#4AB4A4]/20 text-[#4AB4A4] font-bold">Guaranteed</span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        Dispatches scannable digital passes, QR codes, and calendar reminders to all registered email addresses.
                      </p>
                    </div>
                  </label>

                  {/* WhatsApp Channel */}
                  <label className="p-3 rounded-xl bg-[#151E4D] border border-[#283677] flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableWhatsApp}
                      onChange={e => setEnableWhatsApp(e.target.checked)}
                      className="w-4 h-4 rounded text-[#25D366] bg-[#10173E] border-[#283677] mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                        <span className="text-xs font-bold text-[#F8FAFC]">WhatsApp Notification</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#25D366]/20 text-[#25D366] font-bold">
                          {whatsappReadyRecipients.length} Available
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        Sends direct WhatsApp alerts with check-in details. If WhatsApp is not available, mail is sent anyway!
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-[#10173E] border border-[#202B61] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQrPass}
                    onChange={e => setIncludeQrPass(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF751F] bg-[#10173E] border-[#283677] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#F8FAFC] block">Include Digital QR Pass</span>
                    <span className="text-[11px] text-[#94A3B8]">Embeds attendee scannable entry QR image in the email & token in WhatsApp</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVenueMap}
                    onChange={e => setIncludeVenueMap(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF751F] bg-[#10173E] border-[#283677] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#F8FAFC] block">Include Venue Map Link</span>
                    <span className="text-[11px] text-[#94A3B8]">Direct Google Maps navigation button</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE EMAIL PREVIEW */}
          {activeTab === 'email_preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#4AB4A4]" />
                  Simulated email preview for: <strong>{sampleAttendee.participantName} ({sampleAttendee.participantEmail})</strong>
                </span>
                <span className="text-[11px] text-[#64748B]">Subject: {subject}</span>
              </div>

              <div className="rounded-2xl border border-[#283677] overflow-hidden bg-[#10173E] p-2 sm:p-4">
                <iframe
                  title="Live Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[450px] rounded-xl border border-[#202B61] bg-[#10173E]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LIVE WHATSAPP PREVIEW */}
          {activeTab === 'whatsapp_preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  WhatsApp notification preview for: <strong>{sampleAttendee.participantName} ({sampleAttendee.participantPhone || 'No Phone'})</strong>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold">
                  Direct DM Format
                </span>
              </div>

              {/* Realistic WhatsApp Chat Bubble Container */}
              <div className="rounded-2xl border border-[#283677] bg-[#0B141B] p-4 sm:p-8 flex justify-center">
                <div className="w-full max-w-lg space-y-3">
                  <div className="flex justify-center">
                    <span className="text-[10px] uppercase font-bold text-[#8696A0] bg-[#182229] px-3 py-1 rounded-lg">
                      Today • Social Shuffle Notification
                    </span>
                  </div>

                  <div className="bg-[#005C4B] text-[#E9EDEF] rounded-2xl rounded-tl-none p-4 shadow-md text-xs sm:text-sm whitespace-pre-wrap font-sans leading-relaxed border border-[#02735E]">
                    {previewWhatsAppText}
                    <div className="text-right text-[10px] text-[#8696A0] mt-2">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111B21] border border-[#222E35] text-xs text-[#8696A0] flex items-center justify-between">
                    <span>Target Phone: <strong className="text-white">{sampleAttendee.participantPhone || 'Unavailable'}</strong></span>
                    {isWhatsAppEligiblePhone(sampleAttendee.participantPhone) ? (
                      <span className="text-[#25D366] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> WhatsApp Verified
                      </span>
                    ) : (
                      <span className="text-[#FFD230] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Fallback to Email Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECIPIENTS & CHANNEL BREAKDOWN */}
          {activeTab === 'recipients' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[#94A3B8]">
                  Targeting <strong>{targetRecipients.length}</strong> participants across dual channels
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#25D366] font-bold">
                    {whatsappReadyRecipients.length} WhatsApp Ready
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FFD230]/20 text-[#FFD230] font-bold">
                    {whatsappUnavailableRecipients.length} Email Fallback
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#283677] overflow-hidden">
                <div className="max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#10173E] text-[#94A3B8] border-b border-[#202B61] uppercase text-[10px] tracking-wider sticky top-0">
                      <tr>
                        <th className="p-3">Attendee Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">WhatsApp Channel Status</th>
                        <th className="p-3 text-center">Pax</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202B61]">
                      {targetRecipients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-[#94A3B8]">
                            No participants match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        targetRecipients.map(r => {
                          const waEligible = isWhatsAppEligiblePhone(r.participantPhone);
                          const waMsg = generateEventWhatsAppNotification(r, event, message);
                          const waUrl = waEligible && r.participantPhone ? getDirectWhatsAppUrl(r.participantPhone, waMsg) : '#';

                          return (
                            <tr key={r.id} className="hover:bg-white/[0.02]">
                              <td className="p-3 font-bold text-[#F8FAFC]">
                                {r.participantName}
                              </td>
                              <td className="p-3 text-[#94A3B8] font-mono text-[11px]">
                                {r.participantEmail}
                              </td>
                              <td className="p-3 text-[#CBD5E1] text-[11px]">
                                {r.participantPhone || <span className="text-[#64748B] italic">Not provided</span>}
                              </td>
                              <td className="p-3">
                                {waEligible ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                    WhatsApp Ready
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD230]/20 text-[#FFD230] text-[10px] font-bold"
                                    title="WhatsApp phone unavailable or invalid. System will send email anyway!"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-[#FFD230]" />
                                    Unavailable → Email Fallback
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-[#FF751F]">
                                {r.paxCount}
                              </td>
                              <td className="p-3 text-right">
                                {waEligible ? (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] text-[10px] font-bold transition-colors"
                                    title="Open WhatsApp chat directly in new tab"
                                  >
                                    <span>Chat</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-[#64748B]">
                                    Email only
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-5 bg-[#10173E] border-t border-[#202B61] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#94A3B8] flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#4AB4A4]" />
            <span>
              Targeting <strong>{targetRecipients.length}</strong> participants ({whatsappReadyRecipients.length} Email + WhatsApp, {whatsappUnavailableRecipients.length} Email anyway)
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1A255C] hover:bg-[#202B61] text-[#94A3B8] hover:text-[#F8FAFC] font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-confirm-send-broadcast"
              disabled={isSending || targetRecipients.length === 0}
              onClick={handleSendBroadcast}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                isSending || targetRecipients.length === 0
                  ? 'bg-[#202B61] text-[#64748B] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF751F] to-[#E66310] hover:from-[#FF8A3D] hover:to-[#FF751F] text-white shadow-[#FF751F]/30'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Dispatching to Email & WhatsApp...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Push Notification to {targetRecipients.length} Attendees</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
