import React from 'react';
import { LucideFileSearch, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
  icon: Icon = LucideFileSearch,
  title = "No Data Found",
  description = "No logs or analysis results available yet. Upload a log file or generate synthetic sample data to get started.",
  actionLabel = "New Analysis",
  actionHref = "/upload",
  onAction,
}) {
  return (
    <div className="card-base p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary mb-5 shadow-subtle">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="text-xl font-bold text-heading">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel && (actionHref || onAction)) && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

