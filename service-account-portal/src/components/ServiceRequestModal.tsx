import React, { useState } from 'react';
import { AccountInfo } from '../types';
import { Send, RefreshCw, CheckCircle2, HardDriveDownload, FileJson, Download, X, Cpu, Building2, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServiceRequestModalProps {
  accounts: AccountInfo[];
  initialAccount?: AccountInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSavedToLocal?: () => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  accounts,
  initialAccount,
  isOpen,
  onClose,
  onSavedToLocal,
}) => {
  const [selectedAccountName, setSelectedAccountName] = useState(initialAccount?.name || accounts[0]?.name || '057');
  const [selectedEnv, setSelectedEnv] = useState('prod');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const [requesting, setRequesting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generatedAudit, setGeneratedAudit] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAccount = accounts.find(a => a.name === selectedAccountName) || accounts[0];

  const handleExecuteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    setProgressStep(1);

    try {
      // Animated step feedback
      setTimeout(() => setProgressStep(2), 600);
      setTimeout(() => setProgressStep(3), 1200);

      const res = await fetch('/api/services/request-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: currentAccount.name,
          bankCode: currentAccount.attachedBank.code,
          env: selectedEnv,
          serviceType: selectedServiceType,
          notes: customNotes || `Audit request executed for ${currentAccount.title} (${currentAccount.clusterName}).`
        })
      });

      if (!res.ok) throw new Error('Failed to execute service audit request');
      const auditPayload = await res.json();

      setTimeout(() => {
        setGeneratedAudit(auditPayload);
        setRequesting(false);
        setProgressStep(0);
      }, 1600);

    } catch (err: any) {
      setRequesting(false);
      setProgressStep(0);
      setStatusMessage(err.message || 'Error executing request');
    }
  };

  const handleSaveToDisk = async () => {
    if (!generatedAudit) return;

    try {
      const filename = `audit-${currentAccount.name}-${currentAccount.attachedBank.code.toLowerCase()}-${Date.now()}.json`;
      const res = await fetch('/api/local-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: generatedAudit,
          format: 'json'
        })
      });

      if (!res.ok) throw new Error('Failed to save file to local disk');
      setStatusMessage(`Saved audit payload to local disk as "${filename}"!`);
      if (onSavedToLocal) onSavedToLocal();
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to save local file');
    }
  };

  const handleDownloadClient = () => {
    if (!generatedAudit) return;
    const filename = `audit-${currentAccount.name}-${Date.now()}.json`;
    const blob = new Blob([JSON.stringify(generatedAudit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage(`Downloaded "${filename}" to local client downloads.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Request Service Telemetry & Audit Package</h3>
              <p className="text-xs text-slate-400">Compile real-time service information & store in local review files</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {statusMessage && (
            <div className="p-3 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded-xl flex justify-between items-center">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage(null)} className="cursor-pointer text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!generatedAudit ? (
            <form onSubmit={handleExecuteRequest} className="space-y-4">
              {/* Account / Cluster Target Selector */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Target Account & Cluster
                </label>
                <select
                  value={selectedAccountName}
                  onChange={(e) => setSelectedAccountName(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {accounts.map(acc => (
                    <option key={acc.name} value={acc.name}>
                      ACC {acc.name} — {acc.title} ({acc.clusterName} • Bank: {acc.attachedBank.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Display selected target details banner */}
              {currentAccount && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cluster Name</span>
                    <span className="font-mono text-cyan-300 font-bold">{currentAccount.clusterName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Attached Bank</span>
                    <span className="font-semibold text-slate-200">{currentAccount.attachedBank.name} ({currentAccount.attachedBank.code})</span>
                  </div>
                </div>
              )}

              {/* Filters grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Environment
                  </label>
                  <select
                    value={selectedEnv}
                    onChange={(e) => setSelectedEnv(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 uppercase font-mono"
                  >
                    <option value="">All Environments</option>
                    <option value="prod">PROD</option>
                    <option value="uat">UAT</option>
                    <option value="qa">QA</option>
                    <option value="sbx">SBX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Service Type Filter
                  </label>
                  <select
                    value={selectedServiceType}
                    onChange={(e) => setSelectedServiceType(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All Types (API, Lambda, Fargate)</option>
                    <option value="API">API Services</option>
                    <option value="Lambda">Lambda Functions</option>
                    <option value="Fargate">Fargate Tasks</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Custom Audit Notes / Scope
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Enter audit review objectives, compliance notes, or notes for local file review..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit / Progress button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={requesting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-50"
                >
                  {requesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Compiling Telemetry Payload (Step {progressStep}/3)...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Compile & Fetch Audit Package</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Result View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-300">Audit Package Successfully Generated</h4>
                  <p className="text-xs text-slate-400 font-mono">Payload ID: {generatedAudit.id}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-200">{generatedAudit.title}</h5>
                <p className="text-slate-400 text-xs italic">"{generatedAudit.reviewNotes}"</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Account: {generatedAudit.account?.name} ({generatedAudit.account?.clusterName})</span>
                  <span>Services count: {generatedAudit.services?.length || 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSaveToDisk}
                  className="py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Save to Local Disk Storage</span>
                </button>

                <button
                  onClick={handleDownloadClient}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Browser File</span>
                </button>
              </div>

              <button
                onClick={() => setGeneratedAudit(null)}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold text-center cursor-pointer"
              >
                ← Request Another Audit Package
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
