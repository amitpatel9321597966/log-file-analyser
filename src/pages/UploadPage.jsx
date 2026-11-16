import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Zap,
  Scissors,
  Cpu,
  Shuffle,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { uploadLogFile, generateSampleLogs } from '../lib/api';
import { useJob } from '../hooks/useJobContext';
import { useToast } from '../components/Toast';
import { formatBytes, formatNumber, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';

export function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sampleLines, setSampleLines] = useState(100000);
  const [injectAnomalies, setInjectAnomalies] = useState(true);
  const fileInputRef = useRef(null);

  const { jobs, refreshJobs, selectJob } = useJob();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workers', 8);
      formData.append('engine_preference', 'auto');

      const res = await uploadLogFile(formData);
      addToast(`Uploaded ${file.name}. Starting pipeline...`, 'success');
      await refreshJobs();
      selectJob(res.job_id);
      navigate('/pipeline');
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateSample = async (count) => {
    setGenerating(true);
    try {
      const res = await generateSampleLogs({
        line_count: count,
        format: 'apache_nginx',
        inject_anomalies: injectAnomalies,
      });
      addToast(`Generated ${formatNumber(count)} sample log lines!`, 'success');
      await refreshJobs();
      selectJob(res.job_id);
      navigate('/pipeline');
    } catch (err) {
      addToast(err.message || 'Sample generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-primary text-xs font-semibold mb-3 sm:mb-4 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>High-Speed Parallel Log Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-heading leading-tight">
          Analyze Millions of Log Lines in Seconds
        </h1>
        <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-body leading-relaxed max-w-xl mx-auto">
          Multi-core log analysis that parses gigabytes of web traffic fast.
          Detect failed logins, server crashes, 404 scans, and traffic spikes instantly.
        </p>
      </div>

      {/* Main Upload / Drag and Drop Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card (Stacked on mobile & tablet, 2 Cols on desktop) */}
        <div className="lg:col-span-2 card-base p-5 sm:p-8 flex flex-col justify-between">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
              dragOver
                ? 'border-primary bg-primary-tint/40 scale-[0.99]'
                : 'border-slate-300 hover:border-primary/60 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              accept=".log,.txt,.gz"
            />

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm">
              {uploading ? (
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
              )}
            </div>

            <div className="text-sm sm:text-base font-bold text-heading">
              {uploading ? 'Streaming and chunking file...' : (
                <>
                  <span className="hidden sm:inline">Drop your log file here, or browse</span>
                  <span className="sm:hidden">Tap to choose a log file, or drop here</span>
                </>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-sm">
              Supports .log, .txt, or compressed .gz files up to 1 GB. Automatically chunked and processed in parallel.
            </p>

            {/* Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-semibold">.log</span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-semibold">.txt</span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-semibold">.gz</span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-indigo-50 text-primary text-[11px] sm:text-xs font-semibold">Apache / Nginx</span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-indigo-50 text-primary text-[11px] sm:text-xs font-semibold">Generic App Logs</span>
            </div>
          </div>
        </div>

        {/* Generate Sample Logs Card (Stacked on mobile & tablet, 1 Col on desktop) */}
        <div className="card-base p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm mb-1">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Instant Test Data</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-heading">Generate Sample Logs</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create realistic web logs with real-world problems (repeated failed logins, 404 scans, 500 server crashes, and traffic spikes).
            </p>

            {/* Size Selector */}
            <div className="mt-4 sm:mt-5 space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Select Dataset Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { lines: 100000, label: '100K', desc: '~17 MB' },
                  { lines: 1000000, label: '1M', desc: '~175 MB' },
                  { lines: 5000000, label: '5M', desc: '~875 MB' },
                ].map((opt) => (
                  <button
                    key={opt.lines}
                    type="button"
                    onClick={() => setSampleLines(opt.lines)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all min-h-[44px] flex flex-col justify-center items-center ${
                      sampleLines === opt.lines
                        ? 'border-primary bg-primary-tint text-primary font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">{opt.label}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Anomaly Checkbox */}
            <label className="flex items-center gap-2 mt-4 cursor-pointer text-xs font-medium text-slate-600 min-h-[44px]">
              <input
                type="checkbox"
                checked={injectAnomalies}
                onChange={(e) => setInjectAnomalies(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              />
              <span>Inject realistic security threats & anomalies</span>
            </label>
          </div>

          <button
            onClick={() => handleGenerateSample(sampleLines)}
            disabled={generating || uploading}
            className="w-full mt-5 sm:mt-6 py-3 px-4 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {formatNumber(sampleLines)} lines...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Generate & Analyze {sampleLines >= 1000000 ? `${sampleLines/1000000}M` : `${sampleLines/1000}K`} Lines</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* How It Works - 4 Cards */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
          How Log Files Are Processed Fast
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Scissors,
              title: '1. Split File',
              desc: 'Splits big log files into byte chunks at clean line boundaries so multiple CPU cores can read at once.',
            },
            {
              icon: Cpu,
              title: '2. Parallel Parse',
              desc: 'Worker cores parse timestamps, IPs, URLs, and HTTP status codes simultaneously at high speed.',
            },
            {
              icon: Shuffle,
              title: '3. Count & Group',
              desc: 'Combines all worker totals: total requests, unique visitors, top URLs, and error percentage.',
            },
            {
              icon: BarChart3,
              title: '4. View Dashboard',
              desc: 'Renders charts and flags problems like failed logins, 404 scans, server errors, and traffic spikes.',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="card-base p-5 bg-white">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h4 className="text-sm font-bold text-heading">{card.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Jobs Preview */}
      {jobs && jobs.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-heading">Recent Analyses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quickly re-open previously processed log files</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  selectJob(job.id);
                  navigate('/');
                }}
                className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-mono text-xs shrink-0">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-heading font-mono truncate">{job.filename}</div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      <span>{formatNumber(job.total_lines)} lines</span>
                      <span>&bull;</span>
                      <span>{formatBytes(job.file_size_bytes)}</span>
                      <span>&bull;</span>
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
                  {job.anomaly_count > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {job.anomaly_count} Anomalies
                    </span>
                  )}
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    Open Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

