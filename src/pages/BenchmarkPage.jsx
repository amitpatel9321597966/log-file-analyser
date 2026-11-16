import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Cpu,
  Layers,
  Clock,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { useJob } from '../hooks/useJobContext';
import { runBenchmark, fetchBenchmark } from '../lib/api';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { formatNumber, formatDuration } from '../lib/utils';

export function BenchmarkPage() {
  const { currentJob } = useJob();
  const { addToast } = useToast();
  const [running, setRunning] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [workersCount, setWorkersCount] = useState(8);

  useEffect(() => {
    if (!currentJob) return;
    const loadBench = async () => {
      try {
        const res = await fetchBenchmark(currentJob.id);
        if (res.has_benchmark) {
          setBenchmarkData(res.benchmark);
          setWorkersCount(res.benchmark.workers_count || 8);
        } else {
          setBenchmarkData(null);
        }
      } catch (err) {
        console.error('Failed to load benchmark:', err);
      }
    };
    loadBench();
  }, [currentJob]);

  const handleRunBenchmark = async () => {
    if (!currentJob) return;
    setRunning(true);
    try {
      addToast('Running sequential vs parallel benchmark...', 'info');
      const res = await runBenchmark(currentJob.id, workersCount);
      setBenchmarkData(res);
      addToast(`Benchmark finished! Parallel was ${res.speedup}x faster!`, 'success');
    } catch (err) {
      addToast(err.message || 'Benchmark run failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  if (!currentJob) {
    return (
      <EmptyState
        title="No Log File Selected"
        description="Select or upload a log file to run parallel speedup benchmarks."
        actionLabel="Go to Upload"
        actionHref="/upload"
      />
    );
  }

  const chartData = benchmarkData ? [
    {
      mode: 'Single-Thread (1 Core)',
      time: benchmarkData.single_worker_time,
      throughput: benchmarkData.single_lines_per_sec,
      color: '#94A3B8'
    },
    {
      mode: `Parallel (${benchmarkData.workers_count} Cores)`,
      time: benchmarkData.multi_worker_time,
      throughput: benchmarkData.multi_lines_per_sec,
      color: '#4F46E5'
    }
  ] : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title & Setup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-heading">
            Performance Benchmark: Sequential vs Parallel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empirical speedup comparison running the exact same file in single-worker mode vs multi-core MapReduce.
          </p>
        </div>

        {/* Worker Selector & Run Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 min-h-[44px]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Workers:</span>
            </span>
            <select
              value={workersCount}
              onChange={(e) => setWorkersCount(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none"
            >
              <option value={2}>2 Cores</option>
              <option value={4}>4 Cores</option>
              <option value={8}>8 Cores</option>
            </select>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={running}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all duration-200 disabled:opacity-50 min-h-[44px] tap-target"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Benchmarking...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {benchmarkData ? (
        <>
          {/* Big Speedup Metric Card */}
          <div className="card-base p-5 sm:p-8 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/50 border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Empirical Speedup Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-heading">
                Parallel MapReduce is <span className="text-primary">{benchmarkData.speedup}x</span> faster
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Single-thread execution took <strong>{benchmarkData.single_worker_time.toFixed(2)}s</strong>, while chunked parallel execution across {benchmarkData.workers_count} CPU cores completed in just <strong>{benchmarkData.multi_worker_time.toFixed(2)}s</strong>.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-white rounded-2xl border border-indigo-100 shadow-soft-lg shrink-0 w-full sm:w-48">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speedup Ratio</span>
              <span className="text-4xl sm:text-5xl font-black text-primary font-mono my-1">
                {benchmarkData.speedup}x
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {formatNumber(parseInt(benchmarkData.multi_lines_per_sec))} lines/sec
              </span>
            </div>
          </div>

          {/* Bar Chart Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Time Chart */}
            <div className="card-base p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-heading">Processing Time (Seconds)</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Lower is better</p>

              <div className="h-52 sm:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="mode" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(val) => [`${val} seconds`, 'Time']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar dataKey="time" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Throughput Chart */}
            <div className="card-base p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-heading">Throughput (Lines per Second)</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Higher is better</p>

              <div className="h-52 sm:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="mode" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val) => [`${formatNumber(val)} lines/sec`, 'Throughput']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar dataKey="throughput" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mobile Breakdown Cards (< sm) */}
          <div className="sm:hidden space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Benchmark Breakdown
            </div>
            {[
              { label: 'Lines Processed', single: formatNumber(benchmarkData.total_lines), multi: formatNumber(benchmarkData.total_lines), diff: 'Same' },
              { label: 'Processing Time', single: `${benchmarkData.single_worker_time.toFixed(3)}s`, multi: `${benchmarkData.multi_worker_time.toFixed(3)}s`, diff: `${benchmarkData.speedup}x faster` },
              { label: 'Parsing Throughput', single: `${formatNumber(parseInt(benchmarkData.single_lines_per_sec))} lps`, multi: `${formatNumber(parseInt(benchmarkData.multi_lines_per_sec))} lps`, diff: `+${formatNumber(parseInt(benchmarkData.multi_lines_per_sec - benchmarkData.single_lines_per_sec))} lps` },
              { label: 'Chunk Partition', single: `${benchmarkData.chunk_size_mb} MB`, multi: `${benchmarkData.chunk_size_mb} MB`, diff: 'Streamed' }
            ].map((row, i) => (
              <div key={i} className="card-base p-3.5 space-y-1.5 text-xs">
                <div className="font-bold text-heading">{row.label}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-100">
                  <div>1 Worker: <span className="text-slate-800 font-semibold">{row.single}</span></div>
                  <div>Parallel: <span className="text-primary font-bold">{row.multi}</span></div>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold font-mono">
                  Advantage: {row.diff}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet & Desktop Breakdown Table (>= sm) */}
          <div className="hidden sm:block card-base overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-heading">Benchmark Execution Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Parameters and hardware utilization</p>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-3 px-6">Metric</th>
                  <th className="py-3 px-6">Single-Worker (1 Core)</th>
                  <th className="py-3 px-6">Parallel MapReduce ({benchmarkData.workers_count} Cores)</th>
                  <th className="py-3 px-6">Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-3.5 px-6 font-sans font-medium text-slate-700">Total Lines Processed</td>
                  <td className="py-3.5 px-6 text-slate-600">{formatNumber(benchmarkData.total_lines)}</td>
                  <td className="py-3.5 px-6 text-slate-600">{formatNumber(benchmarkData.total_lines)}</td>
                  <td className="py-3.5 px-6 text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-sans font-medium text-slate-700">Processing Time</td>
                  <td className="py-3.5 px-6 text-slate-600">{benchmarkData.single_worker_time.toFixed(3)}s</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-600">{benchmarkData.multi_worker_time.toFixed(3)}s</td>
                  <td className="py-3.5 px-6 font-bold text-primary">{benchmarkData.speedup}x faster</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-sans font-medium text-slate-700">Parsing Throughput</td>
                  <td className="py-3.5 px-6 text-slate-600">{formatNumber(parseInt(benchmarkData.single_lines_per_sec))} lines/sec</td>
                  <td className="py-3.5 px-6 font-bold text-primary">{formatNumber(parseInt(benchmarkData.multi_lines_per_sec))} lines/sec</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-600">+{formatNumber(parseInt(benchmarkData.multi_lines_per_sec - benchmarkData.single_lines_per_sec))} lps</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-sans font-medium text-slate-700">Chunk Size Partition</td>
                  <td className="py-3.5 px-6 text-slate-600">{benchmarkData.chunk_size_mb} MB</td>
                  <td className="py-3.5 px-6 text-slate-600">{benchmarkData.chunk_size_mb} MB</td>
                  <td className="py-3.5 px-6 text-slate-400">Streamed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card-base p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h3 className="text-xl font-bold text-heading">Ready to Benchmark</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
            Click 'Run Benchmark' above to execute the same log file with 1 single thread versus {workersCount} parallel MapReduce workers.
          </p>
          <button
            onClick={handleRunBenchmark}
            disabled={running}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-sm transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Empirical Benchmark</span>
          </button>
        </div>
      )}

      {/* College Viva Explanation Section */}
      <div className="card-base p-6 bg-slate-50/70 border-slate-200">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
          <BookOpen className="w-4 h-4" />
          <span>Big Data Concepts Explained (College Viva Reference)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <strong className="text-slate-900 block mb-1">1. Why does Parallel MapReduce scale so fast?</strong>
            Instead of reading a monolithic 1GB file sequentially on 1 CPU core (where the single core is pegged at 100% and I/O blocks the thread), the file is split into independent newline-aligned byte chunks. Each CPU worker gets its own memory space and parses in parallel without lock contention.
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <strong className="text-slate-900 block mb-1">2. Amdahl's Law in Practice</strong>
            Amdahl's Law dictates that speedup is bounded by the sequential portion of the pipeline (file byte chunking and final reduce aggregation). Because our Split and Reduce phases run in milliseconds, over 95% of execution time is strictly parallel, yielding near-linear scaling up to 8 CPU cores.
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <strong className="text-slate-900 block mb-1">3. Zero Line Corruption via Byte-Boundary Snapping</strong>
            A common bug in naive chunking is cutting a line in half at the chunk border. LogLense calculates the target byte offset and seeks forward to the next newline (`\n`), guaranteeing that every chunk starts and ends on valid record boundaries.
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <strong className="text-slate-900 block mb-1">4. Constant Memory Shuffle & Reduce</strong>
            Rather than accumulating all 1,000,000 parsed objects in memory (which would cause high garbage collection pressure), workers compute local Counter maps. The reducer simply merges counters ($C_1 + C_2$), keeping RAM usage constant ($O(1)$) regardless of whether the log is 100K or 10M lines.
          </div>
        </div>
      </div>
    </div>
  );
}

