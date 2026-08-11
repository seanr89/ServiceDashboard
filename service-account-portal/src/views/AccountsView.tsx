import React, { useState } from 'react';
import { AccountInfo, ServiceItem } from '../types';
import { AccountClusterCard } from '../components/AccountClusterCard';
import { Cpu, Search, Building2, Server, Activity, ShieldCheck, Plus, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AccountsViewProps {
  accounts: AccountInfo[];
  services: ServiceItem[];
  loading: boolean;
  onRequestAudit: (account: AccountInfo) => void;
  onSaveLocalRecord: (account: AccountInfo) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  services,
  loading,
  onRequestAudit,
  onSaveLocalRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  const banksList = Array.from(new Set(accounts.map(a => a.attachedBank.code)));

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.clusterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.awsId.toString().includes(searchQuery) ||
      acc.attachedBank.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBank = !selectedBankFilter || acc.attachedBank.code === selectedBankFilter;
    const matchesStatus = !selectedStatusFilter || acc.clusterStatus === selectedStatusFilter;

    return matchesSearch && matchesBank && matchesStatus;
  });

  const healthyClusters = accounts.filter(a => a.clusterStatus === 'healthy').length;
  const totalNodes = accounts.reduce((acc, a) => acc + a.nodesCount, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800/60">
            <Cpu className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Accounts</span>
            <h3 className="text-xl font-bold text-slate-100 font-mono">{accounts.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/60">
            <Server className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Healthy Clusters</span>
            <h3 className="text-xl font-bold text-emerald-400 font-mono">{healthyClusters} / {accounts.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-950 text-blue-400 rounded-xl border border-blue-800/60">
            <Building2 className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Bank Partners</span>
            <h3 className="text-xl font-bold text-blue-300 font-mono">{banksList.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800/60">
            <Activity className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Monitored Services</span>
            <h3 className="text-xl font-bold text-indigo-300 font-mono">{services.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, cluster names, AWS IDs, or bank records..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Bank & Cluster Status Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBankFilter}
            onChange={(e) => setSelectedBankFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="">All Bank Partners</option>
            {banksList.map(b => (
              <option key={b} value={b}>Bank: {b}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="">All Cluster Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="degraded">Degraded</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Account Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs text-slate-400">Loading accounts and cluster configurations...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 space-y-3">
          <Server className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Account Clusters Found</h3>
          <p className="text-xs text-slate-500">No accounts match your active search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <AccountClusterCard
              key={account.name}
              account={account}
              onRequestAudit={onRequestAudit}
              onSaveLocalRecord={onSaveLocalRecord}
            />
          ))}
        </div>
      )}

      {/* Services Table Summary Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Active Monitored Services Telemetry
            </h3>
            <p className="text-xs text-slate-400">Services attached to active account clusters</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800/80 rounded-xl">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Target Account</th>
                <th className="px-4 py-3">Attached Bank</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Env</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-100">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-cyan-300">ACC {s.account}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{s.bank}</td>
                  <td className="px-4 py-3 font-mono text-indigo-300">{s.serviceType}</td>
                  <td className="px-4 py-3 font-mono uppercase text-slate-400">{s.env}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      s.status === 'online' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                      s.status === 'offline' ? 'bg-rose-950 text-rose-400 border border-rose-800/60' :
                      'bg-amber-950 text-amber-400 border border-amber-800/60'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    {s.latencyMs ? `${s.latencyMs}ms` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
