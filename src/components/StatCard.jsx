import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function StatCard({
  title,
  value,
  numericValue,
  unit = '',
  icon: Icon,
  trend,
  trendPositive,
  trendLabel,
  description,
  accentColor = 'indigo',
}) {
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    if (typeof numericValue === 'number') {
      const duration = 800; // ms
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Ease out quadratic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(numericValue * easeOut);
        setDisplayNum(currentVal);

        if (currentStep >= steps) {
          setDisplayNum(numericValue);
          clearInterval(timer);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [numericValue]);

  const colorStyles = {
    indigo: {
      card: 'bg-gradient-to-br from-white via-indigo-50/30 to-indigo-100/40 border-indigo-200/80 shadow-sm shadow-indigo-100/50',
      icon: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
    },
    sky: {
      card: 'bg-gradient-to-br from-white via-sky-50/30 to-sky-100/40 border-sky-200/80 shadow-sm shadow-sky-100/50',
      icon: 'bg-sky-500 text-white shadow-md shadow-sky-200',
    },
    violet: {
      card: 'bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40 border-purple-200/80 shadow-sm shadow-purple-100/50',
      icon: 'bg-purple-600 text-white shadow-md shadow-purple-200',
    },
    emerald: {
      card: 'bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/40 border-emerald-200/80 shadow-sm shadow-emerald-100/50',
      icon: 'bg-emerald-600 text-white shadow-md shadow-emerald-200',
    },
    rose: {
      card: 'bg-gradient-to-br from-white via-rose-50/30 to-rose-100/40 border-rose-200/80 shadow-sm shadow-rose-100/50',
      icon: 'bg-rose-600 text-white shadow-md shadow-rose-200',
    },
    amber: {
      card: 'bg-gradient-to-br from-white via-amber-50/30 to-amber-100/40 border-amber-200/80 shadow-sm shadow-amber-100/50',
      icon: 'bg-amber-500 text-white shadow-md shadow-amber-200',
    },
  };

  const style = colorStyles[accentColor] || colorStyles.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card-base p-4 sm:p-6 transition-all duration-200 hover:shadow-soft-lg group ${style.card}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs sm:text-sm font-semibold text-slate-600 tracking-tight truncate">{title}</span>
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-xl ${style.icon} shrink-0 transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
          </div>
        )}
      </div>

      <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5">
        <span className="text-xl sm:text-3xl font-bold tracking-tight text-heading truncate">
          {typeof numericValue === 'number' ? displayNum.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs sm:text-sm font-semibold text-slate-500">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md font-medium text-[11px] ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend}
            </span>
            {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
          </div>
        ) : (
          description && <span className="text-slate-400">{description}</span>
        )}
      </div>
    </motion.div>
  );
}

