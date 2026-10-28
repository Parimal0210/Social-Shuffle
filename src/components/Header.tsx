import React, { useState } from 'react';
import {
  Shield,
  User,
  Wifi,
  WifiOff,
  Bell,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  UserPlus,
  Calendar,
  Mail,
  Users,
  X,
  Globe
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
    switchToGuestView,
    loginAsDemoParticipant,
    loginAsDemoAdmin,
    openAuthModal,
    isOfflineMode,
    toggleOfflineMode,
    offlineSyncQueue,
    syncOfflineQueue,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetDatabase
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [viewingEmailNotif, setViewingEmailNotif] = useState<NotificationItem | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#10173E]/95 backdrop-blur-md border-b border-[#202B61] px-3.5 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SocialShuffleLogo size="sm" showWordmark={true} showTagline={true} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Attendance Mode Simulator (Only visible to admin during event hosting) */}
          {isAdminUser && (
            <button
              id="btn-toggle-offline"
              onClick={toggleOfflineMode}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isOfflineMode
                  ? 'bg-[#FFD230]/15 border-[#FFD230]/40 text-[#FFD230]'
                  : 'bg-[#182255] border-[#283677] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#4AB4A4]/40'
              }`}
              title="Toggle offline attendance simulation mode"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#FFD230]" />
                  <span>Offline Mode</span>
                  {offlineSyncQueue.length > 0 && (
                    <span className="bg-[#FFD230] text-[#10173E] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {offlineSyncQueue.length}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#4AB4A4]" />
                  <span>Online</span>
                </>
              )}
            </button>
          )}

          {/* Sync Button if offline items exist */}
          {isAdminUser && offlineSyncQueue.length > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#4AB4A4]/20 border border-[#4AB4A4]/40 text-[#4AB4A4] hover:bg-[#4AB4A4]/30 transition-all"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync ({offlineSyncQueue.length})</span>
            </button>
          )}

          {/* Social Shuffle Pulse Notifications: Shown ONLY to logged-in participants and admins */}
          {isAuthenticated && (
            <div className="relative">
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
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-[#4AB4A4] font-bold px-2 py-0.5 rounded-md bg-[#4AB4A4]/10 border border-[#4AB4A4]/30">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#94A3B8]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl text-left border ${
                            n.read
                              ? 'bg-[#181715] border-[#202B61] text-[#94A3B8]'
                              : 'bg-[#252320] border-[#4AB4A4]/30 text-[#F8FAFC]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 font-heading">
                              {n.type === 'event' && <Calendar className="w-3.5 h-3.5 text-[#4AB4A4] shrink-0" />}
                              {n.type === 'registration' && <Sparkles className="w-3.5 h-3.5 text-[#FFD230] shrink-0" />}
                              {n.type === 'community' && <Users className="w-3.5 h-3.5 text-[#9440DD] shrink-0" />}
                              <span>{n.title}</span>
                            </h4>
                            <span className="text-[10px] text-[#64748B] whitespace-nowrap">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">{n.message}</p>
                          {n.emailHtml && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#4AB4A4] pt-1.5 border-t border-white/5">
                              <Mail className="w-3.5 h-3.5 text-[#4AB4A4] shrink-0" />
                              <span>Pass confirmation & QR delivered to your registered email</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 
            ========================================================================================
            [TESTING CONTROL: Perspective Switcher (Guest View, Participant, Admin)]
            Commented out per instructions so role is strictly determined by authentication state:
            - Not logged in  => Guest View
            - Logged in User => Participant View
            - Administrator  => Admin View
            (Uncomment this block anytime in the future for quick developer testing)
            ========================================================================================
          <div className="flex items-center p-1 rounded-xl bg-[#090F22] border border-[#1F305E]">
            <button
              id="role-switch-guest"
              onClick={switchToGuestView}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isGuest
                  ? 'bg-[#4AB4A4] text-[#0A1128] font-bold shadow-md shadow-[#4AB4A4]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View as outside non-registered guest"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guest View</span>
              <span className="sm:hidden">Guest</span>
            </button>
            <button
              id="role-switch-participant"
              onClick={loginAsDemoParticipant}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isAuthenticated && !isAdminUser
                  ? 'bg-[#FF751F] text-white shadow-md shadow-[#FF751F]/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View as registered participant (Priya)"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Participant</span>
              <span className="sm:hidden">User</span>
            </button>
            <button
              id="role-switch-admin"
              onClick={loginAsDemoAdmin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isAdminUser && role === 'admin'
                  ? 'bg-[#9440DD] text-white font-bold shadow-md shadow-[#9440DD]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View as administrator (Aman)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>
            ========================================================================================
          */}

          {/* User Profile / Auth State Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                id="btn-user-switch"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#182255] border border-[#283677] hover:border-[#FF751F]/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF751F] to-[#9440DD] flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden border border-[#FF751F]/30">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.[0] || 'U'
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-[#F8FAFC] block truncate max-w-[100px]">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] block -mt-0.5">
                    {isAdminUser ? 'Admin' : currentUser?.area || 'Pune Shuffler'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1E1D1A] border border-[#283677] rounded-xl shadow-2xl z-50 p-2 text-left animate-in fade-in duration-150">
                  {/* User Profile Summary */}
                  <div className="p-2.5 mb-2 bg-[#10173E] rounded-lg border border-[#202B61]">
                    <div className="flex items-center gap-2.5">
                      {currentUser?.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-full border border-[#FF751F]/40 object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#FF751F]/20 border border-[#FF751F]/40 flex items-center justify-center font-bold text-[#FF8566]">
                          {currentUser?.name?.[0] || 'S'}
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
                          {isAdminUser ? 'Super Admin' : `Participant · ${currentUser?.area}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Switch Persona ONLY for admin testing */}
                  {isAdminUser ? (
                    <>
                      <div className="px-2 py-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Switch Active Participant (Admin Test)
                        </span>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {participants.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setCurrentParticipantId(p.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                              currentParticipant.id === p.id
                                ? 'bg-[#FF751F]/20 text-[#FF8566] font-semibold'
                                : 'text-[#CBD5E1] hover:bg-[#2A2722]'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {currentParticipant.id === p.id && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#4AB4A4] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}

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
                      <span>Log Out / Switch Account</span>
                    </button>
                  </div>

                  {isAdminUser && (
                    <div className="mt-2 pt-2 border-t border-[#202B61] px-1">
                      <button
                        onClick={() => {
                          if (confirm('Reset sample Pune meetup data back to defaults?')) {
                            resetDatabase();
                            setShowUserMenu(false);
                          }
                        }}
                        className="w-full text-center py-1 text-[10px] text-rose-400/80 hover:text-rose-300 transition-colors"
                      >
                        Reset Sample Database
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#151E4D] border border-[#283677] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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


