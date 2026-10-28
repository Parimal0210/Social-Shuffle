import React from 'react';
import { ShieldAlert, ExternalLink, X, AlertTriangle } from 'lucide-react';
import { isTrustedExternalUrl } from '../../utils/security';

interface ExternalLinkWarningModalProps {
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const ExternalLinkWarningModal: React.FC<ExternalLinkWarningModalProps> = ({
  url,
  isOpen,
  onClose,
  onProceed
}) => {
  if (!isOpen || !url) return null;

  const isTrusted = isTrustedExternalUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#151E4D] border border-[#283677] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#202B61]">
          <div className="flex items-center gap-2.5">
            {isTrusted ? (
              <ExternalLink className="w-5 h-5 text-[#4AB4A4]" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-[#FF751F]" />
            )}
            <h3 className="font-heading font-bold text-white text-base">
              {isTrusted ? 'Navigating to External Link' : 'Anti-Phishing Safety Warning'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-white rounded-lg hover:bg-[#1A255C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-[#94A3B8]">
          {!isTrusted && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Caution:</strong> You are about to leave Social Shuffle to visit an external website that is outside our verified partner network. Never enter your password or UPI pin on third-party pages.
              </span>
            </div>
          )}

          <p className="text-[#94A3B8]">Destination link:</p>
          <div className="p-2.5 rounded-lg bg-[#10173E] border border-[#283677] font-mono text-[11px] text-[#4AB4A4] break-all select-all">
            {url}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-white rounded-xl hover:bg-[#1A255C] transition-colors"
          >
            Cancel & Stay Safe
          </button>
          <button
            type="button"
            onClick={onProceed}
            className={`px-4 py-2 text-xs font-heading font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              isTrusted
                ? 'bg-[#4AB4A4] hover:bg-[#2cb295] text-[#10173E]'
                : 'bg-[#FF751F] hover:bg-[#E66310] text-white shadow-sm shadow-[#FF751F]/20'
            }`}
          >
            <span>Proceed to External Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
