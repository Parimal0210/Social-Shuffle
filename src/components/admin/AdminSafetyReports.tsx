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
          <h2 className="text-xl font-heading font-bold text-[#F5F2EB] tracking-tight">
            Safety & Incident Reports ({reportsList.length})
          </h2>
        </div>
        <p className="text-xs text-[#A8A29E] mt-0.5">
          Strictly confidential reports submitted by participants regarding conduct, discomfort, or safety
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reportsList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#1C1B18] border border-[#36332D] text-center text-xs text-[#A8A29E]">
            No incidents or concerns reported. The community is safe and respectful!
          </div>
        ) : (
          reportsList.map(report => (
            <div
              key={report.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                report.status === 'New'
                  ? 'bg-[#1C1B18] border-rose-500/40'
                  : 'bg-[#1C1B18] border-[#36332D]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/40">
                    {report.type}
                  </span>
                  <span className="text-xs text-[#F5F2EB] font-semibold">
                    {report.isAnonymous ? '🔒 Anonymous Report' : `Reported by ${report.reporterName}`}
                  </span>
                  {report.eventTitle && (
                    <span className="text-xs text-[#A8A29E]">• {report.eventTitle}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      report.status === 'New'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : report.status === 'Investigating'
                        ? 'bg-[#FFC226]/20 text-[#FFC226] border border-[#FFC226]/30'
                        : 'bg-[#35C8A8]/20 text-[#35C8A8] border border-[#35C8A8]/30'
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-[11px] text-[#78716C]">{report.submittedAt}</span>
                </div>
              </div>

              <p className="text-xs text-[#F5F2EB] bg-[#24221E] p-3 rounded-xl border border-[#36332D] leading-relaxed">
                "{report.description}"
              </p>

              {report.personInvolved && (
                <div className="text-xs text-[#A8A29E]">
                  <span className="font-semibold text-[#F5F2EB]">Person Involved: </span>
                  {report.personInvolved}
                </div>
              )}

              {/* Status Update Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2C2924]">
                <span className="text-[11px] text-[#78716C]">Report ID #{report.id}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateReportStatus(report.id, 'Investigating')}
                    className="px-3 py-1.5 rounded-lg bg-[#FFC226]/10 text-[#FFC226] hover:bg-[#FFC226]/20 text-xs font-semibold border border-[#FFC226]/20"
                  >
                    Mark Investigating
                  </button>
                  <button
                    onClick={() => updateReportStatus(report.id, 'Resolved')}
                    className="px-3 py-1.5 rounded-lg bg-[#35C8A8]/10 text-[#35C8A8] hover:bg-[#35C8A8]/20 text-xs font-semibold border border-[#35C8A8]/20"
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
