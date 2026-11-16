import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ShieldAlert, Globe, Clock, Terminal, HardDrive } from 'lucide-react';
import { StatusBadge, LevelBadge } from './StatusBadge';
import { formatBytes } from '../lib/utils';

export function LogDrawer({ record, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(record.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        />

        {/* ============================================================ */}
        {/* 1. MOBILE BOTTOM SHEET (< sm)                                */}
        {/* ============================================================ */}
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-10 flex flex-col justify-end pointer-events-none">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col pointer-events-auto border-t border-slate-200 safe-bottom overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Mobile Sheet Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  Line #{record.line_number}
                </span>
                <StatusBadge status={record.status} />
                <LevelBadge level={record.level} />
              </div>
              <button
                onClick={onClose}
                className="tap-target -mr-2 text-slate-400 hover:text-slate-600 rounded-xl"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Endpoint */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Request Endpoint
                </div>
                <div className="font-mono text-xs">
                  <span className="font-bold text-primary mr-1.5">{record.method || 'GET'}</span>
                  <span className="text-heading break-all font-medium">{record.url || '/'}</span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Timestamp
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading truncate">
                    {record.timestamp || '-'}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    Client IP
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading truncate">
                    {record.ip || '-'}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                    <HardDrive className="w-3 h-3 text-slate-400" />
                    Bandwidth
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading truncate">
                    {formatBytes(record.bytes)}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    Status
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading">
                    HTTP {record.status}
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  User Agent
                </div>
                <div className="font-mono text-[11px] text-slate-600 break-all leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {record.user_agent || '-'}
                </div>
              </div>

              {/* Raw Log Line */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Raw Log Line
                  </div>
                  <button
                    onClick={handleCopyRaw}
                    className="tap-target inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover min-h-[44px]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Raw
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-100 bg-slate-900 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap break-all leading-relaxed border border-slate-800">
                  {record.raw}
                </pre>
              </div>
            </div>

            {/* Mobile Sheet Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-subtle min-h-[44px] tap-target"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* 2. TABLET & DESKTOP SLIDE-OVER DRAWER (>= sm)                */}
        {/* ============================================================ */}
        <div className="hidden sm:flex fixed inset-y-0 right-0 max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-slate-500">
                  Line #{record.line_number}
                </span>
                <StatusBadge status={record.status} />
                <LevelBadge level={record.level} />
                {record.is_anomaly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Anomaly
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="tap-target p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* URL & Method Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Request Endpoint
                </div>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="font-bold text-primary">{record.method || 'GET'}</span>
                  <span className="text-heading break-all font-medium">{record.url || '/'}</span>
                </div>
              </div>

              {/* Parsed Attributes Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Timestamp
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading truncate">
                    {record.timestamp || '-'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Client IP Address
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading truncate">
                    {record.ip || '-'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    Bandwidth / Bytes
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading truncate">
                    {formatBytes(record.bytes)} ({record.bytes?.toLocaleString()} B)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    Status Code
                  </div>
                  <div className="font-mono text-xs font-semibold text-heading">
                    HTTP {record.status}
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-subtle">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  User Agent
                </div>
                <div className="font-mono text-xs text-slate-600 break-all leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {record.user_agent || '-'}
                </div>
              </div>

              {/* Raw Log Line */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Raw Log Line
                  </div>
                  <button
                    onClick={handleCopyRaw}
                    className="tap-target inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Raw
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-[12px] text-slate-100 bg-slate-900 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap break-all leading-relaxed border border-slate-800">
                  {record.raw}
                </pre>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={onClose}
                className="tap-target px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-subtle"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
