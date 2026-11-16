import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchJobs, fetchJobDetail } from '../lib/api';
import { useToast } from '../components/Toast';

const JobContext = createContext(null);

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(() => {
    return localStorage.getItem('loglense_active_job') || null;
  });
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const refreshJobs = useCallback(async () => {
    try {
      const data = await fetchJobs();
      setJobs(data);
      if (data.length > 0) {
        if (!currentJobId || !data.some(j => j.id === currentJobId)) {
          // Default to the first (latest) job
          setCurrentJobId(data[0].id);
          localStorage.setItem('loglense_active_job', data[0].id);
        }
      } else {
        setCurrentJobId(null);
        setCurrentJob(null);
        localStorage.removeItem('loglense_active_job');
      }
    } catch (err) {
      console.error('Failed to load jobs list:', err);
    } finally {
      setLoading(false);
    }
  }, [currentJobId]);

  // Load current job details whenever currentJobId changes
  useEffect(() => {
    if (!currentJobId) {
      setCurrentJob(null);
      return;
    }

    let isMounted = true;
    let pollInterval = null;

    const loadDetail = async () => {
      try {
        const detail = await fetchJobDetail(currentJobId);
        if (isMounted) {
          setCurrentJob(detail);

          // If job is in progress, poll until completion
          if (['pending', 'splitting', 'mapping', 'reducing', 'storing'].includes(detail.status)) {
            if (!pollInterval) {
              pollInterval = setInterval(loadDetail, 800);
            }
          } else {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
              if (detail.status === 'completed') {
                addToast(`Job ${detail.filename} completed in ${detail.parse_time_seconds}s!`, 'success');
                refreshJobs();
              } else if (detail.status === 'failed') {
                addToast(`Job ${detail.filename} failed: ${detail.error_message}`, 'error');
                refreshJobs();
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch current job detail:', err);
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentJobId, addToast, refreshJobs]);

  // Initial load
  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  const selectJob = useCallback((id) => {
    setCurrentJobId(id);
    localStorage.setItem('loglense_active_job', id);
  }, []);

  return (
    <JobContext.Provider
      value={{
        jobs,
        currentJobId,
        currentJob,
        loading,
        refreshJobs,
        selectJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJob() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

