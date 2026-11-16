import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Search,
  Clock,
  Globe,
  ExternalLink,
  Info,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useJob } from '../hooks/useJobContext';
import { fetchJobAnomalies } from '../lib/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { EmptyState } from '../components/EmptyState';

export function AnomaliesPage() {
  const { currentJob } = useJob();
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [anomalyData, setAnomalyData] = useState({ counts: {}, anomalies: [], timeline_markers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentJob) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchJobAnomalies(currentJob.id, selectedSeverity);
        setAnomalyData(res);
      } catch (err) {
        console.error('Failed to fetch anomalies:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentJob, selectedSeverity]);

  if (!currentJob) {
    return (
      <EmptyState
        title="No Anomaly Report"
        description="Select or run a log analysis to discover traffic spikes, brute-force attacks, and error bursts."
        actionLabel="Go to Upload"
        actionHref="/upload"
      />
    );
  }

  const counts = anomalyData.counts || { Total: 0, Critical: 0, High: 0, Medium: 0, Low: 0 };
  const anomalies = anomalyData.anomalies || [];
  const markers = anomalyData.timeline_markers || [];

  // Convert timeline markers to chart coordinates
  const timelineChartData = markers.map((m, idx) => ({
    x: idx + 1,
    time: m.time,
    title: m.title,
    severity: m.severity,
    count: m.count,
    y: m.severity === 'Critical' ? 4 : (m.severity === 'High' ? 3 : (m.severity === 'Medium' ? 2 : 1))
  }));

  const getSeverityIcon = (type) => {
    if (type === 'traffic_spike') return Flame;
    if (type === 'brute_force') return ShieldAlert;
    if (type === 'scanner_404') return Search;
    return AlertTriangle;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-heading">
          Detected Problems & Security Issues
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Scanned issues in{' '}
          <span className="font-mono text-slate-700 font-semibold">{currentJob.filename}</span>:
          {' '}traffic spikes, failed logins, 404 scans, and server errors.
        </p>
      </div>

      {/* Summary Chips by Severity: Scroll horizontally on mobile */}
      <div className="flex sm:grid sm:grid-cols-5 gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { key: 'All', label: 'All Anomalies', count: counts.Total || 0, color: 'border-slate-300 text-slate-700' },
          { key: 'Critical', label: 'Critical', count: counts.Critical || 0, color: 'border-rose-200 bg-rose-50 text-rose-700' },
          { key: 'High', label: 'High', count: counts.High || 0, color: 'border-orange-200 bg-orange-50 text-orange-700' },
          { key: 'Medium', label: 'Medium', count: counts.Medium || 0, color: 'border-amber-200 bg-amber-50 text-amber-700' },
          { key: 'Low', label: 'Low', count: counts.Low || 0, color: 'border-sky-200 bg-sky-50 text-sky-700' },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setSelectedSeverity(chip.key)}
            className={`min-w-[125px] sm:min-w-0 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all duration-150 shrink-0 sm:shrink tap-target ${
              selectedSeverity === chip.key
                ? 'ring-2 ring-primary ring-offset-1 border-primary bg-white shadow-soft'
                : 'bg-white hover:bg-slate-50 border-slate-200 shadow-subtle'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{chip.label}</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-heading mt-0.5 sm:mt-1">{chip.count}</div>
          </button>
        ))}
      </div>

      {/* Timeline Chart with Markers */}
      {timelineChartData.length > 0 && (
        <div className="card-base p-4 sm:p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-heading">Anomaly Timeline Sequence</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Chronological occurrence and severity distribution</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="h-44 min-w-[420px] sm:min-w-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="x" name="Sequence" tick={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis
                    dataKey="y"
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(val) => val === 4 ? 'Crit' : (val === 3 ? 'High' : (val === 2 ? 'Med' : 'Low'))}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-soft-lg border border-slate-200 text-xs">
                            <div className="font-bold text-heading">{d.title}</div>
                            <div className="text-slate-500 mt-1">Severity: <span className="font-semibold text-rose-600">{d.severity}</span></div>
                            {d.time && <div className="text-slate-400 mt-0.5">Time: {d.time}</div>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    data={timelineChartData}
                    fill="#4F46E5"
                    shape={(props) => {
                      const { cx, cy, payload } = props;
                      const fill = payload.severity === 'Critical' ? '#F43F5E' : (payload.severity === 'High' ? '#F97316' : '#F59E0B');
                      return (
                        <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#FFFFFF" strokeWidth={2} />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {anomalies.length === 0 ? (
          <EmptyState
            icon={Info}
            title="No Threats Found"
            description={`No anomalies found under '${selectedSeverity}' severity filter.`}
            actionLabel="Show All Anomalies"
            onAction={() => setSelectedSeverity('All')}
          />
        ) : (
          anomalies.map((item) => {
            const Icon = getSeverityIcon(item.type);
            const isCrit = item.severity === 'Critical';

            return (
              <div
                key={item.id}
                className={`card-base p-4 sm:p-6 transition-all duration-200 hover:shadow-soft-lg ${
                  isCrit ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-amber-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                        isCrit ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-heading">{item.title}</h3>
                        <SeverityBadge severity={item.severity} />
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
                        {item.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Filters */}
                  <div className="flex sm:flex-col items-stretch sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
                    <button
                      onClick={() => {
                        const targetParam = item.ip ? `ip=${encodeURIComponent(item.ip)}` : 'only_anomalies=true';
                        navigate(`/explorer?${targetParam}`);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-primary hover:bg-primary-tint transition-colors shadow-subtle min-h-[44px] tap-target"
                    >
                      <span>View in Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                  {item.ip && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Offending IP: <strong className="text-slate-700">{item.ip}</strong></span>
                    </div>
                  )}
                  {item.timestamp && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Window: <strong className="text-slate-700">{item.timestamp}</strong></span>
                    </div>
                  )}
                  {item.affected_endpoint && (
                    <div className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target: <strong className="text-slate-700">{item.affected_endpoint}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

