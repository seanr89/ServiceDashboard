import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { AccountsView } from './views/AccountsView';
import { RequestServiceView } from './views/RequestServiceView';
import { FileReviewView } from './views/FileReviewView';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { AccountInfo, ServiceItem, LocalReviewFile } from './types';

export default function App() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [localFilesCount, setLocalFilesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetAccountForModal, setTargetAccountForModal] = useState<AccountInfo | null>(null);

  const loadData = async () => {
    try {
      const [accRes, svcRes, fileRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/services'),
        fetch('/api/local-files'),
      ]);

      if (accRes.ok) setAccounts(await accRes.json());
      if (svcRes.ok) setServices(await svcRes.json());
      if (fileRes.ok) {
        const files: LocalReviewFile[] = await fileRes.json();
        setLocalFilesCount(files.length);
      }
    } catch (err) {
      console.error('Failed loading backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRequestModal = (acc?: AccountInfo) => {
    setTargetAccountForModal(acc || null);
    setIsRequestModalOpen(true);
  };

  const handleQuickSaveLocalRecord = async (acc: AccountInfo) => {
    try {
      const auditPayload = {
        id: `audit-quick-${Date.now().toString(36)}`,
        generatedAt: new Date().toISOString(),
        title: `Account ${acc.name} - ${acc.clusterName} Snapshot`,
        account: acc,
        services: services.filter(s => s.account === acc.name),
        reviewNotes: `Quick local record export for ${acc.title}. Attached Bank: ${acc.attachedBank.name} (${acc.attachedBank.code}).`
      };

      const filename = `account-${acc.name}-cluster-snapshot-${Date.now()}.json`;

      const res = await fetch('/api/local-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: auditPayload,
          format: 'json'
        })
      });

      if (res.ok) {
        loadData();
        alert(`Account snapshot stored in local disk files as "${filename}"!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <Navbar
          filesCount={localFilesCount}
          accountsCount={accounts.length}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  accounts={accounts}
                  services={services}
                  loading={loading}
                  onRefresh={loadData}
                  onRequestAudit={(acc) => handleOpenRequestModal(acc)}
                />
              }
            />
            <Route
              path="/accounts"
              element={
                <AccountsView
                  accounts={accounts}
                  services={services}
                  loading={loading}
                  onRequestAudit={(acc) => handleOpenRequestModal(acc)}
                  onSaveLocalRecord={handleQuickSaveLocalRecord}
                />
              }
            />
            <Route
              path="/request"
              element={
                <RequestServiceView
                  accounts={accounts}
                  onSavedToLocal={loadData}
                />
              }
            />
            <Route
              path="/reviews"
              element={
                <FileReviewView
                  onRefresh={loadData}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>Service Account & Audit Portal • Local File Review Engine</p>
        </footer>

        {/* Global Service Request Modal */}
        <ServiceRequestModal
          accounts={accounts}
          initialAccount={targetAccountForModal}
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          onSavedToLocal={loadData}
        />
      </div>
    </Router>
  );
}
