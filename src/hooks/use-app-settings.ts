'use client';

import { create } from 'zustand';

interface AppSettingsState {
  isQuickTemplateEditMode: boolean;
  toggleQuickTemplateEditMode: () => void;
}

export const useAppSettings = create<AppSettingsState>((set) => ({
  isQuickTemplateEditMode: false,
  toggleQuickTemplateEditMode: () => set((state) => ({ isQuickTemplateEditMode: !state.isQuickTemplateEditMode })),
}));
