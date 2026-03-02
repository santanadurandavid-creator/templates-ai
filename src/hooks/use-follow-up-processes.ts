'use client';

import type { FollowUpProcess } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const safeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useFollowUpProcesses() {
  const [followUpProcesses, setFollowUpProcesses, isLoading] = useLocalStorage<FollowUpProcess[]>('genie-follow-up-processes', []);

  const addProcess = (process: Omit<FollowUpProcess, 'id'>) => {
    const newProcess: FollowUpProcess = {
      ...process,
      id: safeUUID(),
    };
    setFollowUpProcesses((prev) => [newProcess, ...prev]);
  };

  const updateProcess = (updatedProcess: FollowUpProcess) => {
    setFollowUpProcesses((prev) =>
      prev.map((p) => (p.id === updatedProcess.id ? updatedProcess : p))
    );
  };

  const deleteProcess = (id: string) => {
    setFollowUpProcesses((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    followUpProcesses,
    setFollowUpProcesses,
    addProcess,
    updateProcess,
    deleteProcess,
    isLoading,
  };
}
