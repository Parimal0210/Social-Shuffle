import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Dices,
  Check,
  X,
  FileCheck,
  Info,
  Mail,
  QrCode,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { parseExcelOrCsv, ParseResult } from '../../utils/excelImport';

interface AdminImportExportProps {
  initialEventId?: string;
}

export const AdminImportExport: React.FC<AdminImportExportProps> = ({ initialEventId }) => {
  const {
    events,
    registrations,
    participants,
    games,
    bulkImportRegistrations
  } = useApp();

  const [targetEventId, setTargetEventId] = useState<string>(
    initialEventId && events.some(e => e.id === initialEventId)
      ? initialEventId
      : events[0]?.id || ''
  );
  const [csvText, setCsvText] = useState<string>('');
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    errors: string[];
    totalRows?: number;
    capturedCount?: number;
    skippedCount?: number;
  } | null>(null);

  // Parse spreadsheet whenever fileBuffer or csvText changes
  const previewData: ParseResult | null = useMemo(() => {
    if (fileBuffer) {
      return parseExcelOrCsv(fileBuffer);
    }
    if (csvText.trim()) {
      return parseExcelOrCsv(csvText);
    }
    return null;
  }, [fileBuffer, csvText]);

  // Sample CSV template generator with required columns
  const downloadSampleTemplate = () => {
    const csvContent =
      'payment status,full_name,item quantity,email,phone,notes\n' +
      'captured,Aditi Sharma,2,aditi.sharma@gmail.com,9890123456,Excited for Catan table\n' +
      'captured,Kunal Patil,1,kunal.patil@outlook.com,9823456789,First time playing modern games\n' +
      'failed,Vikram Singh,1,vikram.s@example.com,9811122334,Payment failed (will be skipped)\n' +
      'refunded,Pooja Hegde,2,pooja.h@example.com,9765432199,Cancelled ticket (will be skipped)\n' +
      'captured,Sneha Kulkarni,3,sneha.k@yahoo.com,9876543210,Coming with college friends\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social_shuffle_captured_registration_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle file upload (.xlsx, .xls, .csv, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);

    const isExcelBinary = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const reader = new FileReader();
    reader.onload = event => {
      const buffer = event.target?.result as ArrayBuffer;
      setFileBuffer(buffer);
      if (!isExcelBinary) {
        // Also keep text representation for CSV/TXT
        const decoder = new TextDecoder('utf-8');
        setCsvText(decoder.decode(buffer));
      } else {
        setCsvText('');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);

    const isExcelBinary = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const reader = new FileReader();
    reader.onload = event => {
      const buffer = event.target?.result as ArrayBuffer;
      setFileBuffer(buffer);
      if (!isExcelBinary) {
        const decoder = new TextDecoder('utf-8');
        setCsvText(decoder.decode(buffer));
      } else {
        setCsvText('');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessImport = () => {
    if (!targetEventId || (!fileBuffer && !csvText.trim())) return;

    const payload = fileBuffer || csvText;
    const res = bulkImportRegistrations(targetEventId, payload);
    setImportResult(res);

    if (res.importedCount > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti fallback
      }
    }
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
        <h2 className="text-xl font-black text-white tracking-tight">Excel & CSV Registration Hub</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Bulk import attendee registrations from Razorpay, BookMyShow, Townscript, or custom spreadsheets with automated QR code pass delivery
        </p>
      </div>

      {/* Bulk Importer Section */}
      <div className="p-6 rounded-2xl bg-[#161822] border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#35C8A8]" />
              <span>Import Excel / CSV to Event</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports .xlsx, .xls, .csv spreadsheets. Ignores extra columns and filters only captured bookings.
            </p>
          </div>

          <button
            onClick={downloadSampleTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white text-xs font-semibold self-start sm:self-center transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#35C8A8]" />
            <span>Download Formatted Template</span>
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
            className="w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#35C8A8]"
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
          className="border-2 border-dashed border-slate-700 hover:border-[#35C8A8]/60 rounded-2xl p-6 text-center space-y-3 bg-slate-900/40 transition-colors"
        >
          <Upload className="w-8 h-8 text-[#35C8A8] mx-auto" />
          <div>
            <label className="text-xs font-bold text-[#35C8A8] hover:underline cursor-pointer">
              <span>Choose an Excel (.xlsx, .xls) or CSV file</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400"> or drag and drop it here</span>
          </div>

          {fileName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Loaded: {fileName}</span>
            </div>
          )}
        </div>

        {/* Or direct Paste text */}
        <div>
          <label className="block text-slate-400 font-semibold text-xs mb-1">
            Or Paste CSV / Tab-Separated Rows Directly:
          </label>
          <textarea
            rows={3}
            value={csvText}
            onChange={e => {
              setCsvText(e.target.value);
              setFileBuffer(null);
              setFileName('');
              setImportResult(null);
            }}
            placeholder="payment status,full_name,item quantity,email,phone&#10;captured,Rohan Mehra,2,rohan@gmail.com,9890011223&#10;failed,Vikram Singh,1,vikram@gmail.com,9811122334"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#35C8A8]"
          />
        </div>

        {/* Live Detected Columns & Preview */}
        {previewData && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* Column Mapping Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                Detected Columns:
              </span>
              <span className={`px-2 py-0.5 rounded-lg border font-mono text-[11px] ${
                previewData.columns.paymentStatusKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                payment status: {previewData.columns.paymentStatusKey || 'All treated captured'}
              </span>
              <span className={`px-2 py-0.5 rounded-lg border font-mono text-[11px] ${
                previewData.columns.fullNameKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                full_name: {previewData.columns.fullNameKey || 'Not detected'}
              </span>
              <span className="px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800/80 font-mono text-[11px] text-slate-300">
                item quantity: {previewData.columns.itemQuantityKey || 'Default (1)'}
              </span>
              <span className="px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800/80 font-mono text-[11px] text-slate-300">
                email: {previewData.columns.emailKey || 'Fallback'}
              </span>
              <span className="px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800/80 font-mono text-[11px] text-slate-300">
                phone: {previewData.columns.phoneKey || 'N/A'}
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Total Rows</div>
                <div className="text-lg font-black text-white">{previewData.totalRows}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" />
                  Captured (To Import)
                </div>
                <div className="text-lg font-black text-emerald-300">{previewData.capturedCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-center">
                <div className="text-[11px] text-rose-400 font-semibold flex items-center justify-center gap-1">
                  <X className="w-3 h-3" />
                  Skipped (Non-Captured)
                </div>
                <div className="text-lg font-black text-rose-400">{previewData.skippedCount}</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Spreadsheet Rows Preview (First 8 Rows)</span>
                <span className="text-[11px] text-slate-400">
                  Showing {Math.min(previewData.rows.length, 8)} of {previewData.rows.length} rows
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-sans text-xs">
                {previewData.rows.slice(0, 8).map((r, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 flex items-center justify-between gap-3 text-xs ${
                      r.isValid && r.isCaptured
                        ? 'bg-slate-900/20 hover:bg-slate-800/40 text-slate-200'
                        : 'bg-rose-950/10 hover:bg-rose-950/20 text-slate-400 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-[10px] font-mono text-slate-500">#{r.originalRowIndex}</span>

                      {/* Payment Status Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                          r.isCaptured
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 line-through'
                        }`}
                      >
                        {r.paymentStatus || 'unknown'}
                      </span>

                      {/* Name & Contact */}
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate flex items-center gap-2">
                          <span>{r.fullName || <span className="text-rose-400 italic">Missing Name</span>}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({r.itemQuantity} {r.itemQuantity === 1 ? 'PAX' : 'PAX'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {r.email} • {r.phone || 'No phone'}
                        </div>
                      </div>
                    </div>

                    {/* Action Status */}
                    <div className="text-right shrink-0">
                      {r.isValid && r.isCaptured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Will Import</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>{r.skipReason || 'Ignored'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Import Feedback */}
        {importResult && (
          <div
            className={`p-4 rounded-xl text-xs space-y-2 ${
              importResult.importedCount > 0
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {importResult.importedCount > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>
                {importResult.importedCount > 0
                  ? `Successfully imported ${importResult.importedCount} attendee bookings! Passes with QR codes emailed automatically.`
                  : 'Import completed with 0 new bookings.'}
              </span>
            </div>
            {importResult.importedCount > 0 && (
              <div className="p-2.5 rounded-lg bg-[#081226] border border-emerald-500/20 text-emerald-300 flex items-center gap-2 text-xs">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Official confirmation emails containing personal ticket passes and check-in QR codes have been automatically dispatched to all {importResult.importedCount} attendees.
                </span>
              </div>
            )}
            {importResult.skippedCount !== undefined && importResult.skippedCount > 0 && (
              <p className="text-slate-300 text-[11px]">
                ℹ️ Skipped {importResult.skippedCount} row(s) where payment status was not &apos;captured&apos; or required fields were missing.
              </p>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-0.5 text-[11px] text-slate-300 border-t border-slate-700/50 pt-1.5">
                {importResult.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          id="btn-process-import"
          onClick={handleProcessImport}
          disabled={!previewData || previewData.capturedCount === 0}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#35C8A8] to-[#20B2AA] hover:opacity-95 disabled:opacity-40 text-[#0A1128] font-bold text-xs shadow-lg shadow-[#35C8A8]/20 transition-all flex items-center justify-center gap-2"
        >
          <FileCheck className="w-4 h-4" />
          <span>
            {previewData && previewData.capturedCount > 0
              ? `Import ${previewData.capturedCount} Captured Registrations to Event`
              : 'Import Captured Registrations'}
          </span>
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
