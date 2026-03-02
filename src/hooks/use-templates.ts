'use client';

import type { Template } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { DEFAULT_TEMPLATES } from '@/lib/data';

const safeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function useTemplates() {
  const [templates, setTemplates, isLoading] = useLocalStorage<Template[]>('genie-templates', []);

  const addTemplate = (template: Omit<Template, 'id' | 'usageCount' | 'createdAt'>) => {
    const nextOrder = templates.length > 0
      ? Math.max(...templates.map(t => t.order || 0)) + 1
      : 0;

    const newTemplate: Template = {
      ...template,
      id: safeUUID(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      tags: (template as any).tags || [],
      order: nextOrder,
    };
    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const updateTemplate = (updatedTemplate: Template) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const incrementUsage = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
      )
    );
  };

  const reorderTemplates = (newTemplates: Template[]) => {
    const withOrder = newTemplates.map((t, idx) => ({ ...t, order: idx }));
    setTemplates(withOrder);
  };

  // New: Rename all templates in a category
  const renameQuickCategory = (oldName: string, newName: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.isQuick && t.category === oldName ? { ...t, category: newName } : t))
    );
  };

  // New: Delete all templates in a category
  const deleteQuickCategory = (categoryName: string) => {
    setTemplates((prev) =>
      prev.filter((t) => !(t.isQuick && t.category === categoryName))
    );
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    templates: sortedTemplates,
    setTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    reorderTemplates,
    renameQuickCategory,
    deleteQuickCategory,
    isLoading,
  };
}
