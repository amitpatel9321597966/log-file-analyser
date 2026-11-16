import React from 'react';

export function StatusBadge({ status }) {
  if (status === null || status === undefined) return null;

  const code = parseInt(status, 10);
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (!isNaN(code)) {
    if (code >= 200 && code < 300) {
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (code >= 300 && code < 400) {
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (code >= 400 && code < 500) {
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (code >= 500) {
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${bg}`}>
      {status}
    </span>
  );
}

export function LevelBadge({ level }) {
  if (!level) return null;
  const l = level.toUpperCase();
  let bg = 'bg-slate-100 text-slate-600 border-slate-200';

  if (l === 'INFO') {
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (l === 'WARN' || l === 'WARNING') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (l === 'ERROR' || l === 'CRITICAL' || l === 'FATAL') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (l === 'DEBUG') {
    bg = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${bg}`}>
      {level}
    </span>
  );
}

