'use client';

import type { FollowUp } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const safeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useFollowUps() {
  const [followUps, setFollowUps, isLoading] = useLocalStorage<FollowUp[]>('genie-follow-ups', []);

  const addFollowUp = (followUp: Omit<FollowUp, 'id' | 'status' | 'createdAt'>) => {
    const newFollowUp: FollowUp = {
      ...followUp,
      id: safeUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setFollowUps((prev) => [newFollowUp, ...prev]);
  };

  const toggleFollowUpStatus = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === 'pending' ? 'done' : 'pending' } : f
      )
    );
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
  };

  return {
    followUps,
    setFollowUps,
    addFollowUp,
    toggleFollowUpStatus,
    deleteFollowUp,
    isLoading,
  };
}
