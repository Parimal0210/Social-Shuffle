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
  Database
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
    backendStatus,
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
    <header className="sticky top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1F305E] px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <SocialShuffleLogo size="sm" showWordmark={true} showTagline={true} />
          <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6036]/15 text-[#FF8566] border border-[#FF6036]/30">
            Pune
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spring Boot / MongoDB Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              backendStatus === 'connected'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-[#111C3B] border-[#1F305E] text-slate-300'
            }`}
            title={backendStatus === 'connected' ? 'Connected to Spring Boot REST API & MongoDB' : 'Spring Boot API: Local Dynamic Fallback Active'}
          >
            <Database className={`w-3.5 h-3.5 ${backendStatus === 'connected' ? 'text-emerald-400' : 'text-[#35C8A8]'}`} />
            <span className="hidden md:inline">
              {backendStatus === 'connected' ? 'MongoDB Live' : 'Spring Boot STS'}
            </span>
          </div>

          {/* Offline Attendance Mode Simulator */}
          <button
            id="btn-toggle-offline"
            onClick={toggleOfflineMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isOfflineMode
                ? 'bg-[#FFC226]/15 border-[#FFC226]/40 text-[#FFC226]'
                : 'bg-[#111C3B] border-[#1F305E] text-slate-300 hover:text-white hover:border-[#35C8A8]/40'
            }`}
            title="Toggle offline attendance simulation mode"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#FFC226] animate-pulse" />
                <span className="hidden md:inline">Offline Mode</span>
                {offlineSyncQueue.length > 0 && (
                  <span className="bg-[#FFC226] text-[#0A1128] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {offlineSyncQueue.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#35C8A8]" />
                <span className="hidden md:inline">Online</span>
              </>
            )}
          </button>

          {/* Sync Button if offline items exist */}
          {offlineSyncQueue.length > 0 && (
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

          {/* Role Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-[#090F22] border border-[#1F305E]">
            <button
              id="role-switch-participant"
              onClick={() => setRole('participant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'participant'
                  ? 'bg-[#FF6036] text-white shadow-md shadow-[#FF6036]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Participant</span>
            </button>
            <button
              id="role-switch-admin"
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-[#35C8A8] text-[#0A1128] font-bold shadow-md shadow-[#35C8A8]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Demo User Switcher Dropdown */}
          <div className="relative">
            <button
              id="btn-user-switch"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#111C3B] border border-[#1F305E] hover:border-[#FF6036]/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6036] to-[#8F43EE] flex items-center justify-center text-[11px] font-bold text-white uppercase">
                {role === 'admin' ? 'A' : currentParticipant.name[0]}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-medium text-slate-200 block truncate max-w-[90px]">
                  {role === 'admin' ? adminName.split(' ')[0] : currentParticipant.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  {role === 'admin' ? 'Host Admin' : currentParticipant.area}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#111C3B] border border-[#1F305E] rounded-xl shadow-2xl z-50 p-2 text-left">
                <div className="px-2 py-1.5 mb-1 border-b border-[#1F305E]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Persona (Demo)
                  </span>
                </div>

                <div className="space-y-1">
                  {participants.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentParticipantId(p.id);
                        setRole('participant');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                        currentParticipant.id === p.id && role === 'participant'
                          ? 'bg-[#FF6036]/20 text-[#FF8566] font-semibold'
                          : 'text-slate-300 hover:bg-[#162349]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#FF6036]/20 border border-[#FF6036]/30 flex items-center justify-center text-[10px] font-bold text-[#FF8566]">
                          {p.name[0]}
                        </div>
                        <div className="text-left">
                          <span className="block">{p.name}</span>
                          <span className="text-[10px] text-slate-500">{p.area} • {p.totalEventsAttended} events</span>
                        </div>
                      </div>
                      {currentParticipant.id === p.id && role === 'participant' && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#35C8A8]" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-[#1F305E]">
                  <button
                    onClick={() => {
                      setRole('admin');
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      role === 'admin'
                        ? 'bg-[#35C8A8]/20 text-[#35C8A8] font-semibold'
                        : 'text-slate-300 hover:bg-[#162349]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#35C8A8]" />
                      <div className="text-left">
                        <span className="block">Aman Joshi (Host)</span>
                        <span className="text-[10px] text-slate-500">Super Admin & Organizer</span>
                      </div>
                    </div>
                    {role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-[#35C8A8]" />}
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1F305E] px-1">
                  <button
                    onClick={() => {
                      if (confirm('Reset sample Pune meetup data back to defaults?')) {
                        resetDatabase();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full text-center py-1 text-[11px] text-rose-400/80 hover:text-rose-300 transition-colors"
                  >
                    Reset Sample Database
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

