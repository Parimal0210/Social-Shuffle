import React, { useState } from 'react';
import { ScrollText, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAuditLog: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    (log.description || log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.adminName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-black text-white tracking-tight">Admin Audit Trail</h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable log of all check-in actions, CRM updates, customer merges, and event operations
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search audit trail by action or keywords..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#161822] border border-slate-800 text-center text-xs text-slate-400">
            No audit records found.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[#161822] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  LOG
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-800 text-slate-400">
                      by {log.adminName}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{log.description || log.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 self-end sm:self-center">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
