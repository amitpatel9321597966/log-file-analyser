import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Workflow,
  Search,
  AlertTriangle,
  Zap,
  History,
  Settings,
  Menu,
  X,
  Plus,
  Cpu,
  Database,
  ChevronRight,
  HardDrive,
  MoreHorizontal
} from 'lucide-react';
import { useJob } from '../hooks/useJobContext';
import { formatNumber } from '../lib/utils';

export function Layout({ children }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentJob, jobs } = useJob();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Upload', path: '/upload', icon: UploadCloud },
    { label: 'Pipeline', path: '/pipeline', icon: Workflow },
    { label: 'Log Explorer', path: '/explorer', icon: Search },
    { label: 'Anomalies', path: '/anomalies', icon: AlertTriangle, badge: currentJob?.anomalies?.length },
    { label: 'Benchmark', path: '/benchmark', icon: Zap },
    { label: 'History', path: '/history', icon: History, count: jobs?.length },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Close drawer and overlay on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setSearchOverlayOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus search input when search overlay opens
  useEffect(() => {
    if (searchOverlayOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOverlayOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setSearchOverlayOpen(false);
  }, [location.pathname]);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/explorer?search=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
      setSearchOverlayOpen(false);
    }
  };

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    const match = navItems.find((item) => item.path === p);
    return match ? match.label : 'Overview';
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col sm:flex-row antialiased overflow-x-hidden w-full max-w-full">
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (1024px and above) - UNCHANGED            */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-cardBorder flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25">
            <Search className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-heading leading-none">LogLense</div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
              Big Data Log Engine
            </div>
          </div>
        </div>

        {/* Current Active Job Pill */}
        {currentJob && (
          <div className="px-4 pt-4 pb-1 shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                Active Job
              </div>
              <div className="text-xs font-semibold text-heading truncate font-mono" title={currentJob.filename}>
                {currentJob.filename}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span>{formatNumber(currentJob.total_lines)} lines</span>
                <span>&bull;</span>
                <span className="capitalize">{currentJob.engine}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary-tint text-primary'
                    : 'text-slate-600 hover:text-heading hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 stroke-[1.75] transition-colors ${
                      isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">
                    {item.badge}
                  </span>
                )}
                {item.count > 0 && !item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Storage & Status Card */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-heading mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                Parallel Pipeline
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Local Active
              </span>
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              Chunked MapReduce Engine with 8 Cores ready for fast streaming.
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. TABLET COLLAPSED SIDEBAR (640px to 1023px)               */}
      {/* ============================================================ */}
      <aside className="hidden sm:flex lg:hidden w-[72px] bg-white border-r border-cardBorder flex-col items-center shrink-0 min-h-screen sticky top-0 h-screen py-3 z-30">
        {/* Logo Icon */}
        <Link
          to="/"
          className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25 mb-4 shrink-0 tap-target"
          title="LogLense"
        >
          <Search className="w-5 h-5 stroke-[2.2]" />
        </Link>

        {/* Nav Icons */}
        <nav className="flex-1 w-full px-2 space-y-2 flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 tap-target group ${
                  isActive
                    ? 'bg-primary-tint text-primary shadow-subtle'
                    : 'text-slate-500 hover:text-heading hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 stroke-[1.75] ${isActive ? 'text-primary' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
                {/* Tooltip on hover */}
                <span className="absolute left-14 px-2 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Hamburger to open full drawer on tablet if needed */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-heading transition-colors tap-target shrink-0"
          title="Open Full Menu"
          aria-label="Open Full Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </aside>

      {/* ============================================================ */}
      {/* 3. MOBILE SLIDE-IN DRAWER (below 1024px)                     */}
      {/* ============================================================ */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 safe-top safe-bottom">
            {/* Drawer Header */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/25">
                  <Search className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="font-bold text-base tracking-tight text-heading">LogLense</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="tap-target text-slate-400 hover:text-slate-600 rounded-xl"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Job Card */}
            {currentJob && (
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                  Active Analysis
                </div>
                <div className="text-xs font-semibold text-heading truncate font-mono" title={currentJob.filename}>
                  {currentJob.filename}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span>{formatNumber(currentJob.total_lines)} lines</span>
                  <span>&bull;</span>
                  <span className="capitalize">{currentJob.engine}</span>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[44px] ${
                      isActive
                        ? 'bg-primary-tint text-primary'
                        : 'text-slate-600 hover:text-heading hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 stroke-[1.75] ${
                          isActive ? 'text-primary' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">
                        {item.badge}
                      </span>
                    )}
                    {item.count > 0 && !item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Bottom Telemetry Card in Drawer */}
            <div className="p-3.5 border-t border-slate-100 shrink-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-semibold mb-1 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    Parallel Pipeline
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Local
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  8 CPU Cores ready for chunked streaming.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MAIN CONTENT AREA                                         */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-cardBorder px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 safe-top">
          {/* Left section: Hamburger (Mobile only) + Logo / Breadcrumb */}
          <div className="flex items-center gap-2.5">
            {/* Hamburger on mobile (< sm) */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="sm:hidden tap-target p-2 rounded-xl text-slate-600 hover:bg-slate-100 -ml-1.5"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Logo (< sm) */}
            <div className="flex items-center gap-2 sm:hidden">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/25">
                <Search className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="font-bold text-base tracking-tight text-heading">
                {getBreadcrumb()}
              </span>
            </div>

            {/* Tablet & Desktop Breadcrumb (>= sm) */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">LogLense</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="font-semibold text-heading tracking-tight">{getBreadcrumb()}</span>
            </div>
          </div>

          {/* Right section: Search, New Analysis, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Icon button (< sm) */}
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className="sm:hidden tap-target p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Search Logs"
            >
              <Search className="w-5 h-5 text-slate-500" />
            </button>

            {/* Tablet & Desktop Search input (>= sm) */}
            <form onSubmit={handleGlobalSearch} className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search raw lines, IPs, endpoints..."
                className="w-48 md:w-64 pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
              />
            </form>

            {/* New Analysis: Icon-only on mobile (< sm), Full button on tablet/desktop (>= sm) */}
            <Link
              to="/upload"
              className="sm:hidden tap-target w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-sm transition-all"
              aria-label="New Analysis"
              title="New Analysis"
            >
              <Plus className="w-5 h-5" />
            </Link>

            <Link
              to="/upload"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all duration-150 min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis</span>
            </Link>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              LL
            </div>
          </div>
        </header>

        {/* Full-width Search Overlay for Mobile */}
        {searchOverlayOpen && (
          <div className="fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200 p-3 shadow-lg flex items-center gap-2 safe-top animate-in slide-in-from-top duration-150">
            <form onSubmit={handleGlobalSearch} className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search raw lines, IPs, endpoints..."
                className="w-full pl-9 pr-8 py-2.5 text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <button
              onClick={() => setSearchOverlayOpen(false)}
              className="tap-target px-3 py-2 text-xs font-bold text-slate-600 hover:text-heading"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Scrollable Page Canvas: 16px on mobile, 24px on tablet, 32px on desktop */}
        {/* pb-24 on mobile ensures bottom nav bar never covers content! */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>

        {/* ============================================================ */}
        {/* 5. FIXED BOTTOM NAVIGATION BAR ON MOBILE (< 640px)          */}
        {/* ============================================================ */}
        <nav className="sm:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-cardBorder flex items-center justify-around z-40 safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          {[
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Upload', path: '/upload', icon: UploadCloud },
            { label: 'Explorer', path: '/explorer', icon: Search },
            {
              label: 'Anomalies',
              path: '/anomalies',
              icon: AlertTriangle,
              badge: currentJob?.anomalies?.length,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`tap-target flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 stroke-[1.8] ${isActive ? 'text-primary' : ''}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-medium leading-none ${
                    isActive ? 'font-bold text-primary' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* 5th icon: More (opens full drawer) */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="tap-target flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="More Options"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium leading-none text-slate-500">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
