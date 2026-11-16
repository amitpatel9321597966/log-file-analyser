import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Scissors, Cpu, Shuffle, Database } from 'lucide-react';

export function StepperProgress({ status, progressPercent = 0, stageMessage = "" }) {
  const steps = [
    { id: 'splitting', name: 'Split', desc: 'Chunk Byte Offsets', icon: Scissors },
    { id: 'mapping', name: 'Map', desc: 'Parallel Parsing', icon: Cpu },
    { id: 'reducing', name: 'Reduce', desc: 'Shuffle & Aggregate', icon: Shuffle },
    { id: 'storing', name: 'Store', desc: 'Index & Persist', icon: Database },
  ];

  const getStepState = (stepId, index) => {
    const statusOrder = ['pending', 'splitting', 'mapping', 'reducing', 'storing', 'completed'];
    const currentIdx = statusOrder.indexOf(status);
    const stepTargetIdx = index + 1; // 1 for splitting, 2 for mapping, etc.

    if (status === 'completed') return 'completed';
    if (status === 'failed') return currentIdx >= stepTargetIdx ? 'failed' : 'upcoming';
    if (currentIdx > stepTargetIdx) return 'completed';
    if (currentIdx === stepTargetIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="w-full">
      {/* 1. HORIZONTAL STEPPER (Tablet & Desktop >= sm) */}
      <div className="hidden sm:block relative">
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const state = getStepState(step.id, idx);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    state === 'completed'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : state === 'active'
                      ? 'bg-primary text-white ring-4 ring-primary-tint shadow-md shadow-primary/25 animate-pulse'
                      : state === 'failed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : state === 'active' ? (
                    <Icon className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="mt-3">
                  <div
                    className={`text-sm font-bold tracking-tight ${
                      state === 'active'
                        ? 'text-primary'
                        : state === 'completed'
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. VERTICAL STEPPER (Mobile only < sm) */}
      <div className="sm:hidden space-y-4 relative pl-3">
        {steps.map((step, idx) => {
          const state = getStepState(step.id, idx);
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start gap-3.5">
              {/* Connecting vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-px ${
                    state === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : state === 'active'
                    ? 'bg-primary text-white ring-4 ring-primary-tint shadow-sm animate-pulse'
                    : state === 'failed'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {state === 'completed' ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : state === 'active' ? (
                  <Icon className="w-4 h-4 animate-pulse" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step info */}
              <div className="pt-1 min-w-0">
                <div
                  className={`text-sm font-bold leading-tight ${
                    state === 'active'
                      ? 'text-primary'
                      : state === 'completed'
                      ? 'text-heading'
                      : 'text-slate-400'
                  }`}
                >
                  {idx + 1}. {step.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar & Status Text */}
      <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold mb-2 gap-2">
          <span className="text-slate-600 flex items-center gap-2 truncate">
            {status !== 'completed' && status !== 'failed' && (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            )}
            <span className="truncate">{stageMessage || 'Processing pipeline active...'}</span>
          </span>
          <span className="font-mono text-primary font-bold shrink-0">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-sky rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
