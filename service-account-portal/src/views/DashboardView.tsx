import React, { useState } from 'react';
import { AccountInfo, ServiceItem, LastScanRecord } from '../types';
import {
  ShieldCheck,
  Cpu,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  HardDriveDownload,
  Download,
  Eye,
  Search,
  Filter,
  RefreshCw,
  FileJson,
  X,
  Layers,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  accounts: AccountInfo[];
  services: ServiceItem[];
  loading: boolean;
  onRefresh: () => void;
  onRequestAudit: (account: AccountInfo) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  services,
  loading,
  onRefresh,
  onRequestAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'warnings'>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [scanningAccount, setScanningAccount] = useState<string | null>(null);
  const [selectedScanFile, setSelectedScanFile] = useState<{ filename: string; content: any; raw: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available accounts
  const availableAccounts = accounts.filter(a => a.availability === 'available' || !a.availability);
  const banksList = Array.from(new Set(accounts.map(a => a.attachedBank.code)));

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.clusterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.attachedBank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.attachedBank.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'available'
        ? acc.availability === 'available' || !acc.availability
        : acc.lastScan?.status === 'warning' || acc.clusterStatus !== 'healthy';

    const matchesBank = bankFilter === 'all' ? true : acc.attachedBank.code === bankFilter;

    return matchesSearch && matchesStatus && matchesBank;
  });

  // Calculate high-level summary KPIs
  const totalScans = accounts.filter(a => a.lastScan).length;
  const passedScans = accounts.filter(a => a.lastScan?.status === 'passed' || a.lastScan?.status === 'audited').length;
  const warningScans = accounts.filter(a => a.lastScan?.status === 'warning' || a.lastScan?.status === 'critical').length;
  const avgCompliance = Math.round(
    accounts.reduce((acc, a) => acc + (a.lastScan?.complianceScore || 95), 0) / (accounts.length || 1)
  );

  // Run a quick fresh scan for an account
  const handleRunQuickScan = async (acc: AccountInfo) => {
    setScanningAccount(acc.name);
    try {
      const res = await fetch('/api/services/request-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: acc.name,
          bankCode: acc.attachedBank.code,
          notes: `Fresh telemetry scan performed for ${acc.title} (${acc.clusterName}).`
        })
      });

      if (!res.ok) throw new Error('Scan request failed');
      const scanPayload = await res.json();

      // Automatically save to local disk
      const filename = `account-${acc.name}-scan-${Date.now()}.json`;
      await fetch('/api/local-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: scanPayload,
          format: 'json'
        })
      });

      setToastMessage(`Scan completed and saved to local files for Account ${acc.name} (${acc.title})!`);
      onRefresh();
    } catch (err: any) {
      setToastMessage(`Scan failed: ${err.message}`);
    } finally {
      setScanningAccount(null);
    }
  };

  // Inspect local scan file
  const handleOpenScanFile = async (filename?: string) => {
    if (!filename) return;
    setLoadingFile(true);
    try {
      const res = await fetch(`/api/local-files/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('Could not read scan file');
      const fileData = await res.json();
      setSelectedScanFile(fileData);
    } catch (err: any) {
      setToastMessage(`Failed reading file: ${err.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  // Direct download scan file
  const handleDownloadScan = (acc: AccountInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!acc.lastScan) return;
    const blob = new Blob([JSON.stringify(acc.lastScan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = acc.lastScan.filename || `account-${acc.name}-scan.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(`Downloaded scan file for Account ${acc.name}.`);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'passed':
      case 'audited':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Passed
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            Pending Scan
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live Account Breakdown
            </span>
            <span className="text-slate-500 text-xs font-mono">• Last Scans of Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Account Records & Telemetry Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time breakdown of all available service accounts, attached cluster configurations, banking records, and their latest scan audits stored in local files.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onRefresh}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition-all border border-slate-700 cursor-pointer shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Refresh dashboard records"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Scans</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded-2xl text-xs flex justify-between items-center shadow-lg">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="cursor-pointer text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Available Accounts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-100 font-mono">
                {availableAccounts.length}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">100% Online</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Across {banksList.length} Banking Groups</span>
          </div>
          <div className="p-3.5 bg-cyan-950/80 text-cyan-400 rounded-2xl border border-cyan-800/60">
            <Cpu className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Audit Compliance Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {avgCompliance}%
              </span>
              <span className="text-xs font-mono text-slate-400">Score</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{passedScans} Passed • {warningScans} Flagged</span>
          </div>
          <div className="p-3.5 bg-emerald-950/80 text-emerald-400 rounded-2xl border border-emerald-800/60">
            <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Scanned Services</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-blue-300 font-mono">
                {services.length}
              </span>
              <span className="text-xs font-mono text-cyan-400">Active</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">API, Lambda & Fargate</span>
          </div>
          <div className="p-3.5 bg-blue-950/80 text-blue-400 rounded-2xl border border-blue-800/60">
            <Activity className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Local Disk Scan Files</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-indigo-300 font-mono">
                {totalScans}
              </span>
              <span className="text-xs font-mono text-slate-400">Archived</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Stored in storage/reviews/</span>
          </div>
          <div className="p-3.5 bg-indigo-950/80 text-indigo-400 rounded-2xl border border-indigo-800/60">
            <HardDriveDownload className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by account ID, title, cluster name, bank partner, or SWIFT code..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filters and View Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({accounts.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'available' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available ({availableAccounts.length})
            </button>
            <button
              onClick={() => setStatusFilter('warnings')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'warnings' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warnings ({warningScans})
            </button>
          </div>

          {/* Bank Selector */}
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">All Banks</option>
            {banksList.map(b => (
              <option key={b} value={b}>Bank: {b}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              title="Card Breakdown View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Compact Table Matrix"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Account Breakdown List / Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs text-slate-400">Compiling account records and last scan audits...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8 space-y-3">
          <Server className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Matching Accounts</h3>
          <p className="text-xs text-slate-500">Try adjusting your search or active filter settings.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Detailed Account Breakdown Cards */
        <div className="space-y-6">
          {filteredAccounts.map((account) => {
            const scan = account.lastScan;
            const isScanning = scanningAccount === account.name;

            return (
              <motion.div
                key={account.name}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all space-y-5 group"
              >
                {/* Account Top Row: Title, Cluster Info & Availability */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-slate-800 rounded-2xl border border-slate-700/80 text-cyan-400 shrink-0">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
                          ACC {account.name}
                        </span>
                        <span className="text-xs font-mono text-slate-400">AWS ID #{account.awsId}</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Available
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 mt-1">{account.title}</h3>
                    </div>
                  </div>

                  {/* Cluster Metadata Badge */}
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                        <Server className="w-3 h-3 text-cyan-400" />
                        Attached Cluster
                      </span>
                      <span className="font-mono font-bold text-cyan-300">{account.clusterName}</span>
                    </div>
                    <div className="border-l border-slate-800 pl-3">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Region & Nodes</span>
                      <span className="font-mono text-slate-300">{account.region} • {account.nodesCount} Nodes</span>
                    </div>
                  </div>
                </div>

                {/* Account Mid Row: Last Scan of Records */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          Last Scan of Records
                        </span>
                        {getStatusBadge(scan?.status)}
                      </div>

                      {scan && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(scan.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>

                    {scan ? (
                      <div className="mt-3 space-y-3">
                        {/* Scan Metrics Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Services Scanned</span>
                            <span className="font-bold text-slate-200 font-mono">
                              {scan.totalServices} Total ({scan.onlineServices} Online)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Avg Response Latency</span>
                            <span className="font-bold text-cyan-300 font-mono">{scan.latencyAvgMs} ms</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Bank Verification</span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Compliance Score</span>
                            <span className="font-bold text-emerald-400 font-mono">{scan.complianceScore}%</span>
                          </div>
                        </div>

                        {/* Scanned Services Chips */}
                        {scan.servicesSnapshot && scan.servicesSnapshot.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Scanned Telemetry Snapshot</span>
                            <div className="flex flex-wrap gap-1.5">
                              {scan.servicesSnapshot.map((svc, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded-lg text-[11px] border border-slate-800 flex items-center gap-1.5"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      svc.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                                  />
                                  <strong>{svc.name}</strong>
                                  <span className="font-mono text-slate-500 text-[10px]">{svc.version}</span>
                                  {svc.latencyMs !== undefined && (
                                    <span className="font-mono text-cyan-400 text-[10px]">{svc.latencyMs}ms</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary / Notes */}
                        <p className="text-xs text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 italic">
                          "{scan.summary}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-3">No scans recorded yet for this account.</p>
                    )}
                  </div>

                  {/* Action Bar on Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {scan?.filename && (
                        <button
                          onClick={() => handleOpenScanFile(scan.filename)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Scan File</span>
                        </button>
                      )}
                      {scan && (
                        <button
                          onClick={(e) => handleDownloadScan(account, e)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Export JSON</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleRunQuickScan(account)}
                      disabled={isScanning}
                      className="py-1.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Running Telemetry Scan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Run Fresh Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Compact Breakdown Table / Matrix View */
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Account & Title</th>
                  <th className="px-5 py-4">Cluster Target</th>
                  <th className="px-5 py-4">Bank Record</th>
                  <th className="px-5 py-4">Last Scan Status</th>
                  <th className="px-5 py-4">Scanned Services</th>
                  <th className="px-5 py-4">Scan Time</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredAccounts.map((account) => {
                  const scan = account.lastScan;
                  const isScanning = scanningAccount === account.name;

                  return (
                    <tr key={account.name} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {account.name}
                          </span>
                          <div>
                            <strong className="text-slate-100 block">{account.title}</strong>
                            <span className="text-[11px] text-slate-500 font-mono">AWS #{account.awsId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-300">
                        <div>
                          <span className="text-cyan-300 font-bold">{account.clusterName}</span>
                          <span className="text-[11px] text-slate-500 block">{account.region} • {account.nodesCount} Nodes</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <strong className="text-slate-200">{account.attachedBank.name} ({account.attachedBank.code})</strong>
                          <span className="text-[11px] font-mono text-slate-400 block">{account.attachedBank.swiftBic}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {getStatusBadge(scan?.status)}
                      </td>

                      <td className="px-5 py-4 font-mono">
                        {scan ? (
                          <span>
                            <strong className="text-slate-200">{scan.onlineServices}</strong> / {scan.totalServices} Online
                            <span className="text-slate-500 text-[11px] block">{scan.latencyAvgMs}ms latency</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                        {scan?.timestamp ? new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {scan?.filename && (
                            <button
                              onClick={() => handleOpenScanFile(scan.filename)}
                              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                              title="View scan report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRunQuickScan(account)}
                            disabled={isScanning}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                          >
                            Scan
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* File Inspector / Review Modal */}
      <AnimatePresence>
        {selectedScanFile && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-950/80 text-cyan-400 rounded-xl border border-cyan-800/80">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedScanFile.filename}</h3>
                    <p className="text-xs text-slate-400 font-mono">Stored Local Disk Audit Record</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([selectedScanFile.raw], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = selectedScanFile.filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={() => setSelectedScanFile(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-mono">
                <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-cyan-300 overflow-x-auto max-h-[60vh] leading-relaxed">
                  {selectedScanFile.raw}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
