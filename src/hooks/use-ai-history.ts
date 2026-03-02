'use client';

import type { AITemplate } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const safeUUID = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};


export function useAiHistory() {
  const [aiHistory, setAiHistory, isLoading] = useLocalStorage<AITemplate[]>('genie-ai-history', []);

  const addAiHistory = (template: Omit<AITemplate, 'id' | 'createdAt'>) => {
    const newTemplate: AITemplate = {
      ...template,
      id: safeUUID(),
      createdAt: new Date().toISOString(),
    };
    setAiHistory((prev) => [newTemplate, ...prev].slice(0, 30)); 
  };

  const updateAiHistory = (updatedTemplate: AITemplate) => {
    setAiHistory((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  };
  
  const deleteAiHistory = (id: string) => {
    setAiHistory((prev) => prev.filter((t) => t.id !== id));
  };
  
  const clearAiHistory = () => {
    setAiHistory([]);
  };

  return {
    aiHistory,
    setAiHistory: (data: AITemplate[]) => {
      const sanitized = data.map(item => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      setAiHistory(sanitized);
    },
    addAiHistory,
    updateAiHistory,
    deleteAiHistory,
    clearAiHistory,
    isLoading,
  };
}
