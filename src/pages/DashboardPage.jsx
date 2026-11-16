import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Users,
  AlertTriangle,
  HardDrive,
  Download,
  FileSpreadsheet,
  Clock,
  Cpu,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useJob } from '../hooks/useJobContext';
import { StatCard } from '../components/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge, LevelBadge } from '../components/StatusBadge';
import { API_BASE } from '../lib/api';
import { formatBytes, formatNumber, formatDuration } from '../lib/utils';

export function DashboardPage() {
  const { currentJob, loading, refreshJobs } = useJob();
  const [timeView, setTimeView] = useState('minutes'); // 'minutes' or 'hours'
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <ChartSkeleton height="h-80" />
      </div>
    );
  }

  if (!currentJob) {
    return (
      <EmptyState
        title="No Log Analysis Available"
        description="Select an existing job from history, upload a new log file, or generate realistic benchmark data."
        actionLabel="Start New Analysis"
        actionHref="/upload"
      />
    );
  }

  const metrics = currentJob.metrics || {};
  const statusCodes = metrics.status_codes || {};
  const topIps = metrics.top_ips || [];
  const topUrls = metrics.top_urls || [];
  const logLevels = metrics.log_levels || {};
  const timeSeries = timeView === 'minutes' ? (metrics.time_series_minutes || []) : (metrics.time_series_hours || []);
  const anomalies = currentJob.anomalies || [];

  // Donut chart status code groups
  const statusGroups = [
    { name: '2xx (Success)', value: 0, color: '#10B981' },
    { name: '3xx (Redirect)', value: 0, color: '#0EA5E9' },
    { name: '4xx (Client Error)', value: 0, color: '#F59E0B' },
    { name: '5xx (Server Error)', value: 0, color: '#F43F5E' },
  ];

  Object.entries(statusCodes).forEach(([code, count]) => {
    const c = parseInt(code, 10);
    if (c >= 200 && c < 300) statusGroups[0].value += count;
    else if (c >= 300 && c < 400) statusGroups[1].value += count;
    else if (c >= 400 && c < 500) statusGroups[2].value += count;
    else if (c >= 500) statusGroups[3].value += count;
  });

  const activeStatusGroups = statusGroups.filter(g => g.value > 0);

  // Log Levels breakdown
  const totalLevels = Object.values(logLevels).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Banner: Processed in X sec using N workers & Actions */}
      <div className="card-base p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold shrink-0">
            <Cpu className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-heading">
                Processed in {currentJob.parse_time_seconds.toFixed(2)}s using {currentJob.workers_used} workers
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-indigo-50 text-primary border border-indigo-200 uppercase">
                {currentJob.engine}
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Throughput: <span className="font-semibold text-slate-700">{formatNumber(parseInt(currentJob.lines_per_second))} lines/sec</span> &bull; File: <span className="font-mono text-slate-600">{currentJob.filename}</span> ({formatBytes(currentJob.file_size_bytes)})
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href={`${API_BASE}/jobs/${currentJob.id}/export/csv`}
            download
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-subtle min-h-[44px] tap-target"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </a>
          <a
            href={`${API_BASE}/jobs/${currentJob.id}/export/pdf`}
            download
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-subtle min-h-[44px] tap-target"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export PDF</span>
          </a>
        </div>
      </div>

      {/* 4 KPI Cards: 1 col under 380px, 2 cols on mobile/tablet, 4 cols on desktop */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Total Requests"
          numericValue={currentJob.total_lines}
          icon={Activity}
          accentColor="indigo"
          trend="100% Parsed"
          trendPositive={true}
          trendLabel="splits"
        />
        <StatCard
          title="Unique IP Clients"
          numericValue={currentJob.unique_ips}
          icon={Users}
          accentColor="violet"
          description="Client hosts"
        />
        <StatCard
          title="Overall Error Rate"
          value={`${currentJob.error_rate}%`}
          icon={AlertTriangle}
          accentColor={currentJob.error_rate > 5 ? "rose" : "emerald"}
          trend={currentJob.error_rate > 5 ? "Elevated" : "Normal"}
          trendPositive={currentJob.error_rate <= 5}
          trendLabel="4xx/5xx"
        />
        <StatCard
          title="Total Bandwidth"
          value={formatBytes(currentJob.total_bytes)}
          icon={HardDrive}
          accentColor="emerald"
          description={`${formatNumber(currentJob.total_bytes)} bytes`}
        />
      </div>

      {/* Main Traffic Over Time Area Chart */}
      <div className="card-base p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-heading">Traffic Distribution Over Time</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Requests and server error patterns across time buckets</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeView('minutes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all tap-target ${
                timeView === 'minutes'
                  ? 'bg-white text-primary shadow-subtle'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Minutes
            </button>
            <button
              onClick={() => setTimeView('hours')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all tap-target ${
                timeView === 'hours'
                  ? 'bg-white text-primary shadow-subtle'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Hourly
            </button>
          </div>
        </div>

        <div className="h-[220px] sm:h-72 w-full">
          {timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="errGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey={timeView === 'minutes' ? 'time' : 'hour'}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => val ? val.slice(11) : ''}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-soft-lg border border-slate-200 text-xs">
                          <div className="font-semibold text-heading mb-1.5">{data.time || data.hour}</div>
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span>Total Requests: {data.requests?.toLocaleString()}</span>
                          </div>
                          {data.errors > 0 && (
                            <div className="flex items-center gap-2 text-rose-600 font-medium mt-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <span>Errors: {data.errors?.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#reqGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stroke="#F43F5E"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#errGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No time-series data available.
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Status Code Donut Chart + Log Level Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart (Status Codes) */}
        <div className="card-base p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-heading">HTTP Status Codes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Response code categories</p>
          </div>

          <div className="h-52 my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeStatusGroups}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activeStatusGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatNumber(val), 'Requests']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-xl font-bold text-heading block">
                {currentJob.total_lines > 0 ? `${(100 - currentJob.error_rate).toFixed(1)}%` : '100%'}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Success</span>
            </div>
          </div>

          {/* Custom Status Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {activeStatusGroups.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-heading ml-auto font-mono text-[11px]">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Log Levels Breakdown & Most Error-Prone Endpoints (2 Cols) */}
        <div className="lg:col-span-2 card-base p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-heading">Log Level Distribution & Reliability</h3>
                <p className="text-xs text-slate-400 mt-0.5">Categorization into INFO, WARN, and ERROR severity</p>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex mb-4 border border-slate-200">
              {Object.entries(logLevels).map(([level, count]) => {
                const pct = (count / totalLevels) * 100;
                if (pct <= 0) return null;
                const color = level === 'ERROR' ? 'bg-rose-500' : (level === 'WARN' ? 'bg-amber-400' : 'bg-primary');
                return (
                  <div
                    key={level}
                    className={`h-full ${color} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                    title={`${level}: ${formatNumber(count)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Level Pills */}
            <div className="flex flex-wrap gap-4 text-xs font-medium pb-4 border-b border-slate-100">
              {Object.entries(logLevels).map(([level, count]) => {
                const pct = ((count / totalLevels) * 100).toFixed(1);
                return (
                  <div key={level} className="flex items-center gap-2">
                    <LevelBadge level={level} />
                    <span className="text-slate-600 font-mono">{formatNumber(count)}</span>
                    <span className="text-slate-400">({pct}%)</span>
                  </div>
                );
              })}
            </div>

            {/* Most Error-Prone Endpoints Mini Table */}
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Most Error-Prone Endpoints
              </div>
              <div className="divide-y divide-slate-100 overflow-hidden">
                {(metrics.error_endpoints || []).slice(0, 4).map((ep, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-800 font-medium truncate max-w-sm">{ep.endpoint}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-600 font-bold">{ep.error_count} errors</span>
                      <span className="text-slate-400">({ep.error_rate}% fail)</span>
                    </div>
                  </div>
                ))}
                {(!metrics.error_endpoints || metrics.error_endpoints.length === 0) && (
                  <div className="py-2 text-xs text-slate-400">No error-prone endpoints found.</div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => navigate('/explorer?status=5xx')}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>Inspect Error Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top 10 URLs and Top 10 IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top URLs */}
        <div className="card-base p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-heading">Top 10 Requested URLs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Highest traffic endpoints by hit count</p>
            </div>
            <button
              onClick={() => navigate('/explorer')}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 tap-target min-h-[44px]"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topUrls.slice(0, 7).map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-mono text-slate-700 font-medium truncate max-w-[160px] min-[400px]:max-w-[220px] sm:max-w-xs md:max-w-md">
                    {item.url}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-heading font-mono">{formatNumber(item.count)}</span>
                    <span className="text-slate-400 text-[11px]">({item.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.percent * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top IPs */}
        <div className="card-base p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-heading">Top 10 Client IP Addresses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most active IP hosts generating traffic</p>
            </div>
            <button
              onClick={() => navigate('/explorer')}
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 tap-target min-h-[44px]"
            >
              <span>Filter IPs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topIps.slice(0, 7).map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-mono text-slate-700 font-medium truncate">
                    {item.ip}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-heading font-mono">{formatNumber(item.count)}</span>
                    <span className="text-slate-400 text-[11px]">({item.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.percent * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Detected Anomalies Preview Bar */}
      {anomalies.length > 0 && (
        <div className="card-base p-4 sm:p-6 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-base font-bold text-heading">
                  Detected Problems & Security Issues ({anomalies.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Traffic spikes, repeated failed logins, 404 scans, and server errors
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/anomalies')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <span>View All Issues</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anomalies.slice(0, 4).map((anom, i) => (
              <div
                key={i}
                onClick={() => navigate('/anomalies')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-heading truncate">{anom.title}</span>
                  <SeverityBadge severity={anom.severity} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {anom.explanation}
                </p>
                {anom.ip && (
                  <div className="mt-2 text-[11px] font-mono text-slate-400">
                    Host: <span className="font-semibold text-slate-600">{anom.ip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

