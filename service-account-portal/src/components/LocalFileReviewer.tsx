import React, { useState, useEffect } from 'react';
import { LocalReviewFile } from '../types';
import { HardDriveDownload, FileText, Trash2, Download, Eye, RefreshCw, Search, X, CheckCircle2, ShieldCheck, Server, Building2, ExternalLink, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocalFileReviewerProps {
  onRefresh?: () => void;
}

export const LocalFileReviewer: React.FC<LocalFileReviewerProps> = ({ onRefresh }) => {
  const [files, setFiles] = useState<LocalReviewFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ filename: string; content: any; raw: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/local-files');
      if (!res.ok) throw new Error('Failed to fetch local files');
      const data = await res.json();
      setFiles(data);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', msg: err.message || 'Error loading local files' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleOpenFile = async (filename: string) => {
    setLoadingFile(true);
    try {
      const res = await fetch(`/api/local-files/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('Could not read file from disk');
      const fileDetail = await res.json();
      setSelectedFile(fileDetail);
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'Error reading file' });
    } finally {
      setLoadingFile(false);
    }
  };

  const handleDeleteFile = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${filename}" from local disk storage?`)) return;

    try {
      const res = await fetch(`/api/local-files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete file');
      setStatusMessage({ type: 'success', msg: `Successfully deleted ${filename} from local storage.` });
      if (selectedFile?.filename === filename) setSelectedFile(null);
      fetchFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', msg: err.message || 'Delete failed' });
    }
  };

  // Browser Client Download
  const handleDownloadFile = (filename: string, contentStr: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const blob = new Blob([contentStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', msg: `Downloaded ${filename} to your browser downloads.` });
  };

  // Native Web File System Access API
  const handleNativeSaveFile = async (filename: string, contentStr: string) => {
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON Review File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(contentStr);
        await writable.close();
        setStatusMessage({ type: 'success', msg: `Saved file locally via File System API!` });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
          // Fallback to normal download
          handleDownloadFile(filename, contentStr);
        }
      }
    } else {
      handleDownloadFile(filename, contentStr);
    }
  };

  // Drag and drop or upload local file to inspect
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const rawText = evt.target?.result as string;
      try {
        const parsed = JSON.parse(rawText);
        setSelectedFile({
          filename: uploadedFile.name,
          content: parsed,
          raw: rawText
        });
        setStatusMessage({ type: 'success', msg: `Loaded external file "${uploadedFile.name}" into review viewer.` });
      } catch (err) {
        setSelectedFile({
          filename: uploadedFile.name,
          content: null,
          raw: rawText
        });
      }
    };
    reader.readAsText(uploadedFile);
  };

  const filteredFiles = files.filter(f =>
    f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.title && f.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (f.accountName && f.accountName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (f.bankCode && f.bankCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <HardDriveDownload className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Local Review File Repository</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, inspect, and download requested service information payloads saved to disk in <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">storage/reviews/</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer border border-slate-700/80 transition-all">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open External Local File</span>
            <input type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={fetchFiles}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 cursor-pointer"
            title="Refresh file list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
          statusMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-rose-950/80 text-rose-300 border-rose-800'
        }`}>
          <span>{statusMessage.msg}</span>
          <button onClick={() => setStatusMessage(null)} className="cursor-pointer text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter files by filename, title, account, or bank code..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Files Grid / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs">Scanning local disk storage directory...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Review Files Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? "No files match your search filter criteria." : "There are currently no review files saved in storage/reviews/. Generate a request payload to store your first local review file."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <motion.div
              key={file.filename}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleOpenFile(file.filename)}
              className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 cursor-pointer transition-all shadow-md hover:shadow-cyan-950/20 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-slate-800 rounded-lg text-cyan-400 border border-slate-700/80">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {file.bankCode && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        BANK: {file.bankCode}
                      </span>
                    )}
                    {file.accountName && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        ACC: {file.accountName}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-100 line-clamp-1 mb-1 group-hover:text-cyan-300 transition-colors">
                  {file.title || file.filename}
                </h4>
                <p className="font-mono text-[11px] text-slate-500 truncate mb-3">{file.filename}</p>

                {file.reviewNotes && (
                  <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 mb-3 italic">
                    "{file.reviewNotes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[10px]">
                  {(file.sizeBytes / 1024).toFixed(1)} KB • {new Date(file.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDeleteFile(file.filename, e)}
                    title="Delete local file"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFile(file.filename);
                    }}
                    title="Inspect & Review File"
                    className="p-1.5 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* File Inspector / Review Modal */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-950/80 text-cyan-400 rounded-xl border border-cyan-800/80">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedFile.filename}</h3>
                    <p className="text-xs text-slate-400 font-mono">Saved Local Disk Review File</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNativeSaveFile(selectedFile.filename, selectedFile.raw)}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export / Download</span>
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {selectedFile.content ? (
                  <>
                    {/* Header Summary Cards if standard payload */}
                    {selectedFile.content.account && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Account Cluster Info */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <Server className="w-4 h-4 text-cyan-400" />
                              Account & Cluster Target
                            </span>
                            <span className="font-mono text-cyan-300 text-xs">ACC {selectedFile.content.account.name}</span>
                          </div>
                          <div className="text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
                            <div>Title: <strong className="text-slate-200">{selectedFile.content.account.title}</strong></div>
                            <div>Cluster Name: <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">{selectedFile.content.account.clusterName}</code></div>
                            <div>AWS ID: <span className="font-mono text-slate-300">{selectedFile.content.account.awsId}</span></div>
                            <div>Cluster Status: <span className="font-semibold capitalize text-emerald-400">{selectedFile.content.account.clusterStatus}</span> ({selectedFile.content.account.nodesCount} Nodes)</div>
                          </div>
                        </div>

                        {/* Bank Records Attached */}
                        {selectedFile.content.account.attachedBank && (
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                Attached Bank Record
                              </span>
                              <span className="font-mono text-blue-300 text-xs">{selectedFile.content.account.attachedBank.code}</span>
                            </div>
                            <div className="text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
                              <div>Bank Name: <strong className="text-slate-200">{selectedFile.content.account.attachedBank.name}</strong></div>
                              <div>SWIFT/BIC: <code className="text-slate-300 font-mono">{selectedFile.content.account.attachedBank.swiftBic}</code></div>
                              <div>Sort/Routing: <span className="font-mono text-slate-300">{selectedFile.content.account.attachedBank.routingCode}</span></div>
                              <div>Compliance: <span className="text-emerald-400 font-semibold">{selectedFile.content.account.attachedBank.complianceStatus}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Services Included Table */}
                    {Array.isArray(selectedFile.content.services) && selectedFile.content.services.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-300">Services Included in Payload ({selectedFile.content.services.length})</h4>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                          <table className="w-full text-left font-sans">
                            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Service Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Env</th>
                                <th className="px-4 py-3">Version</th>
                                <th className="px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300 font-medium">
                              {selectedFile.content.services.map((s: any, idx: number) => (
                                <tr key={s.id || idx} className="hover:bg-slate-900/50">
                                  <td className="px-4 py-2.5 font-bold text-slate-100">{s.name}</td>
                                  <td className="px-4 py-2.5 font-mono text-indigo-300">{s.serviceType || 'API'}</td>
                                  <td className="px-4 py-2.5 uppercase font-mono text-slate-400">{s.env}</td>
                                  <td className="px-4 py-2.5 font-mono">{s.version}</td>
                                  <td className="px-4 py-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                      s.status === 'online' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                                    }`}>
                                      {s.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Raw JSON viewer */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-300">Raw JSON Payload</h4>
                      <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-60 leading-relaxed">
                        {selectedFile.raw}
                      </pre>
                    </div>
                  </>
                ) : (
                  <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
                    {selectedFile.raw}
                  </pre>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
