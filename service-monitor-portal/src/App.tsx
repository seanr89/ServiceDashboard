import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { LayoutDashboard, Settings, Activity, Server, Plus, Trash2, RefreshCw, Filter, X, Info, Calendar } from "lucide-react";

const ACCOUNTS = ["057", "058", "074", "075", "076", "080", "081"];
const BANKS = ["NW", "BB", "GMM", "RBS"];
const ENVS = ["sbx", "qa", "uat", "prod"];
const SERVICE_TYPES = ["API", "Lambda", "Fargate"];
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import MaterialSelect from "./components/MaterialSelect";
import MaterialDatePicker from "./components/MaterialDatePicker";

// --- Components ---

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-600 font-medium">Initializing Portal...</p>
    </div>
  </div>
);


const Navbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
              <Activity className="w-6 h-6 text-blue-600" />
              <span>Monitor</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/admin" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NoRecordsFound = ({ hasActiveFilters, onReset }: { hasActiveFilters: boolean; onReset: () => void }) => (
  <div className="col-span-full py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center">
    <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-400">
      <Server className="w-10 h-10 stroke-[1.5]" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">No Services Found</h3>
    <p className="text-slate-500 text-sm max-w-md mb-6">
      {hasActiveFilters 
        ? "No services match your active filter criteria. Try adjusting or clearing your filters to see more results."
        : "There are currently no services registered in the monitoring system."}
    </p>
    {hasActiveFilters && (
      <button 
        onClick={onReset}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Reset Active Filters
      </button>
    )}
  </div>
);

