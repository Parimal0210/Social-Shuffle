import React, { useState } from 'react';
import { HeartHandshake, Phone, Mail, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication } from '../../types';

export const AdminVolunteers: React.FC = () => {
  const { volunteersList, updateVolunteerStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = volunteersList.filter(v =>
    filterStatus === 'all' ? true : v.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Volunteer Applications ({volunteersList.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review community members who want to teach board games and host Pune meetups
          </p>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {['all', 'New', 'Under Review', 'Accepted', 'On Hold', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(vol => (
          <div
            key={vol.id}
            className="p-5 rounded-2xl bg-[#161822] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-white">{vol.name}</h4>
                  <span className="text-xs text-purple-300 font-semibold">{vol.area}, Pune</span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    vol.status === 'Accepted'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : vol.status === 'Under Review'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : vol.status === 'New'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {vol.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {vol.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  {vol.email}
                </span>
              </div>

              {/* Motivation */}
              <div className="text-xs space-y-1">
                <span className="text-slate-400 font-semibold block">Motivation & Love for Games:</span>
                <p className="text-slate-200 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 italic">
                  "{vol.reason}"
                </p>
              </div>

              {/* Skills */}
              <div className="text-xs space-y-1">
                <span className="text-slate-400 font-semibold block">Teaching Strengths & Experience:</span>
                <p className="text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                  {vol.skills} • {vol.experience}
                </p>
              </div>

              {/* Preferred duties */}
              {vol.preferredResponsibilities.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Preferred Responsibilities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {vol.preferredResponsibilities.map((resp, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/40 font-medium"
                      >
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500">Applied {vol.submittedAt}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateVolunteerStatus(vol.id, 'Under Review')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Review
                </button>
                <button
                  onClick={() => updateVolunteerStatus(vol.id, 'Accepted')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold border border-emerald-500/30"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateVolunteerStatus(vol.id, 'On Hold')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                >
                  Hold
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
