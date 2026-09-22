import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, Eye, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafetyReport } from '../../types';

export const AdminSafetyReports: React.FC = () => {
  const { reportsList, updateReportStatus } = useApp();
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Safety & Incident Reports ({reportsList.length})
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Strictly confidential reports submitted by participants regarding conduct, discomfort, or safety
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reportsList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#161822] border border-slate-800 text-center text-xs text-slate-400">
            No incidents or concerns reported. The community is safe and respectful!
          </div>
        ) : (
          reportsList.map(report => (
            <div
              key={report.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                report.status === 'New'
                  ? 'bg-[#1e1518] border-rose-500/40'
                  : 'bg-[#161822] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/40">
                    {report.type}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    {report.isAnonymous ? '🔒 Anonymous Report' : `Reported by ${report.reporterName}`}
                  </span>
                  {report.eventTitle && (
                    <span className="text-xs text-slate-400">• {report.eventTitle}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      report.status === 'New'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : report.status === 'Investigating'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-[11px] text-slate-500">{report.submittedAt}</span>
                </div>
              </div>

              <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                "{report.description}"
              </p>

              {report.personInvolved && (
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Person Involved: </span>
                  {report.personInvolved}
                </div>
              )}

              {/* Status Update Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500">Report ID #{report.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateReportStatus(report.id, 'Investigating')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold border border-amber-500/20"
                  >
                    Mark Investigating
                  </button>
                  <button
                    onClick={() => updateReportStatus(report.id, 'Resolved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-500/20"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
