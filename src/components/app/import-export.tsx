'use client';

import { useToast } from '@/hooks/use-toast';
import { useTemplates } from '@/hooks/use-templates';
import { useLinks } from '@/hooks/use-links';
import { useKnowledgeBase } from '@/hooks/use-knowledge-base';
import { useAiHistory } from '@/hooks/use-ai-history';
import { useRephraseHistory } from '@/hooks/use-rephrase-history';
import { useFollowUps } from '@/hooks/use-follow-ups';
import { useTagSuggestionHistory } from '@/hooks/use-tag-suggestion-history';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import React, { useRef } from 'react';
import type { AppData, Template, FollowUp, KnowledgeProcess, Link as LinkType, AITemplate, RephrasedTemplate, FollowUpProcess, TagSuggestion } from '@/lib/types';
import { Input } from '../ui/input';
import { useFollowUpProcesses } from '@/hooks/use-follow-up-processes';

const safeUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};


export function ImportExport() {
  const { templates, setTemplates } = useTemplates();
  const { links, setLinks } = useLinks();
  const { knowledgeBase, setKnowledgeBase } = useKnowledgeBase();
  const { aiHistory, setAiHistory } = useAiHistory();
  const { rephraseHistory, setRephraseHistory } = useRephraseHistory();
  const { followUps, setFollowUps } = useFollowUps();
  const { followUpProcesses, setFollowUpProcesses } = useFollowUpProcesses();
  const { tagSuggestions, setTagSuggestions } = useTagSuggestionHistory();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      // Exportar templates ya ordenados por su campo `order` para preservar el acomodo
      const orderedTemplates = [...templates].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }).map((t, idx) => ({ ...t, order: t.order ?? idx }));

      const appData: AppData = {
        templates: orderedTemplates,
        links,
        knowledgeBase,
        aiHistory,
        rephraseHistory,
        followUps,
        followUpProcesses,
        tagSuggestions,
      };

      const jsonString = JSON.stringify(appData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studio-genie-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Exportación Exitosa',
        description: 'Tus datos han sido guardados en un archivo JSON.',
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: 'destructive',
        title: 'Error de Exportación',
        description: 'No se pudieron exportar los datos.',
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('Invalid file content');

        const importedData = JSON.parse(text);
        applyBackup(importedData as AppData);

      } catch (error) {
        console.error("Import error:", error);
        toast({
          variant: 'destructive',
          title: 'Error de Importación',
          description: 'El archivo es inválido o está corrupto.',
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyBackup = (data: AppData) => {
    const now = new Date().toISOString();
    let finalTemplates: Template[] = [];

    // Process templates from `templates` array
    if (data.templates && Array.isArray(data.templates)) {
      const importedTemplates: Template[] = data.templates.map((t: any, idx: number) => ({
        id: t.id || safeUUID(),
        title: t.title || 'Sin Título',
        content: t.content || '',
        category: t.category || 'General',
        tags: t.tags || [],
        usageCount: t.usageCount || 0,
        isQuick: t.isQuick || false,
        createdAt: t.createdAt || now,
        color: t.color,
        order: t.order !== undefined ? t.order : idx, // Preservar el orden exacto del JSON exportado
      }));
      finalTemplates = finalTemplates.concat(importedTemplates);
    }

    // Process quick templates from the legacy `quickTemplates` array
    if ((data as any).quickTemplates && Array.isArray((data as any).quickTemplates)) {
      const importedQuickTemplates: Template[] = ((data as any).quickTemplates).map((t: any, idx: number) => ({
        id: t.id || safeUUID(),
        title: t.title || 'Sin Título',
        content: t.content || '',
        category: 'Quick',
        tags: t.tags || [],
        usageCount: t.usageCount || 0,
        isQuick: true,
        createdAt: t.createdAt || now,
        color: t.color,
        order: t.order !== undefined ? t.order : (finalTemplates.length + idx), // Preservar orden
      }));
      finalTemplates = finalTemplates.concat(importedQuickTemplates);
    }

    // Ordenar por el campo `order` para que el acomodo sea idéntico al momento de exportarse
    finalTemplates.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setTemplates(finalTemplates);


    if (data.links && Array.isArray(data.links)) {
      const linksWithIds = data.links.map((l: LinkType) => ({ ...l, id: l.id?.toString() || safeUUID() }));
      setLinks(linksWithIds);
    } else {
      setLinks([]);
    }

    if (data.knowledgeBase && Array.isArray(data.knowledgeBase)) {
      const knowledgeWithIds = data.knowledgeBase.map((p: KnowledgeProcess) => ({ ...p, id: p.id?.toString() || safeUUID() }));
      setKnowledgeBase(knowledgeWithIds);
    } else {
      setKnowledgeBase([]);
    }

    if (data.aiHistory && Array.isArray(data.aiHistory)) {
      const historyWithIds = data.aiHistory.map((h: AITemplate) => ({
        ...h,
        id: h.id?.toString() || safeUUID(),
        createdAt: h.createdAt || now
      }));
      setAiHistory(historyWithIds);
    } else {
      setAiHistory([]);
    }

    if (data.rephraseHistory && Array.isArray(data.rephraseHistory)) {
      const rephraseWithIds = data.rephraseHistory.map((r: RephrasedTemplate) => ({
        ...r,
        id: r.id?.toString() || safeUUID(),
        createdAt: r.createdAt || now
      }));
      setRephraseHistory(rephraseWithIds);
    } else {
      setRephraseHistory([]);
    }

    if (data.followUps && Array.isArray(data.followUps)) {
      const followUpsWithIds = data.followUps.map((f: FollowUp) => ({
        ...f,
        id: f.id?.toString() || safeUUID(),
        createdAt: f.createdAt || now
      }));
      setFollowUps(followUpsWithIds);
    } else {
      setFollowUps([]);
    }

    if (data.followUpProcesses && Array.isArray(data.followUpProcesses)) {
      const processesWithIds = data.followUpProcesses.map((p: FollowUpProcess) => ({ ...p, id: p.id?.toString() || safeUUID() }));
      setFollowUpProcesses(processesWithIds);
    } else {
      setFollowUpProcesses([]);
    }

    if (data.tagSuggestions && Array.isArray(data.tagSuggestions)) {
      const suggestionsWithIds = data.tagSuggestions.map((s: TagSuggestion) => ({
        ...s,
        id: s.id?.toString() || safeUUID(),
        createdAt: s.createdAt || now
      }));
      setTagSuggestions(suggestionsWithIds);
    } else {
      setTagSuggestions([]);
    }

    toast({
      title: 'Importación Exitosa',
      description: 'Tus datos han sido restaurados desde el archivo.',
    });
  };

  return (
    <>
      <Input
        type="file"
        id="import-file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" asChild className="h-6 px-1.5 sm:px-2 text-[9px] sm:text-[10px]">
        <label htmlFor="import-file" className="cursor-pointer">
          <Upload className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline">Importar</span>
        </label>
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} className="h-6 px-1.5 sm:px-2 text-[9px] sm:text-[10px]">
        <Download className="h-3 w-3 sm:mr-1" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>
    </>
  );
}
