import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Download,
  Terminal,
  ExternalLink,
  X,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { useJob } from '../hooks/useJobContext';
import { fetchJobLogs } from '../lib/api';
import { StatusBadge, LevelBadge } from '../components/StatusBadge';
import { LogDrawer } from '../components/LogDrawer';
import { TableSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { formatBytes, formatNumber } from '../lib/utils';

export function ExplorerPage() {
  const { currentJob } = useJob();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ip, setIp] = useState(searchParams.get('ip') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');
  const [onlyAnomalies, setOnlyAnomalies] = useState(searchParams.get('only_anomalies') === 'true');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState('line_number');
  const [sortOrder, setSortOrder] = useState('asc');

  // Data state
  const [logsData, setLogsData] = useState({ total_matching: 0, total_pages: 1, records: [] });
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const activeFiltersCount = [
    Boolean(search),
    Boolean(ip),
    Boolean(status),
    Boolean(level),
    Boolean(onlyAnomalies),
  ].filter(Boolean).length;

  const loadLogs = useCallback(async () => {
    if (!currentJob) return;
    setLoading(true);
    try {
      const res = await fetchJobLogs(currentJob.id, {
        search,
        ip,
        status,
        level,
        only_anomalies: onlyAnomalies,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setLogsData(res);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentJob, search, ip, status, level, onlyAnomalies, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleResetFilters = () => {
    setSearch('');
    setIp('');
    setStatus('');
    setLevel('');
    setOnlyAnomalies(false);
    setPage(1);
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  if (!currentJob) {
    return (
      <EmptyState
        title="No Log Job Selected"
        description="Select or upload a log file to search, filter, and inspect raw entries."
        actionLabel="Go to Upload"
        actionHref="/upload"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-heading">Log Explorer</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate max-w-md">
            Indexed sample records for <span className="font-mono text-slate-700 font-semibold">{currentJob.filename}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-subtle">
            Matching: <span className="text-primary font-mono font-bold">{formatNumber(logsData.total_matching)}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE QUICK BAR (< sm): Search input + "Filters" button     */}
      {/* ============================================================ */}
      <div className="sm:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Quick search..."
            className="w-full pl-9 pr-3 py-2.5 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 shadow-subtle min-h-[44px]"
          />
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className={`tap-target px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 min-h-[44px] transition-colors shadow-subtle ${
            activeFiltersCount > 0
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-slate-700 border-slate-200'
          }`}
          aria-label="Open Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* MOBILE FILTERS BOTTOM SHEET                                  */}
      {/* ============================================================ */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto safe-bottom z-10 animate-in slide-in-from-bottom duration-200 border-t border-slate-200">
            {/* Drag Handle */}
            <div className="flex justify-center -mt-2 mb-2">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-heading">Filter Log Records</span>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="tap-target text-slate-400 hover:text-slate-600 -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Search Keywords</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="URL, message, raw line..."
                  className="w-full px-3 py-2.5 text-base bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client IP Address</label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.10"
                  className="w-full px-3 py-2.5 text-base font-mono bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">HTTP Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">All HTTP Statuses</option>
                  <option value="2xx">2xx Success</option>
                  <option value="3xx">3xx Redirect</option>
                  <option value="4xx">4xx Client Errors</option>
                  <option value="5xx">5xx Server Errors</option>
                  <option value="200">200 OK</option>
                  <option value="401">401 Unauthorized</option>
                  <option value="403">403 Forbidden</option>
                  <option value="404">404 Not Found</option>
                  <option value="500">500 Internal Error</option>
                  <option value="502">502 Bad Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Log Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">All Log Levels</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer font-medium text-slate-700 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={onlyAnomalies}
                  onChange={(e) => setOnlyAnomalies(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                />
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Show Anomalies & Errors only
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 tap-target min-h-[44px]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => { setPage(1); setMobileFilterOpen(false); }}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-bold shadow-sm tap-target min-h-[44px]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TABLET & DESKTOP FILTER BAR (>= sm)                          */}
      {/* ============================================================ */}
      <div className="hidden sm:block card-base p-4 space-y-3 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter by URL, keyword, error message..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400"
            />
          </div>

          {/* Client IP Filter */}
          <div>
            <input
              type="text"
              value={ip}
              onChange={(e) => { setIp(e.target.value); setPage(1); }}
              placeholder="Filter by IP..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 font-mono"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
            >
              <option value="">All HTTP Statuses</option>
              <option value="2xx">2xx Success</option>
              <option value="3xx">3xx Redirect</option>
              <option value="4xx">4xx Client Errors</option>
              <option value="5xx">5xx Server Errors</option>
              <option value="200">200 OK</option>
              <option value="401">401 Unauthorized</option>
              <option value="403">403 Forbidden</option>
              <option value="404">404 Not Found</option>
              <option value="500">500 Internal Error</option>
              <option value="502">502 Bad Gateway</option>
            </select>
          </div>

          {/* Log Level Filter */}
          <div>
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700"
            >
              <option value="">All Log Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>

        {/* Bottom row of filter bar */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
            <input
              type="checkbox"
              checked={onlyAnomalies}
              onChange={(e) => { setOnlyAnomalies(e.target.checked); setPage(1); }}
              className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
            />
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Show Anomalies & Errors only
            </span>
          </label>

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RESULTS LIST: Card list on mobile (< sm), Table on (>= sm)  */}
      {/* ============================================================ */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : logsData.records.length === 0 ? (
        <EmptyState
          title="No Logs Matched Filters"
          description="Try broadening your search query, selecting 'All Statuses', or resetting the filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {/* 1. MOBILE CARD LIST (< sm) */}
          <div className="sm:hidden space-y-2.5">
            {logsData.records.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="card-base p-3.5 hover:bg-slate-50 transition-colors active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-400">
                    #{record.line_number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={record.status} />
                    <LevelBadge level={record.level} />
                    {record.is_anomaly && (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                </div>

                <div className="font-mono text-xs mb-1.5 truncate text-slate-800">
                  <span className="font-bold text-primary mr-1.5">{record.method || 'GET'}</span>
                  <span>{record.url}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1.5 border-t border-slate-100">
                  <span className="truncate">{record.ip}</span>
                  <span className="shrink-0 text-slate-400">
                    {record.timestamp ? record.timestamp.slice(11) : '-'} &bull; {formatBytes(record.bytes)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 2. TABLET & DESKTOP TABLE (>= sm) */}
          <div className="hidden sm:block card-base overflow-hidden">
            <div className="table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 z-20">
                    <th
                      onClick={() => toggleSort('line_number')}
                      className="py-3 px-4 cursor-pointer hover:text-heading select-none w-16 sticky left-0 bg-slate-50 z-20"
                    >
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('timestamp')}
                      className="py-3 px-4 cursor-pointer hover:text-heading select-none w-40 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span>Timestamp</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-28">Status</th>
                    <th className="py-3 px-4 w-20">Method</th>
                    <th className="py-3 px-4">Request Endpoint / URL</th>
                    <th className="py-3 px-4 w-36">Client IP</th>
                    <th className="py-3 px-4 w-24 text-right">Bytes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {logsData.records.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                        {record.line_number}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {record.timestamp || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={record.status} />
                          {record.is_anomaly && (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" title="Flagged anomaly" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-primary">
                          {record.method || 'GET'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 truncate max-w-xs md:max-w-md group-hover:text-primary transition-colors">
                        {record.url}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {record.ip}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-right">
                        {formatBytes(record.bytes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PAGINATION CONTROLS (Responsive)                             */}
          {/* ============================================================ */}
          <div className="card-base sm:card-base-none p-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-white sm:bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[36px]"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <span className="text-slate-400">
                Page <span className="font-bold text-heading">{logsData.page}</span> of{' '}
                <span className="font-bold text-heading">{logsData.total_pages}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-subtle transition-colors tap-target min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(logsData.total_pages, p + 1))}
                disabled={page >= logsData.total_pages}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-subtle transition-colors tap-target min-h-[44px]"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Log Line Detail Slide-Over / Bottom Sheet */}
      <LogDrawer
        record={selectedRecord}
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
