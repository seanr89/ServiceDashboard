import React from 'react';
import { AccountInfo } from '../types';
import { Server, Building2, ShieldCheck, Cpu, ArrowUpRight, DollarSign, Activity, FileJson } from 'lucide-react';
import { motion } from 'motion/react';

interface AccountClusterCardProps {
  account: AccountInfo;
  onRequestAudit: (acc: AccountInfo) => void;
  onSaveLocalRecord: (acc: AccountInfo) => void;
}

export const AccountClusterCard: React.FC<AccountClusterCardProps> = ({
  account,
  onRequestAudit,
  onSaveLocalRecord,
}) => {
  const bank = account.attachedBank;

  const statusColors = {
    healthy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    degraded: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    maintenance: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const complianceColors = {
    Passed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    'Pending Review': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    Audited: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-cyan-950/20 flex flex-col justify-between group"
    >
      <div>
        {/* Header: Account Code & Cluster Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 text-cyan-400">
              <Cpu className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  ACC {account.name}
                </span>
                <span className="text-xs font-mono text-slate-400">AWS #{account.awsId}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{account.title}</h3>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              statusColors[account.clusterStatus] || statusColors.healthy
            }`}
          >
            {account.clusterStatus}
          </span>
        </div>

        {/* Cluster Name & Region Info Banner */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/90 mb-4 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Cluster Name
            </span>
            <span className="font-mono font-bold text-cyan-300 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {account.clusterName}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Cloud Region</span>
            <span className="font-mono text-slate-300 text-xs">{account.region} ({account.nodesCount} Nodes)</span>
          </div>
        </div>

        {/* Attached Bank & Bank Records Section */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Attached Bank Record
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                complianceColors[bank.complianceStatus]
              }`}
            >
              {bank.complianceStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <div>
              <span className="text-slate-500 block text-[10px]">Bank Partner</span>
              <span className="font-semibold text-slate-200">{bank.name} ({bank.code})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SWIFT / BIC</span>
              <span className="font-mono text-slate-300">{bank.swiftBic}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Sort / Routing Code</span>
              <span className="font-mono text-slate-300">{bank.routingCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Daily Limit</span>
              <span className="font-mono text-emerald-400 font-medium">
                ${(bank.dailyLimitUsd / 1000000).toFixed(0)}M USD
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-800/40">
              <span className="text-slate-500 block text-[10px]">Settlement Account</span>
              <span className="font-mono text-[11px] text-slate-300 truncate block" title={bank.settlementAccount}>
                {bank.settlementAccount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onRequestAudit(account)}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-950/50"
        >
          <span>Request Service Info</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSaveLocalRecord(account)}
          title="Save account audit snapshot directly into local files"
          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-700/80"
        >
          <FileJson className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Save Local File</span>
        </button>
      </div>
    </motion.div>
  );
};
