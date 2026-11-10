import React from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminCredentialsBar: React.FC = () => {
  const { currentUser } = useApp();

  const adminName = currentUser?.name || 'Parimal Shete';
  const adminEmail = currentUser?.email || 'parimalmshete@gmail.com';
  const adminPhone = currentUser?.phone || '+91 98220 99887';
  const adminDesignation = currentUser?.designation || 'Co-Founder & Community Architect';
  const adminRole = currentUser?.adminRole || 'Super Admin';
  const adminArea = currentUser?.area || 'Koregaon Park, Pune';

  return (
    <div className="w-full bg-gradient-to-r from-[#18153A] via-[#151D4A] to-[#12183E] border-b border-[#202B61] px-4 py-2.5 text-xs shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Admin Photo, Name, Designation, Role badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9440DD] to-[#7928CA] p-0.5 shadow-sm">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={adminName}
                  className="w-full h-full rounded-[10px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[10px] bg-[#1E1B4B] flex items-center justify-center font-bold text-xs text-white">
                  {adminName[0]}
                </div>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#12183E] animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-white text-xs truncate">
                {adminName}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#9440DD]/20 text-[#C084FC] border border-[#9440DD]/40 flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#C084FC]" />
                {adminRole}
              </span>
              <span className="text-[10px] font-medium text-[#FFD230] truncate hidden sm:inline">
                {adminDesignation}
              </span>
            </div>
            <div className="text-[10px] text-[#94A3B8] flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[#F8FAFC]">
                <Mail className="w-3 h-3 text-[#FF751F]" />
                <span className="truncate">{adminEmail}</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-[#F8FAFC] hidden sm:flex">
                <Phone className="w-3 h-3 text-[#4AB4A4]" />
                <span className="font-mono">{adminPhone}</span>
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="flex items-center gap-1 text-[#CBD5E1] hidden md:flex">
                <MapPin className="w-3 h-3 text-[#FFD230]" />
                <span>{adminArea}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
