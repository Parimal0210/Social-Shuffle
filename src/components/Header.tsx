import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  User,
  Bell,
  CheckCircle,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  UserPlus,
  Calendar,
  Mail,
  Users,
  X,
  Globe,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';
import { SocialShuffleLogo } from './SocialShuffleLogo';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentParticipant,
    setCurrentParticipantId,
    participants,
    adminName,
    currentUser,
    isAuthenticated,
    isAdminUser,
    isGuest,
    logout,
    openAuthModal,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    events,
    registrations
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [viewingEmailNotif, setViewingEmailNotif] = useState<NotificationItem | null>(null);

  const pulseRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Social Shuffle Pulse: Automatically collapse on outside click, focus lost, or Escape
  useEffect(() => {
    if (!showNotifMenu) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (pulseRef.current && !pulseRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (pulseRef.current && !pulseRef.current.contains(e.relatedTarget as Node)) {
        setShowNotifMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifMenu]);

  // User Profile Menu: Automatically collapse on outside click, focus lost, or Escape
  useEffect(() => {
    if (!showUserMenu) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.relatedTarget as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  // Email Notification Modal: Collapse on Escape
  useEffect(() => {
    if (!viewingEmailNotif) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewingEmailNotif(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewingEmailNotif]);

  // Filter notifications for Social Shuffle Pulse:
  // 1. Remove session expired notifications completely
  // 2. Remove notifications for events that are completed
  // 3. Show registration notifications ONLY if current user registered for that event
  const userPulseNotifications = notifications.filter(n => {
    // 1. Suppress Session Expired
    const isExpired =
      n.id.toLowerCase().includes('expired') ||
      n.title?.toLowerCase().includes('session expired') ||
      n.message?.toLowerCase().includes('session expired') ||
      n.message?.toLowerCase().includes('logged out after 30 days');
    if (isExpired) return false;

    // 2. Remove after event is completed
    if (n.eventId) {
      const ev = events.find(e => e.id === n.eventId);
      if (ev && (ev.status === 'completed' || new Date(ev.date).getTime() < Date.now() - 24 * 3600 * 1000)) {
        return false;
      }
    }
    const matchingCompletedEvent = events.find(e =>
      e.status === 'completed' &&
      (n.title?.toLowerCase().includes(e.title.toLowerCase()) || n.message?.toLowerCase().includes(e.title.toLowerCase()))
    );
    if (matchingCompletedEvent) {
      return false;
    }

    // 3. Registered notification: show ONLY if that participant has registered for that event
    const isRegistrationNotif =
      n.type === 'registration' ||
      Boolean(n.registrationId) ||
      n.id.toLowerCase().includes('registration') ||
      n.title?.toLowerCase().includes('registered for') ||
      n.title?.toLowerCase().includes('registration confirmed');

    if (isRegistrationNotif) {
      const userEmail = (currentUser?.email || currentParticipant?.email || '').toLowerCase().trim();
      const userId = currentUser?.id || '';
      const participantId = currentUser?.participantId || currentParticipant?.id || '';

      if (!userEmail && !userId && !participantId) {
        return false;
      }

      const matchesEmail = Boolean(n.recipientEmail && userEmail && n.recipientEmail.toLowerCase().trim() === userEmail);
      const matchesUserId = Boolean(n.userId && (n.userId === userId || n.userId === participantId || n.userId.toLowerCase() === userEmail));
      
      let matchesUserReg = false;
      if (n.registrationId) {
        matchesUserReg = registrations.some(r =>
          r.id === n.registrationId && (
            (userEmail && r.participantEmail.toLowerCase().trim() === userEmail) ||
            (participantId && r.participantId === participantId)
          )
        );
      } else if (n.eventId) {
        matchesUserReg = registrations.some(r =>
          r.eventId === n.eventId && (
            (userEmail && r.participantEmail.toLowerCase().trim() === userEmail) ||
            (participantId && r.participantId === participantId)
          )
        );
      }

      if (!matchesEmail && !matchesUserId && !matchesUserReg) {
        return false;
      }
    }

    return true;
  });

  const unreadCount = userPulseNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#10173E]/95 backdrop-blur-md border-b border-[#202B61] px-3.5 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SocialShuffleLogo size="sm" showWordmark={true} showTagline={true} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Social Shuffle Pulse Notifications: Shown ONLY to logged-in participants and admins */}
          {isAuthenticated && (
            <div ref={pulseRef} className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg bg-[#182255] border border-[#283677] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#4AB4A4]/40 transition-colors"
                aria-label="Social Shuffle Pulse Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF751F] text-white text-[10px] font-bold flex items-center justify-center shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1E1D1A] border border-[#283677] rounded-xl shadow-2xl z-50 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#202B61]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FFD230]" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-heading">Social Shuffle Pulse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <>
                          <span className="text-[10px] text-[#4AB4A4] font-bold px-2 py-0.5 rounded-md bg-[#4AB4A4]/10 border border-[#4AB4A4]/30">
                            {unreadCount} New
                          </span>
                          <button
                            type="button"
                            onClick={() => markAllNotificationsRead()}
                            className="text-[10px] text-[#94A3B8] hover:text-white underline"
                          >
                            Mark all read
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {userPulseNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#94A3B8]">
                        No notifications yet.
                      </div>
                    ) : (
                      userPulseNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative group ${
                            n.read
                              ? 'bg-[#181715] border-[#202B61] text-[#94A3B8] opacity-80'
                              : 'bg-[#252320] border-[#4AB4A4]/50 text-[#F8FAFC] shadow-sm'
                          }`}
                          title="Click to mark as read"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 font-heading pr-2">
                              {n.type === 'event' && <Calendar className="w-3.5 h-3.5 text-[#4AB4A4] shrink-0" />}
                              {n.type === 'registration' && <Sparkles className="w-3.5 h-3.5 text-[#FFD230] shrink-0" />}
                              {n.type === 'community' && <Users className="w-3.5 h-3.5 text-[#9440DD] shrink-0" />}
                              <span>{n.title}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {!n.read ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#4AB4A4]/20 text-[#4AB4A4] border border-[#4AB4A4]/30 animate-pulse">
                                  New
                                </span>
                              ) : (
                                <span className="text-[9px] text-[#64748B] flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-[#4AB4A4]" />
                                  Read
                                </span>
                              )}
                              <span className="text-[10px] text-[#64748B] whitespace-nowrap">{n.timestamp}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(n.id);
                                }}
                                className="p-1 rounded-md text-[#64748B] hover:text-[#EF4444] hover:bg-white/10 transition-colors"
                                title="Close notification"
                                aria-label="Close notification"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">{n.message}</p>
                          {n.emailHtml && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationRead(n.id);
                                setViewingEmailNotif(n);
                              }}
                              className="mt-2 flex items-center gap-1.5 text-[10px] text-[#4AB4A4] hover:text-[#2EB899] pt-1.5 border-t border-white/5 w-full text-left"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#4AB4A4] shrink-0" />
                              <span className="underline">View Pass / Delivered Email Details</span>
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State Menu */}
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                id="btn-user-switch"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
                  isAdminUser
                    ? 'bg-gradient-to-r from-[#1E1B4B] to-[#151E4D] border-[#9440DD]/50 hover:border-[#9440DD] shadow-sm'
                    : 'bg-[#182255] border-[#283677] hover:border-[#FF751F]/50'
                }`}
                title={isAdminUser ? `Logged in as Super Admin: ${currentUser?.name} (${currentUser?.designation})` : undefined}
              >
                <div className="relative shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden border ${
                    isAdminUser
                      ? 'bg-gradient-to-br from-[#9440DD] to-[#7928CA] border-[#C084FC]/40'
                      : 'bg-gradient-to-br from-[#FF751F] to-[#9440DD] border-[#FF751F]/30'
                  }`}>
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser?.name?.[0] || 'U'
                    )}
                  </div>
                  {isAdminUser && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#10173E] animate-pulse" />
                  )}
                </div>

                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F8FAFC] truncate max-w-[130px] font-heading">
                      {currentUser?.name}
                    </span>
                    {isAdminUser && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#9440DD]/30 text-[#C084FC] border border-[#9440DD]/50">
                        {currentUser?.adminRole || 'Super Admin'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] -mt-0.5 truncate max-w-[160px]">
                    {isAdminUser ? (
                      <span className="text-[#4AB4A4] font-medium">
                        {currentUser?.designation || 'Co-Founder & Architect'}
                      </span>
                    ) : (
                      currentUser?.area || 'Pune Shuffler'
                    )}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#17162E] border border-[#9440DD]/30 rounded-xl shadow-2xl z-50 p-2.5 text-left animate-in fade-in duration-150">
                  {/* User Profile Summary */}
                  <div className="p-3 mb-2 bg-[#10173E] rounded-xl border border-[#202B61]">
                    <div className="flex items-center gap-2.5">
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full border-2 border-[#9440DD]/50 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#9440DD]/20 border-2 border-[#9440DD]/50 flex items-center justify-center font-bold text-[#C084FC] shrink-0">
                          {currentUser?.name?.[0] || 'A'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5 font-heading">
                          <span>{currentUser?.name}</span>
                          {currentUser?.authProvider === 'google' && (
                            <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold">
                              Google
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#94A3B8] truncate">{currentUser?.email}</div>
                        <div className="text-[10px] font-semibold text-[#4AB4A4] mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4AB4A4]"></span>
                          {isAdminUser ? (currentUser?.designation || 'Co-Founder & Super Admin') : `Participant · ${currentUser?.area}`}
                        </div>
                      </div>
                    </div>

                    {/* Extended Admin Profile Details - Displays ALL details */}
                    {isAdminUser && (
                      <div className="mt-2.5 pt-2 border-t border-[#202B61] space-y-1.5 text-[10px]">
                        <div className="flex justify-between items-center text-[#94A3B8]">
                          <span>Official Email:</span>
                          <span className="text-[#F8FAFC] truncate max-w-[150px] font-medium">{currentUser?.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#94A3B8]">
                          <span>Registered Mobile:</span>
                          <span className="text-[#F8FAFC] font-semibold font-mono">{currentUser?.phone || '+91 98220 99887'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#94A3B8]">
                          <span>Administrative Role:</span>
                          <span className="text-[#C084FC] font-bold">{currentUser?.adminRole || 'Super Admin'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#94A3B8]">
                          <span>Designation:</span>
                          <span className="text-[#FFD230] font-medium">{currentUser?.designation}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#94A3B8]">
                          <span>Operational Base:</span>
                          <span className="text-[#F8FAFC]">{currentUser?.area || 'Koregaon Park, Pune'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 
                  {/* Participant actions */}
                  <div className="mt-1 pt-1.5 border-t border-[#202B61] space-y-1">
                    <button
                      onClick={() => {
                        openAuthModal('register');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-[#CBD5E1] hover:bg-[#2A2722] transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#4AB4A4]" />
                      <span>Register New Participant</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-header-signin"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#182255] border border-[#283677] text-[#F8FAFC] hover:border-[#FF751F]/50 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF751F]" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF751F] hover:bg-[#E66310] text-white shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Join Community</span>
                <span className="sm:hidden">Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email Pass / Notification Viewer Modal */}
      {viewingEmailNotif && (
        <div
          onClick={() => setViewingEmailNotif(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#151E4D] border border-[#283677] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
          >
            <div className="p-4 bg-[#182255] border-b border-[#202B61] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4AB4A4]/15 text-[#4AB4A4]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-heading">{viewingEmailNotif.title}</h3>
                  <p className="text-[11px] text-[#94A3B8]">Delivered to {viewingEmailNotif.recipientEmail || 'your email'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingEmailNotif(null)}
                className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#10173E] overflow-y-auto flex-1">
              <iframe
                title="Email Content"
                srcDoc={viewingEmailNotif.emailHtml || `<div style="color:#fff;padding:20px;font-family:sans-serif;">${viewingEmailNotif.message}</div>`}
                className="w-full h-[520px] rounded-xl border border-[#202B61] bg-[#10173E]"
              />
            </div>

            <div className="p-3 bg-[#151E4D] border-t border-[#202B61] flex justify-end">
              <button
                onClick={() => setViewingEmailNotif(null)}
                className="px-4 py-2 rounded-xl bg-[#2A2722] hover:bg-[#34302A] text-[#F8FAFC] font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};


