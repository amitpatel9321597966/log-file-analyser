import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { JobProvider } from './hooks/useJobContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { PipelinePage } from './pages/PipelinePage';
import { ExplorerPage } from './pages/ExplorerPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <JobProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/explorer" element={<ExplorerPage />} />
              <Route path="/anomalies" element={<AnomaliesPage />} />
              <Route path="/benchmark" element={<BenchmarkPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </JobProvider>
    </ToastProvider>
  );
}

