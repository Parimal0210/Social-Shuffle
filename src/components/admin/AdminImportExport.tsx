import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  Dices,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminImportExport: React.FC = () => {
  const {
    events,
    registrations,
    participants,
    games,
    feedbackList,
    bulkImportRegistrations
  } = useApp();

  const [targetEventId, setTargetEventId] = useState<string>(events[0]?.id || '');
  const [csvText, setCsvText] = useState<string>('');
  const [importResult, setImportResult] = useState<{ importedCount: number; errors: string[] } | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Sample CSV template generator
  const downloadSampleTemplate = () => {
    const header = 'Name,Phone,Email,Area,Pax,Notes\n';
    const sampleRows =
      'Aditi Sharma,9890123456,aditi.sharma@gmail.com,Koregaon Park,2,Excited for Catan table\n' +
      'Kunal Patil,9823456789,kunal.patil@outlook.com,Baner,1,First time playing modern games\n' +
      'Sneha Kulkarni,9876543210,sneha.k@yahoo.com,Viman Nagar,3,Coming with college friends\n';

    const blob = new Blob([header + sampleRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social_shuffle_registration_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!targetEventId || !csvText) return;
    const res = bulkImportRegistrations(targetEventId, csvText);
    setImportResult(res);
  };

  // 1-Click Exporters
  const exportAttendanceSheet = () => {
    const currentEvent = events.find(e => e.id === targetEventId) || events[0];
    const eventRegs = registrations.filter(r => r.eventId === currentEvent.id);

    let csv = 'RegistrationID,ParticipantName,Phone,Email,PaxCount,AttendanceStatus,PaymentStatus,CheckInTime,GamesPlayed,Notes\n';
    eventRegs.forEach(r => {
      csv += `"${r.id}","${r.participantName}","${r.participantPhone}","${r.participantEmail}",${r.paxCount},"${r.attendanceStatus}","${r.paymentStatus}","${r.checkInTime || ''}","${r.gamesPlayed.join('; ')}","${(r.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${currentEvent.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportParticipantsCRM = () => {
    let csv = 'ParticipantID,Name,Phone,Email,Area,TotalEventsAttended,TotalRegistrations,TotalPaxBrought,GamesPlayedCount,JoinedDate\n';
    participants.forEach(p => {
      csv += `"${p.id}","${p.name}","${p.phone}","${p.email}","${p.area}",${p.totalEventsAttended},${p.totalRegistrations},${p.totalPaxBrought},${p.gamesPlayedIds.length},"${p.joinedDate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_shuffle_participants_crm.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportGamesCatalog = () => {
    let csv = 'GameID,Name,Category,Difficulty,Players,Duration,ActiveStatus,Description\n';
    games.forEach(g => {
      csv += `"${g.id}","${g.name}","${g.category}","${g.difficulty}","${g.players}","${g.duration}",${g.active ? 'Active' : 'Inactive'},"${g.description.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_shuffle_games_catalog.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Excel & CSV Data Hub</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Bulk import attendee registrations from ticketing platforms (BookMyShow, Townscript, Google Forms) or export master records
        </p>
      </div>

      {/* Bulk Importer Section */}
      <div className="p-6 rounded-2xl bg-[#161822] border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Bulk Import Registrations</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports CSV with columns: Name, Phone, Email, Area, Pax, Notes
            </p>
          </div>

          <button
            onClick={downloadSampleTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white text-xs font-semibold self-start sm:self-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Target event selection */}
        <div>
          <label className="block text-slate-400 font-semibold text-xs mb-1">
            Target Meetup Event for Imported Bookings:
          </label>
          <select
            value={targetEventId}
            onChange={e => setTargetEventId(e.target.value)}
            className="w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                #{ev.number} — {ev.title} ({ev.venue})
              </option>
            ))}
          </select>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-6 text-center space-y-3 bg-slate-900/40 transition-colors"
        >
          <Upload className="w-8 h-8 text-purple-400 mx-auto" />
          <div>
            <label className="text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer underline">
              <span>Choose a CSV file</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400"> or drag and drop it here</span>
          </div>

          {fileName && (
            <div className="text-xs text-emerald-400 font-semibold">
              Selected File: {fileName}
            </div>
          )}
        </div>

        {/* Or direct Paste text */}
        <div>
          <label className="block text-slate-400 font-semibold text-xs mb-1">
            Or Paste CSV Rows Directly:
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="Name,Phone,Email,Area,Pax,Notes&#10;Rohan Mehra,9890011223,rohan@gmail.com,Baner,2,Catan table please"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Import Feedback */}
        {importResult && (
          <div
            className={`p-4 rounded-xl text-xs space-y-1 ${
              importResult.importedCount > 0
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {importResult.importedCount > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>Imported {importResult.importedCount} registrations successfully!</span>
            </div>
            {importResult.errors.map((err, i) => (
              <p key={i} className="text-slate-300 text-[11px]">
                • {err}
              </p>
            ))}
          </div>
        )}

        <button
          id="btn-process-import"
          onClick={handleProcessImport}
          disabled={!csvText.trim()}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
        >
          Process & Import to Event
        </button>
      </div>

      {/* 1-Click Exporters Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">1-Click CSV Exporters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportAttendanceSheet}
            className="p-4 rounded-xl bg-[#161822] border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
          >
            <Calendar className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Event Attendance Sheet</div>
            <div className="text-xs text-slate-400 mt-0.5">Current event check-ins (.csv)</div>
          </button>

          <button
            onClick={exportParticipantsCRM}
            className="p-4 rounded-xl bg-[#161822] border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <Users className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Full Customer CRM</div>
            <div className="text-xs text-slate-400 mt-0.5">All Pune Shufflers (.csv)</div>
          </button>

          <button
            onClick={exportGamesCatalog}
            className="p-4 rounded-xl bg-[#161822] border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
          >
            <Dices className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">Board Game Catalog</div>
            <div className="text-xs text-slate-400 mt-0.5">Library collection (.csv)</div>
          </button>
        </div>
      </div>
    </div>
  );
};
