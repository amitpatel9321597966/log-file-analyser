import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Layers,
  HardDrive,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { fetchSettings, updateSettings, clearAllData } from '../lib/api';
import { useToast } from '../components/Toast';
import { useJob } from '../hooks/useJobContext';

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Form states
  const [workers, setWorkers] = useState(8);
  const [chunkSizeMb, setChunkSizeMb] = useState(16);
  const [defaultFormat, setDefaultFormat] = useState('apache_nginx');
  const [enginePreference, setEnginePreference] = useState('auto');

  const { addToast } = useToast();
  const { refreshJobs } = useJob();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSettings();
        setSettings(res);
        setWorkers(res.configuration.workers);
        setChunkSizeMb(res.configuration.chunk_size_mb);
        setDefaultFormat(res.configuration.default_format);
        setEnginePreference(res.configuration.engine_preference);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        workers,
        chunk_size_mb: chunkSizeMb,
        default_format: defaultFormat,
        engine_preference: enginePreference,
      });
      addToast('Settings updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL jobs, log entries, and uploaded files? This cannot be undone.')) {
      return;
    }
    setClearing(true);
    try {
      await clearAllData();
      addToast('All historical data wiped cleanly.', 'info');
      await refreshJobs();
    } catch (err) {
      addToast(err.message || 'Failed to clear data', 'error');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return <div className="card-base p-8 text-center text-xs text-slate-400">Loading system settings...</div>;
  }

  const sys = settings?.system_info || {};

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-heading">System & Engine Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure chunk boundaries, parallel worker concurrency, and manage storage resources.
        </p>
      </div>

      {/* Hardware Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card-base p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5 sm:mb-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span>CPU Hardware</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-heading">{sys.cpu_cores} Cores</div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">High-efficiency local parallelism</div>
        </div>

        <div className="card-base p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5 sm:mb-2">
            <HardDrive className="w-4 h-4 text-sky" />
            <span>System RAM</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-heading">{sys.total_ram_gb} GB</div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{sys.available_ram_gb} GB available</div>
        </div>

        <div className="card-base p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5 sm:mb-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Storage Disk</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-heading">{sys.disk_free_gb} GB</div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Free disk space available</div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="card-base p-4 sm:p-8 space-y-5 sm:space-y-6 bg-white">
        <h3 className="text-sm sm:text-base font-bold text-heading border-b border-slate-100 pb-3">
          Processing Configuration
        </h3>

        {/* Parallel Workers Concurrency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-heading uppercase tracking-wider">
              Worker Concurrency Pool
            </label>
            <span className="text-xs font-bold font-mono text-primary bg-primary-tint px-2.5 py-0.5 rounded-full border border-indigo-200">
              {workers} Parallel Processes
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Number of CPU processes dedicated to parallel regex parsing and mapping. Recommended: {sys.cpu_cores} cores.
          </p>
          <input
            type="range"
            min={1}
            max={Math.max(sys.cpu_cores, 8)}
            value={workers}
            onChange={(e) => setWorkers(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-slate-100 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>1 Worker (Sequential)</span>
            <span>{sys.cpu_cores} Workers (Optimal)</span>
          </div>
        </div>

        {/* Chunk Size Selector */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-heading uppercase tracking-wider block">
            MapReduce Chunk Split Size
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Byte slice size for chunked streaming. Each chunk boundary aligns to the next newline.
          </p>
          <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-2 sm:gap-3">
            {[8, 16, 32, 64].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setChunkSizeMb(size)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] tap-target ${
                  chunkSizeMb === size
                    ? 'border-primary bg-primary-tint text-primary shadow-subtle'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>
        </div>

        {/* Default Format */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-heading uppercase tracking-wider block">
            Default Format Fallback
          </label>
          <select
            value={defaultFormat}
            onChange={(e) => setDefaultFormat(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
          >
            <option value="apache_nginx">Apache / Nginx Combined Log Format (CLF)</option>
            <option value="generic_app">Generic Application Logs (Timestamp + Level + Message)</option>
          </select>
        </div>

        {/* Engine Preference */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-heading uppercase tracking-wider block">
            Processing Engine
          </label>
          <select
            value={enginePreference}
            onChange={(e) => setEnginePreference(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
          >
            <option value="auto">Automatic (Attempts PySpark, falls back to Multiprocessing)</option>
            <option value="multiprocessing">Python Multiprocessing Engine (Fastest local zero-dependency)</option>
            <option value="pyspark">PySpark Engine (Requires JVM Runtime)</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 min-h-[44px] tap-target"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Clear Data */}
      <div className="card-base p-4 sm:p-6 border-red-200 bg-red-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone: Clear All Log Data</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deletes all historical jobs, parsed log records, generated anomalies, and cached upload files.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearData}
            disabled={clearing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] tap-target"
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearing ? 'Wiping Data...' : 'Clear All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

