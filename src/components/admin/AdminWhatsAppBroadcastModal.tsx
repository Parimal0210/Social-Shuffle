import React, { useState, useEffect } from 'react';
import {
  ShuffleEvent,
  Registration,
  WhatsAppMessageType,
  WhatsAppCommunityBroadcastRecord
} from '../../types';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Flame,
  Clock,
  Ban,
  Dices,
  Edit3,
  Layers,
  Users
} from 'lucide-react';
import {
  WHATSAPP_COMMUNITY_PRESETS,
  OFFICIAL_WHATSAPP_GROUPS,
  formatWhatsAppMessage,
  getWhatsAppShareUrl,
  WhatsAppPreset
} from '../../utils/whatsappTemplates';
import { useApp } from '../../context/AppContext';

interface AdminWhatsAppBroadcastModalProps {
  event: ShuffleEvent;
  registrations: Registration[];
  isOpen: boolean;
  onClose: () => void;
  onBroadcastLogged?: (record: WhatsAppCommunityBroadcastRecord) => void;
}

export const AdminWhatsAppBroadcastModal: React.FC<AdminWhatsAppBroadcastModalProps> = ({
  event,
  registrations,
  isOpen,
  onClose,
  onBroadcastLogged
}) => {
  const { currentParticipant } = useApp();

  const activeEventRegs = registrations.filter(
    r => r.eventId === event.id && r.attendanceStatus !== 'Cancelled'
  );
  const totalRegisteredPax = activeEventRegs.reduce((acc, curr) => acc + curr.paxCount, 0);
  const seatsLeft = Math.max(0, event.capacity - totalRegisteredPax);

  // Default to sold_out if 0 seats, seats_remaining if <= 15 seats, else announcement
  const initialPresetId: WhatsAppMessageType =
    seatsLeft === 0 ? 'sold_out' : seatsLeft <= 15 ? 'seats_remaining' : 'announcement';

  const [selectedPresetId, setSelectedPresetId] = useState<WhatsAppMessageType>(initialPresetId);
  const [selectedGroup, setSelectedGroup] = useState<string>(OFFICIAL_WHATSAPP_GROUPS[0].name);
  const [customGroupUrl, setCustomGroupUrl] = useState<string>('https://chat.whatsapp.com/demo-pune-announcements');
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [dispatchedToast, setDispatchedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Initialize or re-populate message when preset changes
  useEffect(() => {
    const preset = WHATSAPP_COMMUNITY_PRESETS.find(p => p.id === selectedPresetId);
    if (preset) {
      const generated = formatWhatsAppMessage(
        preset.template,
        event,
        totalRegisteredPax,
        window.location.origin
      );
      setEditableMessage(generated);
    }
  }, [selectedPresetId, event, totalRegisteredPax]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: WhatsAppPreset) => {
    setSelectedPresetId(preset.id);
  };

  const handleInsertToken = (token: string) => {
    setEditableMessage(prev => prev + ` ${token} `);
  };

  const logDispatch = (method: 'whatsapp_web' | 'copied_clipboard' | 'group_link') => {
    const record: WhatsAppCommunityBroadcastRecord = {
      id: `wa-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      templateType: selectedPresetId,
      messageContent: editableMessage,
      targetGroup: selectedGroup,
      triggeredBy: currentParticipant?.name || 'Admin',
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method
    };

    if (onBroadcastLogged) {
      onBroadcastLogged(record);
    }

    // Persist in localStorage broadcast history
    try {
      const existingStr = localStorage.getItem('socialshuffle_wa_broadcasts');
      const existing: WhatsAppCommunityBroadcastRecord[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('socialshuffle_wa_broadcasts', JSON.stringify([record, ...existing.slice(0, 49)]));
    } catch {
      // ignore storage errors
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopiedToast(true);
      logDispatch('copied_clipboard');
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppShareUrl(editableMessage);
    logDispatch('whatsapp_web');
    setDispatchedToast(true);
    setTimeout(() => setDispatchedToast(false), 3500);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenGroupLink = () => {
    logDispatch('group_link');
    window.open(customGroupUrl, '_blank', 'noopener,noreferrer');
  };

  // Convert basic WhatsApp formatting to HTML for live bubble preview
  const renderFormattedPreview = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Parse bold *text*
      let html = line.replace(/\*([^*]+)\*/g, '<strong class="font-bold text-white">$1</strong>');
      // Parse italic _text_
      html = html.replace(/_([^_]+)_/g, '<em class="italic text-slate-300">$1</em>');
      // Parse strikethrough ~text~
      html = html.replace(/~([^~]+)~/g, '<del class="line-through text-slate-400">$1</del>');

      return (
        <div
          key={idx}
          className="min-h-[1.25rem] leading-relaxed text-[13px] text-slate-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0E1528] border-2 border-emerald-500/40 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Post to WhatsApp Community
                </h3>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Manual Trigger Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Craft, modify, and manually post announcements or spot drops for <strong>Event #{event.number} ({event.venue})</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Manual Trigger Protection:</strong> No messages are sent automatically. Review and modify the draft below, then click <strong>"Post on WhatsApp"</strong> or <strong>"Copy Text"</strong> to broadcast manually.
          </div>
        </div>

        {/* Real-time Event Metrics & Seat Urgency Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Total Capacity</span>
            <span className="text-sm font-bold text-white">{event.capacity} Shufflers</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Registered Pax</span>
            <span className="text-sm font-bold text-emerald-400">{totalRegisteredPax} Booked</span>
          </div>
          <div className={`p-2.5 rounded-xl border ${seatsLeft <= 5 ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-slate-900/80 border-slate-800 text-amber-300'}`}>
            <span className="text-[10px] text-slate-400 block font-semibold">Remaining Seats</span>
            <span className="text-sm font-black flex items-center gap-1">
              {seatsLeft <= 0 ? '⛔ HOUSEFULL' : `⚡ ${seatsLeft} Seats Left`}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Pass Fee</span>
            <span className="text-sm font-bold text-purple-300">₹{event.ticketPrice}</span>
          </div>
        </div>

        {/* Template Presets Picker */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
            <span>Choose Message Template Preset:</span>
            <span className="text-[11px] text-slate-400 font-normal">All templates can be fully edited</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WHATSAPP_COMMUNITY_PRESETS.map(preset => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-[#121A30] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-sm">{preset.emoji}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {preset.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate text-white">{preset.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target WhatsApp Group Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Target WhatsApp Community Channel:
            </label>
            <select
              value={selectedGroup}
              onChange={e => {
                setSelectedGroup(e.target.value);
                const g = OFFICIAL_WHATSAPP_GROUPS.find(grp => grp.name === e.target.value);
                if (g) setCustomGroupUrl(g.link);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
            >
              {OFFICIAL_WHATSAPP_GROUPS.map(grp => (
                <option key={grp.id} value={grp.name}>
                  {grp.name} ({grp.memberCount})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Community Invite Link (Optional):
            </label>
            <input
              type="text"
              value={customGroupUrl}
              onChange={e => setCustomGroupUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Editor vs Preview Tab bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'editor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Message Editor (Modifiable)</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Chat Bubble Preview</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            {editableMessage.length} characters
          </div>
        </div>

        {/* Dynamic Tokens quick-inserter */}
        {activeTab === 'editor' && (
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Click to append dynamic event tag:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Event Title', val: event.title },
                { label: `Event #${event.number}`, val: `Social Shuffle #${event.number}` },
                { label: 'Seats Remaining', val: `${seatsLeft} seats remaining` },
                { label: 'Venue', val: event.venue },
                { label: 'Timing', val: event.time },
                { label: 'Ticket Fee', val: `₹${event.ticketPrice}` },
                { label: 'RSVP Link', val: window.location.origin }
              ].map(tag => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleInsertToken(tag.val)}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors border border-slate-700"
                >
                  + {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Live Modifiable Textarea */}
        {activeTab === 'editor' && (
          <div className="space-y-2">
            <textarea
              rows={10}
              value={editableMessage}
              onChange={e => setEditableMessage(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#090D1A] border border-slate-700 text-white text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              placeholder="Type your WhatsApp announcement message here..."
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Supports WhatsApp markdown: <strong>*bold*</strong>, <em>_italics_</em>, ~strikethrough~, and emojis.</span>
              <button
                type="button"
                onClick={() => {
                  const preset = WHATSAPP_COMMUNITY_PRESETS.find(p => p.id === selectedPresetId);
                  if (preset) {
                    setEditableMessage(
                      formatWhatsAppMessage(preset.template, event, totalRegisteredPax, window.location.origin)
                    );
                  }
                }}
                className="text-emerald-400 hover:underline"
              >
                Reset to Preset Default
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: WhatsApp Chat Bubble Preview */}
        {activeTab === 'preview' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0B141A] border border-slate-800 shadow-inner flex justify-center">
            <div className="max-w-md w-full space-y-3">
              {/* Fake WhatsApp Group Header */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#202C33] text-white">
                <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-xs">
                  SS
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold truncate">{selectedGroup}</div>
                  <div className="text-[10px] text-slate-400">Parimal, Aman, Tanvi, 2.4k others</div>
                </div>
              </div>

              {/* Chat Speech Bubble */}
              <div className="p-3.5 rounded-2xl rounded-tr-none bg-[#005C4B] text-white shadow-md relative ml-auto max-w-[92%] space-y-1">
                <div className="text-[10px] font-bold text-[#25D366] pb-1">
                  Social Shuffle Admin (Official)
                </div>
                {renderFormattedPreview(editableMessage)}
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 pt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-[#53bdeb]">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toasts */}
        {copiedToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Message copied to clipboard! You can now paste into WhatsApp.</span>
          </div>
        )}

        {dispatchedToast && (
          <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-2">
            <Send className="w-4 h-4 text-blue-400" />
            <span>WhatsApp opened! Confirm in WhatsApp to send to the community group.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleOpenGroupLink}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Community Group</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors active:scale-95"
            >
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>Copy Message</span>
            </button>

            <button
              id="btn-trigger-whatsapp-send"
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Post on WhatsApp Group</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
