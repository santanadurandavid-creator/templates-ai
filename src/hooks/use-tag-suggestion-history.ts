'use client';

import type { TagSuggestion } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const safeUUID = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useTagSuggestionHistory() {
  const [tagSuggestions, setTagSuggestions, isLoading] = useLocalStorage<TagSuggestion[]>('genie-tag-suggestions', []);

  const addTagSuggestion = (suggestion: Omit<TagSuggestion, 'id' | 'createdAt'>) => {
    const newSuggestion: TagSuggestion = {
      ...suggestion,
      id: safeUUID(),
      createdAt: new Date().toISOString(),
    };
    setTagSuggestions((prev) => [newSuggestion, ...prev].slice(0, 50)); // Keep last 50
  };

  const deleteTagSuggestion = (id: string) => {
    setTagSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const clearTagSuggestions = () => {
    setTagSuggestions([]);
  };

  return {
    tagSuggestions,
    setTagSuggestions,
    addTagSuggestion,
    deleteTagSuggestion,
    clearTagSuggestions,
    isLoading,
  };
}
