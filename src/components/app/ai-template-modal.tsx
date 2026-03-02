'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateEmpatheticTemplate } from '@/ai/flows/generate-empathetic-template';
import { suggestTagsForTemplate } from '@/ai/flows/suggest-tags-for-template';
import { mapProcess } from '@/ai/flows/map-process-flow';
import { useTemplates } from '@/hooks/use-templates';
import { useKnowledgeBase } from '@/hooks/use-knowledge-base';
import { useAiHistory } from '@/hooks/use-ai-history';
import { useTagRules } from '@/hooks/use-tag-rules';
import { useTagSuggestionHistory } from '@/hooks/use-tag-suggestion-history';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Save, Copy, Settings2, Tag, Info, History, MessageSquareText, FileText, Trash2, Eye, AlertCircle, PlayCircle, Workflow } from 'lucide-react';
import React from 'react';
import type { AITemplate, Template, KnowledgeProcess } from '@/lib/types';
import { EditTemplateDialog } from './edit-template-dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { ViewProcessDialog } from './process/view-process-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  context: z.string().min(10, { message: 'El contexto debe tener al menos 10 caracteres.' }),
});

type AITemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function AITemplateModal({ open, onOpenChange, children }: AITemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingTag, setIsSuggestingTag] = useState(false);
  const [isAnalyzingFlow, setIsAnalyzingFlow] = useState(false);
  const [isMappingFlow, setIsMappingFlow] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isRulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [isTagHistoryOpen, setTagHistoryOpen] = useState(false);
  const [isAnalysisHistoryOpen, setAnalysisHistoryOpen] = useState(false);
  const [isNoProcessAlertOpen, setNoProcessAlertOpen] = useState(false);
  
  const [viewingProcess, setViewingProcess] = useState<KnowledgeProcess | null>(null);
  const [isProcessViewOpen, setProcessViewOpen] = useState(false);

  const { templates, addTemplate } = useTemplates();
  const { knowledgeBase, updateProcess } = useKnowledgeBase();
  const { addAiHistory, aiHistory, deleteAiHistory } = useAiHistory();
  const { tagRules, setTagRules } = useTagRules();
  const { tagSuggestions, addTagSuggestion, deleteTagSuggestion } = useTagSuggestionHistory();
  const { toast } = useToast();
  const { copy } = useCopyToClipboard();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: '',
    },
  });

  const handleAiAction = (actionType: 'analyze' | 'generate') => {
    const values = form.getValues();
    if (values.context.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Contexto insuficiente',
        description: 'Por favor, describe mejor la situación (mín. 10 caracteres).',
      });
      return;
    }

    setIsLoading(true);
    const toastTitle = actionType === 'analyze' ? 'Analizando mensaje...' : 'Generando plantilla...';
    const { id: toastId, update } = toast({
      title: toastTitle,
      description: 'La IA está procesando la solicitud.',
    });

    onOpenChange(false);

    (async () => {
      try {
        const templatesForAi = templates.map(t => ({ title: t.title, content: t.content }));
        const knowledgeBaseContent = knowledgeBase.map(p => `${p.title}`).join('\n');

        const result = await generateEmpatheticTemplate({
          context: values.context,
          existingTemplates: templatesForAi,
          knowledgeBase: knowledgeBaseContent,
          tagRules: tagRules,
        });

        if (result.success && result.data) {
          const newTemplate: Omit<AITemplate, 'id' | 'createdAt'> = {
            context: values.context,
            title: result.data.title,
            content: result.data.content,
            summary: actionType === 'analyze' ? result.data.summary : 'Generación directa de plantilla.',
            suggestedTags: result.data.recommendedTag ? [result.data.recommendedTag] : [],
            recommendedTag: result.data.recommendedTag,
            matchedProcessTitle: result.data.matchedProcessTitle,
          };
          addAiHistory(newTemplate);
          form.reset();
          update({
            id: toastId,
            variant: 'default',
            title: actionType === 'analyze' ? '¡Análisis completado!' : '¡Plantilla generada!',
            description: 'Revisa el resultado en el historial reciente.',
          });
        } else {
          throw new Error(result.error || 'Respuesta de la IA inválida.');
        }
      } catch (error: any) {
        update({
          id: toastId,
          variant: 'destructive',
          title: 'Error de IA',
          description: error.message || 'No se pudo procesar la solicitud.',
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }

  const handleOnlySuggestTag = async () => {
    const context = form.getValues('context');
    if (context.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Contexto insuficiente',
        description: 'Por favor, describe mejor la situación (mín. 10 caracteres).',
      });
      return;
    }

    setIsSuggestingTag(true);
    const { id: toastId, update } = toast({
      title: 'Analizando situación...',
      description: 'La IA está recomendando el mejor tag basado en tus reglas.',
    });

    try {
      const result = await suggestTagsForTemplate({
        situation: context,
        tagRules: tagRules,
      });

      if (result.success && result.data) {
        addTagSuggestion({
          situation: context,
          tag: result.data.tag,
          severity: result.data.severity,
          justification: result.data.justification,
        });

        const severityColors = {
          VERDE: 'text-green-600 font-bold',
          AMARILLO: 'text-yellow-600 font-bold',
          ROJO: 'text-red-600 font-bold',
        };

        update({
          id: toastId,
          variant: 'default',
          title: `Tag Recomendado: ${result.data.tag}`,
          description: (
            <div className="mt-2 space-y-2 border-t pt-2 border-primary/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Análisis de la IA:</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Tag className="h-3 w-3 mr-1" /> {result.data.tag}
                </Badge>
                <span className={cn("text-xs", severityColors[result.data.severity])}>
                  [{result.data.severity}]
                </span>
              </div>
              <p className="text-xs italic text-slate-600">"{result.data.justification}"</p>
            </div>
          ),
          duration: 12000,
        });
      } else {
        throw new Error(result.error || 'Error al sugerir tag.');
      }
    } catch (error: any) {
      update({
        id: toastId,
        variant: 'destructive',
        title: 'Error de IA',
        description: error.message,
      });
    } finally {
      setIsSuggestingTag(false);
    }
  };

  const handleAnalyzeFlow = async () => {
    const context = form.getValues('context');
    if (context.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Contexto insuficiente',
        description: 'Por favor, describe mejor la situación (mín. 10 caracteres).',
      });
      return;
    }

    setIsAnalyzingFlow(true);
    const { id: toastId, update } = toast({
      title: 'Buscando flujo de proceso...',
      description: 'La IA está analizando la situación y consultando la base de conocimientos.',
    });

    try {
      const knowledgeBaseContent = knowledgeBase.map(p => `${p.title}`).join('\n');
      
      const result = await generateEmpatheticTemplate({
        context: context,
        existingTemplates: [], // No necesitamos plantillas para buscar solo el flujo
        knowledgeBase: knowledgeBaseContent,
        tagRules: tagRules,
      });

      if (result.success && result.data) {
        // Guardar la sugerencia de tag aunque solo busquemos flujo
        if (result.data.recommendedTag) {
            addTagSuggestion({
                situation: context,
                tag: result.data.recommendedTag,
                severity: 'VERDE', // Valor por defecto ya que este flujo no da severidad
                justification: 'Identificado durante análisis de flujo.',
            });
        }

        if (result.data.matchedProcessTitle) {
          update({
            id: toastId,
            variant: 'default',
            title: '¡Flujo Localizado!',
            description: `Se encontró el proceso: ${result.data.matchedProcessTitle}. Abriendo ahora...`,
          });
          handleOpenProcess(result.data.matchedProcessTitle);
        } else {
          update({
            id: toastId,
            variant: 'default',
            title: 'Análisis completado',
            description: 'No se localizó un proceso específico.',
          });
          setNoProcessAlertOpen(true);
        }
      } else {
        throw new Error(result.error || 'Error al analizar flujo.');
      }
    } catch (error: any) {
      update({
        id: toastId,
        variant: 'destructive',
        title: 'Error de IA',
        description: error.message,
      });
    } finally {
      setIsAnalyzingFlow(false);
    }
  };

  const handleSaveFromHistory = (item: AITemplate) => {
    const templateToSave: Omit<Template, 'id' | 'usageCount' | 'createdAt'> = {
      title: item.title,
      content: item.content,
      category: 'IA Analizada',
      isQuick: false,
      tags: item.suggestedTags,
    };
    setEditingTemplate(templateToSave as Template);
    setEditDialogOpen(true);
  }

  const handleOpenProcess = async (title?: string) => {
    if (!title) return;
    const process = knowledgeBase.find(p => p.title.toLowerCase().trim() === title.toLowerCase().trim());
    
    if (!process) {
        toast({
            variant: 'destructive',
            title: 'Proceso no encontrado',
            description: `No se encontró el proceso "${title}" en la base de conocimientos.`
        });
        return;
    }

    // Si ya es un JSON de flujo, lo abrimos directamente
    if (process.description.trim().startsWith('{')) {
        setViewingProcess(process);
        setProcessViewOpen(true);
        return;
    }

    // Si es texto plano, lo mapeamos a flujo interactivo
    setIsMappingFlow(process.id);
    const { id: toastId, update } = toast({
        title: 'Estructurando flujo interactivo...',
        description: 'La IA está diseñando el protocolo dinámico.',
    });

    try {
        const result = await mapProcess({
            processDescription: process.description,
            existingProcesses: knowledgeBase,
        });

        if (result.success && result.data) {
            const updated = { ...process, description: result.data.description };
            updateProcess(updated);
            
            update({
                id: toastId,
                title: '¡Flujo Estructurado!',
                description: 'El proceso ahora es interactivo.',
                variant: 'default',
            });

            setViewingProcess(updated);
            setProcessViewOpen(true);
        } else {
            throw new Error(result.error || 'No se pudo generar el flujo.');
        }
    } catch (error: any) {
        update({
            id: toastId,
            title: 'Error de IA',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsMappingFlow(null);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setIsLoading(false);
      setIsSuggestingTag(false);
      setIsAnalyzingFlow(false);
      setIsMappingFlow(null);
      setTimeout(() => {
        if (document.querySelectorAll('[role="dialog"]').length === 0) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
      }, 100);
    }
  };

  const severityBadgeColors = {
    VERDE: 'bg-green-100 text-green-800 border-green-200',
    AMARILLO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ROJO: 'bg-red-100 text-red-800 border-red-200',
  };

  const renderTime = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (!isValid(date)) return null;
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Sparkles className="text-primary h-5 w-5" />
                Asistente de Soporte IA
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Analiza el contexto o genera plantillas empáticas.
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRulesDialogOpen(true)} className="gap-2 h-8 text-xs">
               <Settings2 className="h-4 w-4" />
               Reglas de Tags
            </Button>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-lg font-semibold">Contexto</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setAnalysisHistoryOpen(true)} className="h-7 gap-1 text-[10px] sm:text-xs">
                    <MessageSquareText className="h-3 w-3 text-primary" />
                    Historial
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setTagHistoryOpen(true)} className="h-7 gap-1 text-[10px] sm:text-xs">
                    <History className="h-3 w-3 text-blue-500" />
                    Tags
                  </Button>
                </div>
              </div>
              <Form {...form}>
                <form className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="context"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: 'El pasajero dice que el conductor fue grosero y cobró de más...'"
                            className="min-h-[150px] sm:min-h-[200px] text-sm"
                            {...field}
                            disabled={isLoading || isSuggestingTag || isAnalyzingFlow}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      onClick={() => handleAiAction('analyze')} 
                      disabled={isLoading || isSuggestingTag || isAnalyzingFlow} 
                      className="bg-primary hover:bg-primary/90 h-9 text-[10px] sm:text-xs px-2"
                    >
                      {isLoading && !isAnalyzingFlow ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Analizar
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleOnlySuggestTag} 
                      disabled={isLoading || isSuggestingTag || isAnalyzingFlow} 
                      className="border-blue-200 hover:bg-blue-50 text-blue-700 h-9 text-[10px] sm:text-xs px-2"
                    >
                      {isSuggestingTag ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Tag className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Solo Tag
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleAiAction('generate')} 
                      disabled={isLoading || isSuggestingTag || isAnalyzingFlow}
                      className="border-slate-200 hover:bg-slate-50 h-9 text-[10px] sm:text-xs px-2"
                    >
                      {isLoading && !isAnalyzingFlow ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Plantilla
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleAnalyzeFlow} 
                      disabled={isLoading || isSuggestingTag || isAnalyzingFlow}
                      className="border-amber-200 hover:bg-amber-50 text-amber-700 h-9 text-[10px] sm:text-xs px-2"
                    >
                      {isAnalyzingFlow ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Workflow className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Analizar Flujo
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm sm:text-lg font-semibold">Resultados Recientes</h3>
              {aiHistory.length > 0 ? (
                <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
                  <div className="space-y-3 sm:space-y-4">
                    {aiHistory.map((item) => (
                      <Card key={item.id} className="bg-muted/30 border-primary/10 relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                          onClick={() => deleteAiHistory(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-4 flex flex-row items-start justify-between space-y-0 pr-8 sm:pr-10">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm sm:text-base truncate pr-2">{item.title}</CardTitle>
                            {item.createdAt && (
                              <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                                {isValid(new Date(item.createdAt)) ? renderTime(item.createdAt) : 'Recientemente'}
                              </span>
                            )}
                          </div>
                          {item.recommendedTag && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[8px] sm:text-[10px] px-1.5 py-0 flex items-center gap-1 shrink-0">
                               <Tag className="h-2 w-2 sm:h-3 sm:w-3" />
                               {item.recommendedTag}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="pb-3 sm:pb-4 px-3 sm:px-4 space-y-2 sm:space-y-3">
                          {item.summary && item.summary !== 'Generación directa de plantilla.' && (
                            <div className="bg-white/50 p-1.5 sm:p-2 rounded border border-primary/5">
                                <p className="text-[8px] sm:text-[10px] uppercase font-bold text-primary tracking-wider mb-0.5">Resumen:</p>
                                <p className="text-[10px] sm:text-xs italic text-slate-700 leading-tight">{item.summary}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Propuesta:</p>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-snug">{item.content}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <Button size="sm" variant="ghost" className="h-7 sm:h-8 text-[10px] sm:text-xs px-2" onClick={() => copy(item.content)}>
                              <Copy className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Copiar
                            </Button>
                            
                            {item.summary !== 'Generación directa de plantilla.' && (
                              item.matchedProcessTitle ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 border-blue-200 text-blue-700 hover:bg-blue-50" 
                                  onClick={() => handleOpenProcess(item.matchedProcessTitle)}
                                  disabled={isMappingFlow !== null}
                                >
                                    {isMappingFlow === knowledgeBase.find(p => p.title.toLowerCase() === item.matchedProcessTitle?.toLowerCase())?.id ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <PlayCircle className="mr-1.5 h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                                    )}
                                    Proceso
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled
                                  className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 border-red-200 text-red-600 bg-red-50"
                                >
                                    <AlertCircle className="mr-1.5 h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" /> Sin Flujo
                                </Button>
                              )
                            )}

                            <Button size="sm" variant="outline" className="h-7 sm:h-8 text-[10px] sm:text-xs px-2" onClick={() => handleSaveFromHistory(item)}>
                              <Save className="mr-1.5 h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" /> Guardar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                  <Info className="h-8 w-8 text-muted-foreground mb-2 opacity-30" />
                  <p className="text-muted-foreground text-xs sm:text-sm">No hay resultados recientes. Describe una situación para comenzar.</p>
                </div>
              )}
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Pop-up de alerta cuando no se localiza proceso */}
      <AlertDialog open={isNoProcessAlertOpen} onOpenChange={setNoProcessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Proceso No Encontrado
            </AlertDialogTitle>
            <AlertDialogDescription>
              No se localizó un proceso específico en la base de conocimientos que concuerde con esta situación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setNoProcessAlertOpen(false)}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Historial de Mensajes Analizados */}
      <Dialog open={isAnalysisHistoryOpen} onOpenChange={setAnalysisHistoryOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareText className="text-primary h-5 w-5" />
              Historial Completo de Análisis
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] mt-4 pr-2 sm:pr-4">
            {aiHistory.length > 0 ? (
              <div className="space-y-4">
                {aiHistory.map((item) => (
                  <Card key={item.id} className="bg-slate-50 border-slate-200 relative group">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={() => deleteAiHistory(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between pr-12">
                      <div className="flex items-center gap-2">
                         <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
                            {item.title}
                         </Badge>
                         {item.recommendedTag && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {item.recommendedTag}
                            </Badge>
                         )}
                      </div>
                      {item.createdAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {isValid(new Date(item.createdAt)) ? renderTime(item.createdAt) : 'Recientemente'}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="pb-4 space-y-4 px-3 sm:px-6">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tight mb-1">Mensaje Original:</p>
                        <p className="text-xs text-slate-600 line-clamp-3 bg-white p-2 rounded border border-slate-100 italic">"{item.context}"</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-primary tracking-tight mb-1">Análisis:</p>
                          <p className="text-sm text-slate-800 font-medium leading-tight">{item.summary}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight mb-1">Respuesta:</p>
                          <p className="text-sm text-slate-600 line-clamp-3 leading-snug">{item.content}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end pt-2 gap-2">
                         {item.summary !== 'Generación directa de plantilla.' && (
                            item.matchedProcessTitle ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50" 
                                onClick={() => handleOpenProcess(item.matchedProcessTitle)}
                                disabled={isMappingFlow !== null}
                              >
                                  {isMappingFlow === knowledgeBase.find(p => p.title.toLowerCase() === item.matchedProcessTitle?.toLowerCase())?.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                      <PlayCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Ver Flujo
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                disabled
                                className="h-8 text-xs border-red-200 text-red-600 bg-red-50 opacity-100"
                              >
                                  <AlertCircle className="mr-2 h-4 w-4" /> Sin Flujo
                              </Button>
                            )
                         )}
                         <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => copy(item.content)}>
                            <Copy className="mr-2 h-4 w-4" /> Copiar Respuesta
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <MessageSquareText className="h-8 w-8 mb-2 opacity-20" />
                <p>No hay mensajes analizados aún.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal de Historial de Tags */}
      <Dialog open={isTagHistoryOpen} onOpenChange={setTagHistoryOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="text-blue-500 h-5 w-5" />
              Sugerencias de Tags
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] mt-4 pr-2 sm:pr-4">
            {tagSuggestions.length > 0 ? (
              <div className="space-y-4">
                {tagSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="bg-slate-50 border-slate-200 relative group">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={() => deleteTagSuggestion(suggestion.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between pr-12">
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {suggestion.tag}
                         </Badge>
                         <Badge variant="secondary" className={cn("text-[9px] sm:text-[10px]", severityBadgeColors[suggestion.severity])}>
                            {suggestion.severity}
                         </Badge>
                      </div>
                      {suggestion.createdAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {isValid(new Date(suggestion.createdAt)) ? renderTime(suggestion.createdAt) : 'Recientemente'}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="pb-4 px-3 sm:px-6">
                      <p className="text-[10px] font-semibold mb-1 text-slate-500 uppercase tracking-tight">Situación:</p>
                      <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 mb-3 bg-white p-2 rounded border border-slate-100 italic">"{suggestion.situation}"</p>
                      <p className="text-[10px] font-semibold mb-1 text-slate-500 uppercase tracking-tight">Justificación:</p>
                      <p className="text-xs sm:text-sm text-slate-600 leading-tight">{suggestion.justification}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Tag className="h-8 w-8 mb-2 opacity-20" />
                <p>No hay historial de tags sugeridos.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isRulesDialogOpen} onOpenChange={setRulesDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reglas de Etiquetas e IA</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Instruye a la IA sobre cuándo usar cada tag y qué procesos recomendar.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 sm:py-4">
             <Textarea
               placeholder="Ej: Tag 'Accidente': usar cuando el cliente reporta choque. Gravedad: Roja."
               className="min-h-[250px] sm:min-h-[300px] text-sm"
               value={tagRules}
               onChange={(e) => setTagRules(e.target.value)}
             />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={() => setRulesDialogOpen(false)} className="w-full sm:w-auto h-9 text-sm">Guardar Reglas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditTemplateDialog
        template={editingTemplate}
        allTemplates={templates}
        open={isEditDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={(values) => {
          if (editingTemplate) {
            addTemplate(values);
            toast({ title: 'Plantilla Guardada', variant: 'success' });
          }
          setEditDialogOpen(false);
          setEditingTemplate(null);
        }}
        isNew
      />

      {viewingProcess && (
          <ViewProcessDialog 
            process={viewingProcess}
            open={isProcessViewOpen}
            onOpenChange={setProcessViewOpen}
          />
      )}
    </>
  );
}
