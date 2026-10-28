import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Check,
  Mail,
  QrCode,
  Sparkles,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ShuffleEvent } from '../../types';
import { parseExcelOrCsv, ParseResult } from '../../utils/excelImport';

interface AdminImportRegistrationsModalProps {
  event: ShuffleEvent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (importedCount: number) => void;
}

export const AdminImportRegistrationsModal: React.FC<AdminImportRegistrationsModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { bulkImportRegistrations, registrations } = useApp();

  const [csvText, setCsvText] = useState<string>('');
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    errors: string[];
    totalRows?: number;
    capturedCount?: number;
    skippedCount?: number;
  } | null>(null);

  // Existing registrations count for this event
  const currentEventRegs = useMemo(() => {
    return registrations.filter(r => r.eventId === event.id && r.attendanceStatus !== 'Cancelled');
  }, [registrations, event.id]);

  const totalCurrentPax = useMemo(() => {
    return currentEventRegs.reduce((acc, curr) => acc + curr.paxCount, 0);
  }, [currentEventRegs]);

  // Parse spreadsheet whenever fileBuffer or csvText changes
  const previewData: ParseResult | null = useMemo(() => {
    if (inputMode === 'upload' && fileBuffer) {
      return parseExcelOrCsv(fileBuffer);
    }
    if (inputMode === 'paste' && csvText.trim()) {
      return parseExcelOrCsv(csvText);
    }
    return null;
  }, [inputMode, fileBuffer, csvText]);

  if (!isOpen) return null;

  const downloadSampleTemplate = () => {
    const csvContent =
      'payment status,full_name,item quantity,email,phone,notes\n' +
      'captured,Aditi Sharma,2,aditi.sharma@gmail.com,9890123456,Excited for Catan table\n' +
      'captured,Kunal Patil,1,kunal.patil@outlook.com,9823456789,First time playing modern games\n' +
      'failed,Vikram Singh,1,vikram.s@example.com,9811122334,Payment failed (will be skipped)\n' +
      'captured,Tanvi Joshi,1,tanvi.j@example.com,9822334455,Enjoys bluffing & party games\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_shuffle_${event.title.replace(/\s+/g, '_')}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);

    const isExcelBinary = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const reader = new FileReader();
    reader.onload = evt => {
      const buffer = evt.target?.result as ArrayBuffer;
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
    const payload = inputMode === 'upload' ? fileBuffer : csvText;
    if (!payload) return;

    setIsProcessing(true);

    try {
      const res = bulkImportRegistrations(event.id, payload);
      setImportResult(res);
      setIsProcessing(false);

      if (res.importedCount > 0) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
        if (onSuccess) onSuccess(res.importedCount);
      }
    } catch {
      setIsProcessing(false);
      setImportResult({
        importedCount: 0,
        errors: ['Failed to process spreadsheet. Please verify file format.'],
        totalRows: 0,
        capturedCount: 0,
        skippedCount: 0
      });
    }
  };

  const handleReset = () => {
    setFileBuffer(null);
    setFileName('');
    setCsvText('');
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#121626] border border-[#4AB4A4]/30 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40">
                Event #{event.number}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#4AB4A4]/15 text-[#4AB4A4] border border-[#4AB4A4]/30 font-semibold flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                Automatic QR Email Dispatch
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#4AB4A4]" />
              <span>Import Registrations — {event.title}</span>
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {event.venue}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {totalCurrentPax}/{event.capacity} Pax Booked
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State Screen */}
        {importResult && importResult.importedCount > 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">Import Complete!</h4>
              <p className="text-sm font-semibold text-emerald-400 mt-1">
                Successfully imported {importResult.importedCount} attendee bookings into {event.title}!
              </p>
            </div>

            {/* Email Dispatch Confirmation Card */}
            <div className="p-4 rounded-xl bg-[#0B1426] border border-emerald-500/30 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated Email Passes with QR Code Dispatched!</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Official Social Shuffle confirmation emails containing each attendee&apos;s digital ticket pass and unique door check-in QR code have been automatically sent to all {importResult.importedCount} imported participants.
              </p>
              {importResult.skippedCount !== undefined && importResult.skippedCount > 0 && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  ℹ️ Skipped {importResult.skippedCount} non-captured / failed payment rows from the file.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Import Another File
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#0A1128] text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                Done & Return to Events
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Automated Email Notice */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-900/30 to-emerald-950/30 border border-[#4AB4A4]/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#4AB4A4]/20 text-[#4AB4A4] shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <span>Automatic QR Pass Email Delivery</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD230]" />
                </h5>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Upon clicking import, the platform will automatically generate a digital ticket pass with a check-in QR code and email it directly to every captured participant from your spreadsheet.
                </p>
              </div>
            </div>

            {/* Input Mode Selector */}
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    inputMode === 'upload'
                      ? 'bg-[#4AB4A4] text-[#0A1128] shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .xlsx / .csv</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    inputMode === 'paste'
                      ? 'bg-[#4AB4A4] text-[#0A1128] shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Paste CSV / Text</span>
                </button>
              </div>

              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs text-[#4AB4A4] hover:text-[#52e5c5] font-semibold flex items-center gap-1"
                title="Download formatted sample CSV file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Template</span>
              </button>
            </div>

            {/* File Upload Dropzone */}
            {inputMode === 'upload' ? (
              <div className="border-2 border-dashed border-slate-700 hover:border-[#4AB4A4] rounded-2xl p-6 text-center transition-colors bg-slate-900/40">
                <input
                  type="file"
                  id={`file-input-${event.id}`}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor={`file-input-${event.id}`}
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#4AB4A4]/10 text-[#4AB4A4] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white hover:underline">
                      Click to choose spreadsheet
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Supports Excel (.xlsx, .xls) and CSV (.csv) exports from Razorpay, Townscript, or BookMyShow
                    </span>
                  </div>
                  {fileName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{fileName}</span>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Paste CSV Rows with Columns</span>
                  <span className="text-[10px] text-slate-500">Requires header row with payment status, full_name, etc.</span>
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={e => {
                    setCsvText(e.target.value);
                    setImportResult(null);
                  }}
                  placeholder="payment status,full_name,item quantity,email,phone,notes&#10;captured,Rohan Kulkarni,2,rohan@example.com,9822012345,Attending with friend&#10;captured,Pooja Hegde,1,pooja@example.com,9765432199,First timer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-[#4AB4A4]"
                />
              </div>
            )}

            {/* Parse Preview */}
            {previewData && (
              <div className="space-y-3 pt-1">
                {/* Metric Summary */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total Rows</div>
                    <div className="text-base font-black text-white">{previewData.totalRows}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Captured (To Import)</span>
                    </div>
                    <div className="text-base font-black text-emerald-300">{previewData.capturedCount}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
                    <div className="text-[10px] text-rose-400 font-semibold flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Skipped (Non-Captured)</span>
                    </div>
                    <div className="text-base font-black text-rose-400">{previewData.skippedCount}</div>
                  </div>
                </div>

                {/* Rows Table Preview (Up to 5) */}
                <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Preview Attendees (First {Math.min(previewData.rows.length, 5)} rows)</span>
                    <span className="text-emerald-400 font-semibold">Each will receive QR Pass over Email</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 font-sans">
                    {previewData.rows.slice(0, 5).map((r, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 flex items-center justify-between gap-3 text-xs ${
                          r.isValid && r.isCaptured
                            ? 'bg-slate-900/30 text-slate-200'
                            : 'bg-rose-950/15 text-slate-400 opacity-70'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                              r.isCaptured
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 line-through'
                            }`}
                          >
                            {r.paymentStatus || 'unknown'}
                          </span>
                          <span className="font-bold text-white truncate">{r.fullName}</span>
                          <span className="text-[10px] text-slate-400">({r.itemQuantity} pax)</span>
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">• {r.email}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-400 shrink-0 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-[#4AB4A4]" />
                          <span>Pass Ready</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {importResult && importResult.errors && importResult.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Import Warning</span>
                </div>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-[11px] text-slate-300">• {err}</p>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-import-event"
                onClick={handleProcessImport}
                disabled={isProcessing || !previewData || previewData.capturedCount === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4AB4A4] to-[#25ad8e] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A1128] font-black text-xs shadow-lg shadow-[#4AB4A4]/20 transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-[#0A1128]" />
                <span>
                  {isProcessing
                    ? 'Importing & Sending QR Emails...'
                    : `Import & Send QR Passes (${previewData?.capturedCount || 0})`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
