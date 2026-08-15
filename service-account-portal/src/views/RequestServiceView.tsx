import React, { useState } from 'react';
import { AccountInfo } from '../types';
import { Send, CheckCircle2, FileJson, Download, Server, Building2, Cpu, ShieldCheck, HardDriveDownload } from 'lucide-react';
import { motion } from 'motion/react';

interface RequestServiceViewProps {
  accounts: AccountInfo[];
  onSavedToLocal?: () => void;
}

export const RequestServiceView: React.FC<RequestServiceViewProps> = ({ accounts, onSavedToLocal }) => {
  const [selectedAccountName, setSelectedAccountName] = useState(accounts[0]?.name || '057');
  const [selectedEnv, setSelectedEnv] = useState('prod');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const [requesting, setRequesting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generatedAudit, setGeneratedAudit] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentAccount = accounts.find(a => a.name === selectedAccountName) || accounts[0];

  const handleExecuteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    setProgressStep(1);

    try {
      setTimeout(() => setProgressStep(2), 500);
      setTimeout(() => setProgressStep(3), 1000);

      const res = await fetch('/api/services/request-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: currentAccount.name,
          bankCode: currentAccount?.attachedBank?.code,
          env: selectedEnv,
          serviceType: selectedServiceType,
          notes: customNotes || `Dedicated audit request for ${currentAccount?.title} (${currentAccount?.clusterName}).`
        })
      });

      if (!res.ok) throw new Error('Failed to fetch service audit package');
      const auditPayload = await res.json();

      setTimeout(() => {
        setGeneratedAudit(auditPayload);
        setRequesting(false);
        setProgressStep(0);
      }, 1400);
    } catch (err: any) {
      setRequesting(false);
      setProgressStep(0);
      setStatusMessage(err.message || 'Error executing service request');
    }
  };

  const handleSaveToDisk = async () => {
    if (!generatedAudit) return;

    try {
      const filename = `audit-${currentAccount.name}-${Date.now()}.json`;
      const res = await fetch('/api/local-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: generatedAudit,
          format: 'json'
        })
      });

      if (!res.ok) throw new Error('Failed to save payload to disk');
      setStatusMessage(`Saved audit payload to local disk in storage/reviews/ as "${filename}"!`);
      if (onSavedToLocal) onSavedToLocal();
    } catch (err: any) {
      setStatusMessage(err.message || 'Save failed');
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
    setStatusMessage(`Downloaded "${filename}" to browser downloads.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/20">
            <Send className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Service Audit Request Engine</h2>
            <p className="text-xs text-slate-400">Request service telemetry & account cluster snapshots to store in local files</p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded-2xl text-xs flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="cursor-pointer text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Request Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {!generatedAudit ? (
          <form onSubmit={handleExecuteRequest} className="space-y-6 text-xs">
            {/* Account Selector */}
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                1. Select Target Account & Cluster Name
              </label>
              <select
                value={selectedAccountName}
                onChange={(e) => setSelectedAccountName(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-medium"
              >
                {accounts.map(acc => (
                  <option key={acc.name} value={acc.name}>
                    ACC {acc.name} — {acc.title} (Cluster: {acc.clusterName} • Bank: {acc.attachedBank.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Account Summary Banner */}
            {currentAccount && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">AWS Account ID</span>
                  <span className="font-mono text-cyan-300 font-bold">#{currentAccount.awsId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Cluster Name & Specs</span>
                  <span className="font-mono text-slate-200">{currentAccount.clusterName} ({currentAccount.nodesCount} Nodes)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Attached Bank Record</span>
                  <span className="font-semibold text-blue-300">{currentAccount.attachedBank.name} ({currentAccount.attachedBank.swiftBic})</span>
                </div>
              </div>
            )}

            {/* Scope / Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                  2. Environment Scope
                </label>
                <select
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono uppercase"
                >
                  <option value="">All Environments</option>
                  <option value="prod">PROD (Production)</option>
                  <option value="uat">UAT (User Acceptance Testing)</option>
                  <option value="qa">QA (Quality Assurance)</option>
                  <option value="sbx">SBX (Sandbox)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                  3. Service Type Filter
                </label>
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="">All Service Types (API, Lambda, Fargate)</option>
                  <option value="API">API Gateway / Microservices</option>
                  <option value="Lambda">AWS Lambda Functions</option>
                  <option value="Fargate">ECS / Fargate Tasks</option>
                </select>
              </div>
            </div>

            {/* Audit Review Notes */}
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                4. Custom Audit Purpose / Review Notes
              </label>
              <textarea
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Include custom audit objectives, change ticket numbers, or review notes to save in the local file..."
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={requesting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/50 disabled:opacity-50"
            >
              {requesting ? (
                <span>Requesting Service Telemetry & Compiling Payload...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute Audit Request Payload</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Audit Results & Local Storage Options */
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-300 text-sm">Service Information Request Compiled</h4>
                <p className="text-xs text-slate-400 font-mono">Payload ID: {generatedAudit.id}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-100 text-base">{generatedAudit.title}</h4>
              <p className="text-slate-400 italic">"{generatedAudit.reviewNotes}"</p>

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">Account Code</span>
                  <span className="font-mono font-bold text-cyan-300">{generatedAudit.account?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Cluster</span>
                  <span className="font-mono text-slate-200">{generatedAudit.account?.clusterName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Bank Record</span>
                  <span className="font-semibold text-blue-300">{generatedAudit.account?.attachedBank?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Services Count</span>
                  <span className="font-mono text-emerald-400 font-bold">{generatedAudit.services?.length || 0} Services</span>
                </div>
              </div>
            </div>

            {/* Storage Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleSaveToDisk}
                className="py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <FileJson className="w-4 h-4" />
                <span>Save to Server Local Disk Files</span>
              </button>

              <button
                onClick={handleDownloadClient}
                className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Client JSON File</span>
              </button>
            </div>

            <button
              onClick={() => setGeneratedAudit(null)}
              className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold text-center cursor-pointer"
            >
              ← Configure New Service Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
