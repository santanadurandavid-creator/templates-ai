'use client';
import { useState, useMemo } from 'react';
import { useKnowledgeBase } from '@/hooks/use-knowledge-base';
import type { KnowledgeProcess } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PenLine, Plus, Search, Sparkles, Workflow, Loader2, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewProcessDialog } from '@/components/app/process/view-process-dialog';
import { EditProcessDialog } from '@/components/app/process/edit-process-dialog';
import { SuggestStepsDialog } from '@/components/app/process/suggest-steps-dialog';
import { ProcessMappingDialog } from '@/components/app/process/process-mapping-dialog';
import { mapProcess } from '@/ai/flows/map-process-flow';
import { useToast } from '@/hooks/use-toast';

export default function ProcessPage() {
    const { knowledgeBase, isLoading, addProcess, updateProcess, deleteProcess } = useKnowledgeBase();
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const [viewingProcess, setViewingProcess] = useState<KnowledgeProcess | null>(null);
    const [editingProcess, setEditingProcess] = useState<KnowledgeProcess | null>(null);
    const [isGeneratingFlowId, setIsGeneratingFlowId] = useState<string | null>(null);

    const [isViewDialogOpen, setViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isSuggestStepsDialogOpen, setSuggestStepsDialogOpen] = useState(false);
    const [isMappingDialogOpen, setMappingDialogOpen] = useState(false);

    const filteredKnowledgeBase = useMemo(() => {
        if (!searchTerm) return knowledgeBase;
        return knowledgeBase.filter(
            (process) =>
                process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                process.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                process.tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [knowledgeBase, searchTerm]);

    const handleOpenViewDialog = (process: KnowledgeProcess) => {
        setViewingProcess(process);
        setViewDialogOpen(true);
    };

    const handleViewFlow = async (process: KnowledgeProcess) => {
        // Verificar si ya es un JSON de flujo
        if (process.description.trim().startsWith('{')) {
            handleOpenViewDialog(process);
            return;
        }

        // Si es texto, generarlo con IA
        setIsGeneratingFlowId(process.id);
        const { id: toastId, update } = toast({
            title: 'Generando flujo interactivo...',
            description: 'La IA está estructurando el proceso.',
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
                    title: '¡Flujo generado!',
                    description: 'El proceso ahora es interactivo.',
                    variant: 'default',
                });

                setViewingProcess(updated);
                setViewDialogOpen(true);
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
            setIsGeneratingFlowId(null);
        }
    };

    const handleOpenEditDialog = (process: KnowledgeProcess | null) => {
        setEditingProcess(process);
        setEditDialogOpen(true);
    };

    const handleSaveProcess = (values: Omit<KnowledgeProcess, 'id'>, id?: string) => {
        if (id) {
            updateProcess({ ...values, id });
        } else {
            addProcess(values);
        }
        setEditDialogOpen(false);
    };

    const handleDeleteProcess = (id: string) => {
        deleteProcess(id);
        setEditDialogOpen(false);
    }

    const handleProcessMapped = (mappedData: Omit<KnowledgeProcess, 'id'>) => {
        setMappingDialogOpen(false);
        setEditingProcess(mappedData as KnowledgeProcess);
        setEditDialogOpen(true);
    };

    const handleRegenerateFlow = async () => {
        if (!viewingProcess) return;

        setIsGeneratingFlowId(viewingProcess.id);
        const { id: toastId, update } = toast({
            title: 'Regenerando flujo...',
            description: 'La IA está rediseñando el protocolo.',
        });

        try {
            const result = await mapProcess({
                processDescription: viewingProcess.description,
                existingProcesses: knowledgeBase,
            });

            if (result.success && result.data) {
                const updated = { ...viewingProcess, description: result.data.description };
                updateProcess(updated);

                update({
                    id: toastId,
                    title: '¡Flujo Regenerado!',
                    description: 'El diseño del proceso ha sido actualizado.',
                    variant: 'default',
                });

                setViewingProcess(updated);
            } else {
                throw new Error(result.error || 'No se pudo regenerar el flujo.');
            }
        } catch (error: any) {
            update({
                id: toastId,
                title: 'Error de IA',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingFlowId(null);
        }
    };

    return (
        <>
            <div className="container mx-auto p-4 md:pl-24">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-2xl font-bold text-primary">Base de Conocimientos</h1>

                    <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap justify-end">
                        <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-64">
                            <Input
                                placeholder="Buscar procesos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => handleOpenEditDialog(null)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => setSuggestStepsDialogOpen(true)} className="gap-2 h-8 text-xs">
                            <Workflow className="h-3.5 w-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Sugerir Pasos</span>
                        </Button>
                        <Button variant="outline" onClick={() => setMappingDialogOpen(true)} className="gap-2 h-8 text-xs">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span className="hidden sm:inline">Mapear (IA)</span>
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[215px] w-full" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {filteredKnowledgeBase.map(process => (
                            <Card
                                key={process.id}
                                className="group hover:shadow-lg transition-all flex flex-col justify-between relative h-[215px] border-accent/10"
                            >
                                <CardHeader className="p-3 pb-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-sm sm:text-base leading-tight line-clamp-2">{process.title}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditDialog(process);
                                            }}
                                        >
                                            <PenLine className="h-3.5 w-3.5 text-slate-500" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-3 pb-1 overflow-hidden">
                                    <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">
                                        {process.description.trim().startsWith('{')
                                            ? "Flujo interactivo estructurado."
                                            : process.description
                                        }
                                    </p>
                                </CardContent>
                                <CardFooter className="p-3 pt-1 flex flex-col gap-2">
                                    <div className="flex justify-between items-center w-full">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[9px] h-4 py-0">
                                            {process.tag}
                                        </Badge>
                                    </div>
                                    <Button
                                        className="w-full h-8 gap-2 text-xs font-semibold"
                                        onClick={() => handleViewFlow(process)}
                                        disabled={isGeneratingFlowId === process.id}
                                    >
                                        {isGeneratingFlowId === process.id ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                <span>IA...</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="h-3 w-3" />
                                                Ver Flujo
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
                {filteredKnowledgeBase.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-semibold">No se encontraron procesos</h3>
                        <p className="text-muted-foreground">Intenta con otra búsqueda o añade un nuevo proceso.</p>
                    </div>
                )}
            </div>

            {viewingProcess && (
                <ViewProcessDialog
                    process={viewingProcess}
                    open={isViewDialogOpen}
                    onOpenChange={setViewDialogOpen}
                    onRegenerate={handleRegenerateFlow}
                    isRegenerating={isGeneratingFlowId === viewingProcess.id}
                />
            )}

            <EditProcessDialog
                process={editingProcess}
                allProcesses={knowledgeBase}
                open={isEditDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={handleSaveProcess}
                onDelete={handleDeleteProcess}
            />

            <SuggestStepsDialog
                open={isSuggestStepsDialogOpen}
                onOpenChange={setSuggestStepsDialogOpen}
            />

            <ProcessMappingDialog
                open={isMappingDialogOpen}
                onOpenChange={setMappingDialogOpen}
                onProcessMapped={handleProcessMapped}
                existingProcesses={knowledgeBase}
            />
        </>
    );
}
