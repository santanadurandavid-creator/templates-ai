'use client';

import type { KnowledgeProcess } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { DEFAULT_KNOWLEDGE_PROCESSES } from '@/lib/data';

const safeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useKnowledgeBase() {
  const [knowledgeBase, setKnowledgeBase, isLoading] = useLocalStorage<KnowledgeProcess[]>('genie-knowledge-base', []);

  const addProcess = (process: Omit<KnowledgeProcess, 'id'>) => {
    const newProcess: KnowledgeProcess = {
      ...process,
      id: safeUUID(),
    };
    setKnowledgeBase((prev) => [newProcess, ...prev]);
  };

  const updateProcess = (updatedProcess: KnowledgeProcess) => {
    setKnowledgeBase((prev) =>
      prev.map((p) => (p.id === updatedProcess.id ? updatedProcess : p))
    );
  };

  const deleteProcess = (id: string) => {
    setKnowledgeBase((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    knowledgeBase,
    setKnowledgeBase,
    addProcess,
    updateProcess,
    deleteProcess,
    isLoading,
  };
}