const Dashboard = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedEnv, setSelectedEnv] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const today = new Date();
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const maxDate = formatDate(today);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);
  const minDate = formatDate(fourteenDaysAgo);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-12">
        <style>{`
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8 relative">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-blue-600 rounded-full w-1/3"
            style={{ animation: 'loadingBar 1.5s infinite linear' }}
          ></div>
        </div>
        <div className="p-8 text-center text-slate-500 font-medium">
          Loading services...
        </div>
      </div>
    );
  }

  // Compute filtered services
  const displayServices = services.filter(service => {
    const matchAccount = !selectedAccount || service.account === selectedAccount;
    const matchBank = !selectedBank || service.bank === selectedBank;
    const matchEnv = !selectedEnv || service.env === selectedEnv;
    const matchServiceType = !selectedServiceType || service.serviceType === selectedServiceType;
    const matchDate = !selectedDate || (() => {
      if (!service.lastUpdated?.seconds) return false;
      const serviceDate = new Date(service.lastUpdated.seconds * 1000);
      return formatDate(serviceDate) === selectedDate;
    })();
    return matchAccount && matchBank && matchEnv && matchServiceType && matchDate;
  });

  const hasActiveFilters = selectedAccount !== "" || selectedBank !== "" || selectedEnv !== "" || selectedServiceType !== "" || selectedDate !== "";

  const clearFilters = () => {
    setSelectedAccount("");
    setSelectedBank("");
    setSelectedEnv("");
    setSelectedServiceType("");
    setSelectedDate("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">

      {/* Modern Beautiful Filter Bar */}
      <div className="bg-white rounded-2xl p-5 mb-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-center gap-4 flex-grow">
          <div className="flex items-center gap-2 text-slate-500 lg:mr-2 col-span-full lg:col-span-1">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold">Filters:</span>
          </div>

          {/* Account Dropdown */}
          <MaterialSelect
            label="Account"
            value={selectedAccount}
            onChange={setSelectedAccount}
            options={[
              { value: "", label: "All Accounts" },
              ...ACCOUNTS.map(acc => ({ value: acc, label: acc }))
            ]}
            className="w-full lg:w-44"
          />

          {/* Bank Dropdown */}
          <MaterialSelect
            label="Bank"
            value={selectedBank}
            onChange={setSelectedBank}
            options={[
              { value: "", label: "All Banks" },
              ...BANKS.map(bank => ({ value: bank, label: bank }))
            ]}
            className="w-full lg:w-36"
          />

          {/* Env Dropdown */}
          <MaterialSelect
            label="Environment"
            value={selectedEnv}
            onChange={setSelectedEnv}
            options={[
              { value: "", label: "All Environments" },
              ...ENVS.map(env => ({ value: env, label: env.toUpperCase() }))
            ]}
            className="w-full lg:w-44"
          />

          {/* Service Type Dropdown */}
          <MaterialSelect
            label="Service Type"
            value={selectedServiceType}
            onChange={setSelectedServiceType}
            options={[
              { value: "", label: "All Types" },
              ...SERVICE_TYPES.map(st => ({ value: st, label: st }))
            ]}
            className="w-full lg:w-36"
          />

          {/* Date Selector */}
          <MaterialDatePicker
            label="Last Updated"
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={minDate}
            maxDate={maxDate}
            className="w-full lg:w-48"
          />
        </div>

        {/* Clear Filters Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayServices.length === 0 ? (
          <NoRecordsFound hasActiveFilters={hasActiveFilters} onReset={clearFilters} />
        ) : (
          displayServices.map((service) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative",
                service.id.startsWith('ex-') && "border-blue-200 bg-blue-50/30"
              )}
            >
              {service.id.startsWith('ex-') && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  EXAMPLE
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Server className="w-6 h-6 text-slate-600" />
                </div>
                <div className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                  service.status === "online" ? "bg-green-100 text-green-700" :
                  service.status === "offline" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {service.status}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{service.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Account</span>
                  <span className="font-semibold text-slate-950 bg-slate-100 px-2 py-0.5 rounded text-xs">{service.account || "057"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Version</span>
                  <span className="font-mono text-slate-900">{service.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-900 text-xs">
                    {service.lastUpdated?.seconds ? new Date(service.lastUpdated.seconds * 1000).toLocaleTimeString() : "N/A"}
                  </span>
                </div>
              </div>

              {/* Badges for Account, Env, Service Type */}
              <div className="pt-3 border-t border-slate-100 flex gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase tracking-wider">
                  ACC: {service.account || "057"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                  BANK: {service.bank || "NW"}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider",
                  service.env === "prod" ? "bg-red-50 text-red-600 border-red-100" :
                  service.env === "uat" ? "bg-amber-50 text-amber-600 border-amber-100" :
                  service.env === "qa" ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                  {service.env || "sbx"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                  {service.serviceType || "API"}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const AdminPortal = () => {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({ 
    name: "", 
    version: "", 
    status: "online",
    account: "057",
    bank: "NW",
    env: "sbx",
    serviceType: "API"
  });
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.version) return;
    setLoading(true);
    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      setNewService({ 
        name: "", 
        version: "", 
        status: "online",
        account: "057",
        bank: "NW",
        env: "sbx",
        serviceType: "API"
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
        <p className="text-slate-500">Manage monitored services and system configuration.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Service
            </h2>
            <form onSubmit={handleAddService} className="space-y-4">
              {/* Service Name */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={newService.name}
                  onChange={e => setNewService({ ...newService, name: e.target.value })}
                  placeholder=" "
                  className="peer w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-sm font-medium transition-all outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 origin-left text-sm text-slate-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-blue-600">
                  Service Name
                </span>
              </div>

              {/* Version */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={newService.version}
                  onChange={e => setNewService({ ...newService, version: e.target.value })}
                  placeholder=" "
                  className="peer w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-sm font-medium transition-all outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 origin-left text-sm text-slate-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-blue-600">
                  Version
                </span>
              </div>

              {/* Account Dropdown */}
              <MaterialSelect
                label="Account"
                value={newService.account}
                onChange={val => setNewService({ ...newService, account: val })}
                options={ACCOUNTS.map(acc => ({ value: acc, label: acc }))}
              />

              {/* Bank Dropdown */}
              <MaterialSelect
                label="Bank"
                value={newService.bank}
                onChange={val => setNewService({ ...newService, bank: val })}
                options={BANKS.map(bank => ({ value: bank, label: bank }))}
              />

              {/* Environment Dropdown */}
              <MaterialSelect
                label="Environment"
                value={newService.env}
                onChange={val => setNewService({ ...newService, env: val })}
                options={ENVS.map(env => ({ value: env, label: env.toUpperCase() }))}
              />

              {/* Service Type Dropdown */}
              <MaterialSelect
                label="Service Type"
                value={newService.serviceType}
                onChange={val => setNewService({ ...newService, serviceType: val })}
                options={SERVICE_TYPES.map(st => ({ value: st, label: st }))}
              />

              {/* Initial Status Dropdown */}
              <MaterialSelect
                label="Initial Status"
                value={newService.status}
                onChange={val => setNewService({ ...newService, status: val })}
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                  { value: "maintenance", label: "Maintenance" }
                ]}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Add Service
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Service</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Metadata</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Version</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map(service => (
                    <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase tracking-wider">
                            ACC: {service.account || "057"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                            BANK: {service.bank || "NW"}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider",
                            service.env === "prod" ? "bg-red-50 text-red-600 border-red-100" :
                            service.env === "uat" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            service.env === "qa" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-slate-50 text-slate-600 border-slate-100"
                          )}>
                            {service.env || "sbx"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                            {service.serviceType || "API"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm">{service.version}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                          service.status === "online" ? "bg-green-100 text-green-700" :
                          service.status === "offline" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
