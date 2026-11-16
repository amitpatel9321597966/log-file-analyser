import React from 'react';
import {
  Scissors,
  Cpu,
  Shuffle,
  Database,
  Terminal,
  Activity,
  Zap,
  Clock,
  Layers,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { useJob } from '../hooks/useJobContext';
import { StepperProgress } from '../components/StepperProgress';
import { EmptyState } from '../components/EmptyState';
import { formatNumber, formatBytes, formatDuration } from '../lib/utils';

export function PipelinePage() {
  const { currentJob } = useJob();

  if (!currentJob) {
    return (
      <EmptyState
        title="No Pipeline Running"
        description="Launch an analysis from the Upload page to see the MapReduce parallel execution live."
        actionLabel="Go to Upload"
        actionHref="/upload"
      />
    );
  }

  // Calculate simulated or actual progress percentage
  const getProgressPercent = () => {
    switch (currentJob.status) {
      case 'splitting': return 25;
      case 'mapping': return 65;
      case 'reducing': return 85;
      case 'storing': return 95;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 10;
    }
  };

  const chunksCount = Math.max(1, Math.ceil((currentJob.file_size_bytes || 1) / (16 * 1024 * 1024)));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-heading">
            Big Data Processing Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time visualization of chunked splitting, parallel worker mapping, and MapReduce aggregation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Job Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentJob.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : currentJob.status === 'failed'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-primary-tint text-primary border border-indigo-200 animate-pulse'
            }`}
          >
            {currentJob.status}
          </span>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="card-base p-5 sm:p-8 bg-white shadow-soft">
        <StepperProgress
          status={currentJob.status}
          progressPercent={getProgressPercent()}
          stageMessage={currentJob.stage_message}
        />
      </div>

      {/* Live Pipeline Telemetry Stats Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="card-base p-3.5 sm:p-4">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            Lines Processed
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-heading">
            {formatNumber(currentJob.lines_processed || currentJob.total_lines)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
            of {formatNumber(currentJob.total_lines)}
          </div>
        </div>

        <div className="card-base p-3.5 sm:p-4">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-sky" />
            Throughput
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-heading">
            {formatNumber(parseInt(currentJob.lines_per_second || 0))}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">lines / sec</div>
        </div>

        <div className="card-base p-3.5 sm:p-4">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            Partitions
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-heading">{chunksCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">16 MB byte splits</div>
        </div>

        <div className="card-base p-3.5 sm:p-4">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            Workers
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-heading">
            {currentJob.workers_used} Cores
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 capitalize">{currentJob.engine}</div>
        </div>

        <div className="card-base p-3.5 sm:p-4 col-span-2 sm:col-span-1">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Duration
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-heading">
            {currentJob.parse_time_seconds ? `${currentJob.parse_time_seconds.toFixed(2)}s` : '0.00s'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Elapsed time</div>
        </div>
      </div>

      {/* Visual Big Data Architecture Diagram */}
      <div className="card-base p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-heading mb-1">Big Data Flow & Architecture</h3>
        <p className="text-xs text-slate-400 mb-4 sm:mb-6">
          How LogLense processes very large files without loading them fully into memory
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-primary flex items-center justify-center font-bold text-xs mb-3">
              01
            </div>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider">Chunked Reader</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Calculates byte boundaries and scans for the next newline byte. Zero buffer waste.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky flex items-center justify-center font-bold text-xs mb-3">
              02
            </div>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider">Parallel Map Workers</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {currentJob.workers_used} independent Python multiprocessing workers parse regex and build local counters.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs mb-3">
              03
            </div>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider">Group & Summarize</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Combines counts from all workers, merges minute-by-minute traffic, and calculates error percentages.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mb-3">
              04
            </div>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider">Storage & Analytics</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Persists executive KPIs and indexed anomaly samples to SQLite for millisecond query retrieval.
            </p>
          </div>
        </div>
      </div>

      {/* Live Pipeline Terminal / Activity Log */}
      <div className="card-base p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-bold text-heading">Pipeline Activity Stream</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-400">STDERR / STDOUT</span>
        </div>

        <div className="bg-slate-900 rounded-xl p-3.5 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-200 space-y-1.5 overflow-x-auto max-h-60 overflow-y-auto">
          <div className="text-slate-400">[SYSTEM] Initialized LogLense Big Data Pipeline engine</div>
          <div className="text-emerald-400">[INPUT] File registered: {currentJob.filename} ({formatBytes(currentJob.file_size_bytes)})</div>
          <div className="text-sky-400">[SPLIT] Segmented into {chunksCount} newline-aligned chunks of 16MB</div>
          <div className="text-indigo-400">[MAP] Forked {currentJob.workers_used} multiprocessing worker daemons</div>
          <div className="text-slate-300">[MAP] Parallel parser throughput reached {formatNumber(parseInt(currentJob.lines_per_second || 0))} lines/sec</div>
          <div className="text-amber-400">[REDUCE] Merged local worker counters in O(1) memory footprint</div>
          <div className="text-sky-300">[ISSUES] Scanned for failed logins, 404 scans, server crashes & traffic spikes</div>
          <div className="text-emerald-300 font-semibold">[STORE] Completed job execution in {currentJob.parse_time_seconds.toFixed(2)}s</div>
        </div>
      </div>
    </div>
  );
}

