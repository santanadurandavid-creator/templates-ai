'use client';

import type { Template } from '@/lib/types';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useToast } from '@/hooks/use-toast';

import { AppHeader } from '@/components/app/app-header';
import { QuickTemplatesGrid } from '@/components/app/quick-templates-grid';
import { TemplateSearchAndFilters } from '@/components/app/template-search-filters';
import { TopUsedTemplates } from '@/components/app/top-used-templates';
import { TemplateList } from '@/components/app/template-list';
import { QuickTemplateDialog } from '@/components/app/quick-template-dialog';
import { ManageQuickCategoriesDialog } from '@/components/app/manage-quick-categories-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Copy, Settings, Plus, Pencil, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, eventBus } from '@/lib/utils';
import { EditTemplateDialog } from '@/components/app/edit-template-dialog';
import { rephraseTemplate } from '@/ai/flows/rephrase-template-flow';
import { RephraseHistorySheet } from '@/components/app/rephrase-history-sheet';
import { useRephraseHistory } from '@/hooks/use-rephrase-history';
import useLocalStorage from '@/hooks/use-local-storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export default function TemplatesPage() {
  const { templates, isLoading, addTemplate, updateTemplate, deleteTemplate, incrementUsage, reorderTemplates, renameQuickCategory, deleteQuickCategory } = useTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQuickCategory, setSelectedQuickCategory] = useState('All');

  const [isQuickTemplateDialogOpen, setQuickTemplateDialogOpen] = useState(false);
  const [editingQuickTemplate, setEditingQuickTemplate] = useState<Template | null>(null);
  const [isManageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [isQuickEditMode, setIsQuickEditMode] = useState(false);
  const [isQuickActionsExpanded, setIsQuickActionsExpanded] = useState(false);

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [isRephraseSheetOpen, setRephraseSheetOpen] = useState(false);
  const [rephrasingTemplate, setRephrasingTemplate] = useState<Template | null>(null);
  const [showTopUsed, setShowTopUsed] = useLocalStorage('show-top-used', true);

  const { copy } = useCopyToClipboard();
  const { toast, dismiss } = useToast();
  const { addRephraseHistory } = useRephraseHistory();
  const lastToastId = useRef<string | null>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const uniqueTemplates = useMemo(() => {
    const seenIds = new Set();
    return (templates || []).filter(template => {
      if (seenIds.has(template.id)) {
        return false;
      }
      seenIds.add(template.id);
      return true;
    });
  }, [templates]);

  useEffect(() => {
    const unsubscribe = eventBus.on('open-quick-template-dialog', () => {
      handleOpenQuickTemplateDialog(null);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTemplates = uniqueTemplates
    .filter((t) => !t.isQuick)
    .filter((template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter((template) =>
      selectedCategory === 'All' ? true : template.category === selectedCategory
    );

  const quickTemplates = uniqueTemplates.filter((t) => t.isQuick);

  const quickCategories = useMemo(() => {
    const cats = quickTemplates.map(t => t.category).filter(Boolean);
    return ['All', ...Array.from(new Set(cats))].sort((a, b) => a.localeCompare(b));
  }, [quickTemplates]);

  const filteredQuickTemplates = useMemo(() => {
    if (selectedQuickCategory === 'All') return quickTemplates;
    return quickTemplates.filter(t => t.category === selectedQuickCategory);
  }, [quickTemplates, selectedQuickCategory]);

  const handleCopy = (content: string, title: string, id: string) => {
    copy(content);
    incrementUsage(id);

    if (lastToastId.current) {
      dismiss(lastToastId.current);
    }

    const { id: newToastId } = toast({
      title: `"${title}" copiado.`,
      description: 'El contenido está en tu portapapeles.',
      duration: 1000,
      variant: 'success',
    });
    lastToastId.current = newToastId;
  }

  const handleOpenQuickTemplateDialog = (template: Template | null) => {
    setEditingQuickTemplate(template);
    setQuickTemplateDialogOpen(true);
  };

  const handleOpenEditDialog = (template: Template | null = null) => {
    if (template) {
      setIsCreatingNew(false);
      setEditingTemplate(template);
    } else {
      setIsCreatingNew(true);
      setEditingTemplate(null);
    }
    setEditDialogOpen(true);
  };

  const handleShowHistory = (template: Template) => {
    setTimeout(() => {
      setRephrasingTemplate(template);
      setRephraseSheetOpen(true);
    }, 50);
  };

  const handleRephrase = (template: Template) => {
    const { id: toastId, update } = toast({
      title: 'Parafraseando con IA...',
      description: 'Generando una nueva versión de la plantilla.',
    });

    (async () => {
      const result = await rephraseTemplate({
        title: template.title,
        content: template.content,
      });

      if (result.success && result.data) {
        const rephrased = result.data.rephrasedContent;

        addRephraseHistory({
          originalTemplateId: template.id,
          originalContent: template.content,
          rephrasedContent: rephrased,
        });

        update({
          id: toastId,
          variant: 'default',
          title: '¡Versión Parafraseada!',
          description: (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm bg-slate-100 p-2 rounded-md">{rephrased}</p>
              <Button size="sm" variant="ghost" onClick={() => copy(rephrased)}>
                <Copy className="mr-2 h-4 w-4" /> Copiar
              </Button>
            </div>
          ),
          duration: 15000,
        });
      } else {
        update({
          id: toastId,
          variant: 'destructive',
          title: 'Error de IA',
          description: result.error || 'No se pudo parafrasear la plantilla.',
        });
      }
    })();
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    toast({
      title: 'Plantilla Eliminada',
      variant: 'destructive'
    });
  };

  const handleSaveQuickTemplate = (values: any) => {
    if (editingQuickTemplate) {
      updateTemplate({ ...editingQuickTemplate, ...values });
      toast({ title: 'Nota Rápida Actualizada' });
    } else {
      addTemplate({ ...values, isQuick: true, tags: [] });
      toast({ title: 'Nota Rápida Creada' });
    }
    setQuickTemplateDialogOpen(false);
    setEditingQuickTemplate(null);
  };

  const handleSaveTemplate = (values: any) => {
    if (isCreatingNew) {
      addTemplate(values);
      toast({ title: 'Plantilla Creada' });
    } else if (editingTemplate) {
      updateTemplate({ ...editingTemplate, ...values });
      toast({ title: 'Plantilla Actualizada' });
    }
    setEditDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <AppHeader />
        <div className="flex-1 overflow-y-auto space-y-3 pt-2 px-2 pb-24">

          <Card className="border-accent/20">
            <CardContent className="pt-3 space-y-3">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {/* Carrusel Real de Categorías */}
                  <div className="flex-1 overflow-hidden">
                    <Carousel
                      opts={{
                        align: 'start',
                        dragFree: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-1">
                        {quickCategories.map(cat => (
                          <CarouselItem key={cat} className="pl-1 basis-auto">
                            <button
                              onClick={() => setSelectedQuickCategory(cat)}
                              className={cn(
                                "whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all border shrink-0 select-none",
                                selectedQuickCategory === cat
                                  ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                                  : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:scale-105"
                              )}
                            >
                              {cat === 'All' ? '⚡ Todas' : cat}
                            </button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>

                  {/* Acciones de Notas Rápidas Colapsables */}
                  <div ref={quickActionsRef} className="flex items-center gap-1.5 shrink-0 pl-1 border-l ml-1 border-accent/10 overflow-hidden">
                    <div className={cn(
                      "flex items-center gap-2 transition-all duration-300 ease-in-out",
                      (isQuickActionsExpanded || isQuickEditMode) ? "max-w-[280px] opacity-100" : "max-w-0 opacity-0 pointer-events-none"
                    )}>
                      {/* Switch para Top 7 */}
                      <div className="flex items-center gap-1.5 mr-1 shrink-0">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase hidden sm:inline">Top 7</span>
                        <Switch
                          checked={showTopUsed}
                          onCheckedChange={setShowTopUsed}
                          className="scale-75 origin-right"
                          title="Mostrar/Ocultar Top 7"
                        />
                      </div>
                      <Separator orientation="vertical" className="h-4 bg-accent/20" />
                      <Button
                        type="button"
                        variant={isQuickEditMode ? "default" : "ghost"}
                        size="icon"
                        className={cn(
                          "h-8 w-8 transition-all shrink-0",
                          isQuickEditMode ? "animate-pulse shadow-md" : "text-muted-foreground hover:text-accent hover:bg-accent/10"
                        )}
                        onClick={() => setIsQuickEditMode(!isQuickEditMode)}
                        title={isQuickEditMode ? "Finalizar Edición" : "Editar Cuadrícula"}
                      >
                        {isQuickEditMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 shrink-0"
                        onClick={() => setManageCategoriesOpen(true)}
                        title="Gestionar Categorías"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-accent/20 text-accent hover:bg-accent/10 shrink-0"
                        onClick={() => handleOpenQuickTemplateDialog(null)}
                        title="Añadir Nota Rápida"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-accent hover:bg-accent/10 shrink-0 transition-transform duration-300",
                        (isQuickActionsExpanded || isQuickEditMode) && "rotate-180"
                      )}
                      onClick={() => setIsQuickActionsExpanded(!isQuickActionsExpanded)}
                      title={isQuickActionsExpanded ? "Contraer" : "Acciones"}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

              </div>

              <QuickTemplatesGrid
                templates={filteredQuickTemplates}
                isLoading={isLoading}
                isEditMode={isQuickEditMode}
                onCopy={(content, title, id) => handleCopy(content, title, id)}
                onEdit={handleOpenQuickTemplateDialog}
                onDelete={handleDelete}
                onReorder={(reordered) => {
                  const quickIds = new Set(reordered.map(t => t.id));
                  const nonQuick = templates.filter(t => !quickIds.has(t.id));
                  reorderTemplates([...reordered, ...nonQuick]);
                }}
              />
            </CardContent>
          </Card>

          {showTopUsed && (
            <TopUsedTemplates
              templates={uniqueTemplates}
              isLoading={isLoading}
              onCopy={handleCopy}
              onHide={() => setShowTopUsed(false)}
            />
          )}


          <TemplateSearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            templates={uniqueTemplates}
            onAddNew={() => handleOpenEditDialog(null)}
          />

          <TemplateList
            templates={filteredTemplates}
            isLoading={isLoading}
            onCopy={handleCopy}
            onEdit={handleOpenEditDialog}
            onDelete={handleDelete}
            onRephrase={handleRephrase}
            onShowHistory={handleShowHistory}
            onAddNew={() => handleOpenEditDialog(null)}
          />
        </div>
      </div>

      <QuickTemplateDialog
        isOpen={isQuickTemplateDialogOpen}
        onOpenChange={setQuickTemplateDialogOpen}
        template={editingQuickTemplate}
        allTemplates={uniqueTemplates}
        onSave={handleSaveQuickTemplate}
      />

      <ManageQuickCategoriesDialog
        isOpen={isManageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
        templates={quickTemplates}
        onRename={renameQuickCategory}
        onDelete={deleteQuickCategory}
      />

      <EditTemplateDialog
        template={editingTemplate}
        allTemplates={uniqueTemplates}
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingTemplate(null);
            setIsCreatingNew(false);
          }
          setEditDialogOpen(isOpen);
        }}
        onSave={handleSaveTemplate}
        isNew={isCreatingNew}
      />

      <RephraseHistorySheet
        template={rephrasingTemplate}
        open={isRephraseSheetOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRephrasingTemplate(null);
          }
          setRephraseSheetOpen(isOpen);
        }}
      />
    </>
  );
}
