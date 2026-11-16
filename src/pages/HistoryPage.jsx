import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  FileText,
  Trash2,
  ExternalLink,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useJob } from '../hooks/useJobContext';
import { deleteJob, API_BASE } from '../lib/api';
import { useToast } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { formatNumber, formatBytes, formatDate } from '../lib/utils';

export function HistoryPage() {
  const { jobs, selectJob, refreshJobs, currentJobId } = useJob();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async (e, jobId, filename) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete analysis for "${filename}"?`)) return;
    try {
      await deleteJob(jobId);
      addToast(`Deleted job for ${filename}`, 'info');
      await refreshJobs();
    } catch (err) {
      addToast(err.message || 'Failed to delete job', 'error');
    }
  };

  const handleOpen = (jobId) => {
    selectJob(jobId);
    navigate('/');
  };

  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Past Analyses Found"
        description="Every log file processed with LogLense is archived here for quick retrieval and reporting."
        actionLabel="Create First Analysis"
        actionHref="/upload"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-heading">Analysis History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Archived Big Data processing jobs with saved metrics, threats, and export reports.
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. MOBILE CARD LIST (< sm)                                   */}
      {/* ============================================================ */}
      <div className="sm:hidden space-y-3">
        {jobs.map((job) => {
          const isActive = job.id === currentJobId;

          return (
            <div
              key={job.id}
              onClick={() => handleOpen(job.id)}
              className={`card-base p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                isActive ? 'border-primary ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-xs text-heading truncate">
                      {job.filename}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {job.format_detected} &bull; {job.engine}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <span className="text-[10px] font-bold uppercase bg-primary-tint text-primary px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                    Active
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2 my-2 border-y border-slate-100 text-slate-600">
                <div>Lines: <span className="font-bold text-heading">{formatNumber(job.total_lines)}</span></div>
                <div>Size: <span className="font-bold text-heading">{formatBytes(job.file_size_bytes)}</span></div>
                <div>Time: <span className="font-bold text-heading">{job.parse_time_seconds.toFixed(2)}s</span></div>
                <div>
                  {job.anomaly_count > 0 ? (
                    <span className="text-rose-600 font-bold">{job.anomaly_count} Threats</span>
                  ) : (
                    <span className="text-slate-400">0 Threats</span>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div
                className="flex items-center justify-between pt-1 gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleOpen(job.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-white text-xs font-bold tap-target min-h-[44px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>

                <a
                  href={`${API_BASE}/jobs/${job.id}/export/csv`}
                  download
                  className="tap-target px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-600 flex items-center justify-center min-h-[44px]"
                  title="CSV"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </a>

                <a
                  href={`${API_BASE}/jobs/${job.id}/export/pdf`}
                  download
                  className="tap-target px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-primary flex items-center justify-center min-h-[44px]"
                  title="PDF"
                >
                  <Download className="w-4 h-4 text-primary" />
                </a>

                <button
                  onClick={(e) => handleDelete(e, job.id, job.filename)}
                  className="tap-target px-3 py-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 flex items-center justify-center min-h-[44px]"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 2. TABLET & DESKTOP TABLE (>= sm)                            */}
      {/* ============================================================ */}
      <div className="hidden sm:block card-base overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Log File</th>
                <th className="py-3.5 px-6">Lines & Volume</th>
                <th className="py-3.5 px-6">Execution Duration</th>
                <th className="py-3.5 px-6">Anomalies</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const isActive = job.id === currentJobId;

                return (
                  <tr
                    key={job.id}
                    onClick={() => handleOpen(job.id)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                      isActive ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    {/* Log File Name & Engine */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-heading flex items-center gap-2">
                            <span>{job.filename}</span>
                            {isActive && (
                              <span className="text-[10px] font-bold uppercase bg-primary-tint text-primary px-1.5 py-0.5 rounded border border-indigo-200">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] capitalize mt-0.5">
                            {job.format_detected} &bull; {job.engine}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Lines & Volume */}
                    <td className="py-4 px-6 font-mono text-slate-700">
                      <div className="font-bold">{formatNumber(job.total_lines)} lines</div>
                      <div className="text-[11px] text-slate-400">{formatBytes(job.file_size_bytes)}</div>
                    </td>

                    {/* Duration & Workers */}
                    <td className="py-4 px-6 font-mono text-slate-700">
                      <div className="font-bold">{job.parse_time_seconds.toFixed(2)}s</div>
                      <div className="text-[11px] text-slate-400">{job.workers_used} Workers</div>
                    </td>

                    {/* Anomalies Badge */}
                    <td className="py-4 px-6">
                      {job.anomaly_count > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {job.anomaly_count} Threats
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(job.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpen(job.id)}
                          title="Open Dashboard"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <a
                          href={`${API_BASE}/jobs/${job.id}/export/csv`}
                          download
                          title="Export CSV"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </a>
                        <a
                          href={`${API_BASE}/jobs/${job.id}/export/pdf`}
                          download
                          title="Export PDF Report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={(e) => handleDelete(e, job.id, job.filename)}
                          title="Delete Job"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}

