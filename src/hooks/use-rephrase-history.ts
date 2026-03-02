'use client';

import type { RephrasedTemplate } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const safeUUID = () => {
    if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useRephraseHistory() {
  const [rephraseHistory, setRephraseHistory] = useLocalStorage<RephrasedTemplate[]>('genie-rephrase-history', []);

  const addRephraseHistory = (item: Omit<RephrasedTemplate, 'id' | 'createdAt'>) => {
    const newItem: RephrasedTemplate = {
      ...item,
      id: safeUUID(),
      createdAt: new Date().toISOString(),
    };
    setRephraseHistory((prev) => [newItem, ...prev]);
  };

  const getHistoryForTemplate = (templateId: string) => {
    return rephraseHistory.filter(item => item.originalTemplateId === templateId);
  };
  
  const clearHistory = () => {
    setRephraseHistory([]);
  };

  return {
    rephraseHistory,
    setRephraseHistory,
    addRephraseHistory,
    getHistoryForTemplate,
    clearHistory,
  };
}
