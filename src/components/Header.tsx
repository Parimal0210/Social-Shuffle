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
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
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
    logout,
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1F305E] px-3.5 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SocialShuffleLogo size="sm" showWordmark={true} showTagline={true} />
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">
            Pune
          </span>
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
                  ? 'bg-[#FFC226]/15 border-[#FFC226]/40 text-[#FFC226]'
                  : 'bg-[#111C3B] border-[#1F305E] text-slate-300 hover:text-white hover:border-[#35C8A8]/40'
              }`}
              title="Toggle offline attendance simulation mode"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#FFC226] animate-pulse" />
                  <span>Offline Mode</span>
                  {offlineSyncQueue.length > 0 && (
                    <span className="bg-[#FFC226] text-[#0A1128] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {offlineSyncQueue.length}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#35C8A8]" />
                  <span>Online</span>
                </>
              )}
            </button>
          )}

          {/* Sync Button if offline items exist */}
          {isAdminUser && offlineSyncQueue.length > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#35C8A8]/20 border border-[#35C8A8]/40 text-[#35C8A8] hover:bg-[#35C8A8]/30 transition-all"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync ({offlineSyncQueue.length})</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-[#111C3B] border border-[#1F305E] text-slate-300 hover:text-white hover:border-[#35C8A8]/40 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6036] text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111C3B] border border-[#1F305E] rounded-xl shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F305E]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FFC226]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Social Shuffle Pulse</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-[#35C8A8] hover:text-[#52e5c5] font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer border ${
                        n.read
                          ? 'bg-[#0A1128]/60 border-[#1F305E]/60 text-slate-400'
                          : 'bg-[#162349] border-[#35C8A8]/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STRICT ROLE-BASED ACCESS CONTROL */}
          {/* ONLY ADMIN USERS can see the Role Switcher. Participants NEVER see or toggle Admin! */}
          {isAdminUser && (
            <div className="flex items-center p-1 rounded-xl bg-[#090F22] border border-[#1F305E]">
              <button
                id="role-switch-admin"
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-[#35C8A8] text-[#0A1128] font-bold shadow-md shadow-[#35C8A8]/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Console</span>
                <span className="sm:hidden">Admin</span>
              </button>
              <button
                id="role-switch-participant"
                onClick={() => setRole('participant')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'participant'
                    ? 'bg-[#FF6036] text-white shadow-md shadow-[#FF6036]/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Participant Preview</span>
                <span className="sm:hidden">User</span>
              </button>
            </div>
          )}

          {/* User Profile / Auth State Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                id="btn-user-switch"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6036] to-[#8F43EE] flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden border border-[#FF6036]/30">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.[0] || 'U'
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[100px]">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {isAdminUser ? 'Admin' : currentUser?.area || 'Pune Shuffler'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#111C3B] border border-[#1F305E] rounded-xl shadow-2xl z-50 p-2 text-left animate-in fade-in duration-150">
                  {/* User Profile Summary */}
                  <div className="p-2.5 mb-2 bg-[#0A1128] rounded-lg border border-[#1F305E]/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#FF6036]/20 border border-[#FF6036]/40 flex items-center justify-center font-bold text-[#FF8566]">
                        {currentUser?.name?.[0] || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
                        <div className="text-[10px] font-semibold text-[#35C8A8] mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#35C8A8]"></span>
                          {isAdminUser ? 'Super Admin' : `Participant • ${currentUser?.area}`}
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
                                ? 'bg-[#FF6036]/20 text-[#FF8566] font-semibold'
                                : 'text-slate-300 hover:bg-[#162349]'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {currentParticipant.id === p.id && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#35C8A8] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}

                  {/* Participant actions */}
                  <div className="mt-1 pt-1.5 border-t border-[#1F305E] space-y-1">
                    <button
                      onClick={() => {
                        openAuthModal('register');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-300 hover:bg-[#162349] transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#35C8A8]" />
                      <span>Register New Participant</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out / Switch Account</span>
                    </button>
                  </div>

                  {isAdminUser && (
                    <div className="mt-2 pt-2 border-t border-[#1F305E] px-1">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111C3B] border border-[#1F305E] text-slate-200 hover:border-[#FF6036]/50 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF6036]" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#FF6036] to-[#FF8566] text-white hover:opacity-95 shadow-md shadow-[#FF6036]/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Join Community</span>
                <span className="sm:hidden">Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


