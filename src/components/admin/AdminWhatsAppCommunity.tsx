import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Calendar,
  Users,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  History,
  Trash2
} from 'lucide-react';
import {
  WHATSAPP_COMMUNITY_PRESETS,
  OFFICIAL_WHATSAPP_GROUPS,
  formatWhatsAppMessage,
  getWhatsAppShareUrl
} from '../../utils/whatsappTemplates';
import { ShuffleEvent, WhatsAppMessageType, WhatsAppCommunityBroadcastRecord } from '../../types';
import { AdminWhatsAppBroadcastModal } from './AdminWhatsAppBroadcastModal';

export const AdminWhatsAppCommunity: React.FC = () => {
  const { events, registrations, currentParticipant } = useApp();

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const [selectedEventId, setSelectedEventId] = useState<string>(
    upcomingEvents.length > 0 ? upcomingEvents[0].id : events[0]?.id || ''
  );
  const [modalEvent, setModalEvent] = useState<ShuffleEvent | null>(null);

  // Local storage history of manual broadcasts
  const [history, setHistory] = useState<WhatsAppCommunityBroadcastRecord[]>(() => {
    try {
      const saved = localStorage.getItem('socialshuffle_wa_broadcasts');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Initial demo records
    return [
      {
        id: 'wa-demo-1',
        eventId: events[0]?.id,
        eventTitle: events[0]?.title || 'Social Shuffle #35',
        templateType: 'announcement',
        messageContent: '🎲 SOCIAL SHUFFLE PUNE — NEW MEETUP ANNOUNCEMENT! 🎲\nLane 7, Koregaon Park. Grab tickets!',
        targetGroup: 'Social Shuffle Pune — Official Announcements (Admin Only)',
        triggeredBy: 'Parimal Shete (Admin)',
        triggeredAt: 'Yesterday, 5:30 PM',
        method: 'whatsapp_web'
      },
      {
        id: 'wa-demo-2',
        eventId: events[0]?.id,
        eventTitle: events[0]?.title || 'Social Shuffle #35',
        templateType: 'seats_remaining',
        messageContent: '🚨 HURRY UP! ONLY 12 SEATS REMAINING! 🚨\nTable allocations are filling up fast!',
        targetGroup: 'Social Shuffle — Table Talk & Game Matchmaking',
        triggeredBy: 'Aman (Host)',
        triggeredAt: 'Today, 11:15 AM',
        method: 'copied_clipboard'
      }
    ];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleBroadcastLogged = (newRecord: WhatsAppCommunityBroadcastRecord) => {
    setHistory(prev => [newRecord, ...prev]);
  };

  const handleCopyHistory = async (rec: WhatsAppCommunityBroadcastRecord) => {
    try {
      await navigator.clipboard.writeText(rec.messageContent);
      setCopiedId(rec.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear local WhatsApp broadcast logs?')) {
      setHistory([]);
      localStorage.removeItem('socialshuffle_wa_broadcasts');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0C1B29] via-[#0E1B2D] to-[#0A1728] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Community Broadcast Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Strictly Manual Trigger</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>WhatsApp Community Dispatcher</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Manually trigger announcements, real-time "seats remaining" urgency drops, housefull notices, and game rosters across Pune's 2,400+ member WhatsApp groups. All drafts are fully customizable before sending.
            </p>
          </div>

          <button
            id="btn-compose-wa-broadcast"
            onClick={() => setModalEvent(selectedEvent)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Compose WhatsApp Post</span>
          </button>
        </div>
      </div>

      {/* Official Groups Directory Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OFFICIAL_WHATSAPP_GROUPS.map(grp => (
          <div
            key={grp.id}
            className="p-4 rounded-2xl bg-[#111728] border border-slate-800 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="space-y-1 truncate">
              <div className="text-xs font-bold text-white truncate">{grp.name}</div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{grp.memberCount}</span>
              </div>
            </div>
            <a
              href={grp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Open WhatsApp Group"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Event Selection & Live Presets Preview Grid */}
      <div className="p-6 rounded-3xl bg-[#0D1526] border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Broadcast by Event & Quick Triggers</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select an upcoming meetup to preview pre-filled templates with real-time capacity and seats left
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Select Event:</span>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  #{ev.number} — {ev.title} ({ev.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Preset Cards for the Selected Event */}
        {selectedEvent && (() => {
          const evRegs = registrations.filter(
            r => r.eventId === selectedEvent.id && r.attendanceStatus !== 'Cancelled'
          );
          const pax = evRegs.reduce((acc, curr) => acc + curr.paxCount, 0);
          const left = Math.max(0, selectedEvent.capacity - pax);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {WHATSAPP_COMMUNITY_PRESETS.map(preset => {
                const previewText = formatWhatsAppMessage(preset.template, selectedEvent, pax, window.location.origin);
                const firstLine = previewText.split('\n')[0].replace(/\*/g, '');

                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl bg-[#131C33] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xl">{preset.emoji}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {preset.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {preset.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {preset.description}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 text-[11px] font-mono text-slate-300 line-clamp-3 leading-relaxed">
                        {previewText}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setModalEvent(selectedEvent);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Customize & Send</span>
                      </button>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(previewText);
                          setCopiedId(preset.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                        title="Quick copy template"
                      >
                        {copiedId === preset.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Manual Broadcast History & Audit Log */}
      <div className="p-6 rounded-3xl bg-[#0D1526] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Recent Manual WhatsApp Broadcasts</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {history.length} records
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
            <p>No manual broadcasts triggered yet. Click "Compose WhatsApp Post" above to broadcast to your community group!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map(rec => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-[#111728] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{rec.eventTitle || 'Community Update'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {rec.templateType.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">to {rec.targetGroup}</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] line-clamp-1">
                    {rec.messageContent}
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Triggered manually by <strong>{rec.triggeredBy}</strong> at {rec.triggeredAt} via{' '}
                    {rec.method === 'whatsapp_web' ? 'WhatsApp Web' : 'Clipboard Copy'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                  <button
                    onClick={() => handleCopyHistory(rec)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const url = getWhatsAppShareUrl(rec.messageContent);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Again</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {modalEvent && (
        <AdminWhatsAppBroadcastModal
          event={modalEvent}
          registrations={registrations}
          isOpen={true}
          onClose={() => setModalEvent(null)}
          onBroadcastLogged={handleBroadcastLogged}
        />
      )}
    </div>
  );
};
