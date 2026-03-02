'use client';

import type { Link } from '@/lib/types';
import useLocalStorage from './use-local-storage';

const safeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};


const DEFAULT_LINKS_DATA: Omit<Link, 'id'>[] = [
    {title: "Formulario de Feedback de Cliente", url: "https://forms.example.com/feedback", category: "forms"},
    {title: "Hoja de Seguimiento de Casos", url: "https://sheets.example.com/cases", category: "sheets"},
]

export function useLinks() {
  const [links, setLinks, isLoading] = useLocalStorage<Link[]>('genie-links', []);

  const addLink = (link: Omit<Link, 'id'>) => {
    const newLink: Link = {
      ...link,
      id: safeUUID(),
    };
    setLinks((prev) => [newLink, ...prev]);
  };

  const updateLink = (updatedLink: Link) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === updatedLink.id ? updatedLink : l))
    );
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    links,
    setLinks,
    addLink,
    updateLink,
    deleteLink,
    isLoading,
  };
}
