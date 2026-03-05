'use client';

import { create } from 'zustand';

interface AppSettingsState {
  isQuickTemplateEditMode: boolean;
  toggleQuickTemplateEditMode: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  aiApiKey: string;
  aiModel: string;
  updateAiSettings: (apiKey: string, model: string) => void;
}

export const useAppSettings = create<AppSettingsState>((set) => {
  let initialApiKey = '';
  let initialModel = 'googleai/gemini-1.5-flash';
  let initialDarkMode = false;

  if (typeof window !== 'undefined') {
    initialApiKey = localStorage.getItem('ai_api_key') || 'yW9ZscG9jUbR0ZqKAbRvWQGG5h7lhY9x';
    initialModel = localStorage.getItem('ai_model') || 'googleai/gemini-1.5-flash';
    initialDarkMode = localStorage.getItem('theme') === 'dark';
    // Aplicar clase al cargar
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    isQuickTemplateEditMode: false,
    toggleQuickTemplateEditMode: () => set((state) => ({ isQuickTemplateEditMode: !state.isQuickTemplateEditMode })),
    isDarkMode: initialDarkMode,
    toggleTheme: () => set((state) => {
      const next = !state.isDarkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', next ? 'dark' : 'light');
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: next };
    }),
    aiApiKey: initialApiKey,
    aiModel: initialModel,
    updateAiSettings: (apiKey, model) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_api_key', apiKey);
        localStorage.setItem('ai_model', model);
        document.cookie = `ai_api_key=${apiKey}; path=/; max-age=${30 * 24 * 60 * 60}`;
        document.cookie = `ai_model=${model}; path=/; max-age=${30 * 24 * 60 * 60}`;
      }
      set({ aiApiKey: apiKey, aiModel: model });
    },
  };
});
