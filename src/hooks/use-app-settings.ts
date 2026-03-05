'use client';

import { create } from 'zustand';

interface AppSettingsState {
  isQuickTemplateEditMode: boolean;
  toggleQuickTemplateEditMode: () => void;
  aiApiKey: string;
  aiModel: string;
  updateAiSettings: (apiKey: string, model: string) => void;
}

export const useAppSettings = create<AppSettingsState>((set) => {
  // Try to get initial values from localStorage if available (client-side only)
  let initialApiKey = '';
  let initialModel = 'googleai/gemini-1.5-flash';

  if (typeof window !== 'undefined') {
    initialApiKey = localStorage.getItem('ai_api_key') || 'yW9ZscG9jUbR0ZqKAbRvWQGG5h7lhY9x';
    initialModel = localStorage.getItem('ai_model') || 'googleai/gemini-1.5-flash';
  }


  return {
    isQuickTemplateEditMode: false,
    toggleQuickTemplateEditMode: () => set((state) => ({ isQuickTemplateEditMode: !state.isQuickTemplateEditMode })),
    aiApiKey: initialApiKey,
    aiModel: initialModel,
    updateAiSettings: (apiKey, model) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_model', model);
        // Set cookie for server actions - expires in 30 days
        document.cookie = `ai_api_key=${apiKey}; path=/; max-age=${30 * 24 * 60 * 60}`;
        document.cookie = `ai_model=${model}; path=/; max-age=${30 * 24 * 60 * 60}`;
      }
      set({ aiApiKey: apiKey, aiModel: model });
    },
  };
});

