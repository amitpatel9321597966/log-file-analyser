import React from 'react';

export function SeverityBadge({ severity }) {
  const s = (severity || 'Medium').toLowerCase();

  const configs = {
    critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Critical',
    },
    high: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
      label: 'High',
    },
    medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Medium',
    },
    low: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-500',
      label: 'Low',
    },
  };

  const current = configs[s] || configs.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse-subtle`} />
      {current.label}
    </span>
  );
}

