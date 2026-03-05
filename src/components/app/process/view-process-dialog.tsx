'use client';

import type { KnowledgeProcess, TreeData } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessWizard } from "./process-wizard";
import { useMemo } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";

interface ViewProcessDialogProps {
    process: KnowledgeProcess;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
}

export function ViewProcessDialog({ process, open, onOpenChange, onRegenerate, isRegenerating }: ViewProcessDialogProps) {
    const treeData = useMemo(() => {
        if (!process?.description) return null;
        let content = process.description.trim();

        // Intentar encontrar el primer '{' y el último '}' para extraer solo el JSON
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            content = content.substring(startIdx, endIdx + 1);
        }

        try {
            return JSON.parse(content) as TreeData;
        } catch (e) {
            console.error("Error al parsear el árbol de decisión", e);
            return null;
        }
    }, [process?.description]);

    if (!process) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={treeData ? "sm:max-w-3xl p-0 h-[90vh] sm:h-auto overflow-hidden border-none shadow-2xl" : "sm:max-w-2xl"}>
                {/* Título de accesibilidad siempre presente */}
                <DialogHeader className={treeData ? "px-4 pt-4 pb-2 bg-background border-b z-20 flex flex-row items-center justify-between space-y-0" : "p-6 pb-2"}>
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <DialogTitle className={treeData ? "text-base font-bold text-foreground truncate" : "text-xl truncate"}>{process.title}</DialogTitle>
                        <DialogDescription className="sr-only">
                            Visualización del proceso: {process.title}
                        </DialogDescription>
                        {treeData && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-accent/20 text-accent font-medium">{process.tag}</Badge>
                            </div>
                        )}
                        {!treeData && (
                            <div className="pt-2">
                                <Badge variant="secondary">{process.tag}</Badge>
                            </div>
                        )}
                    </div>
                    {onRegenerate && (
                        <UIButton
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs gap-2 text-primary hover:bg-primary/5 shrink-0"
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                        >
                            {isRegenerating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">Regenerar Flujo</span>
                            <span className="sm:hidden">Regenerar</span>
                        </UIButton>
                    )}
                </DialogHeader>

                {treeData ? (
                    <div className="flex flex-col h-full bg-slate-50">
                        <div className="sr-only">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/10 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                </div>
                                <h2 className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">{process.title}</h2>
                            </div>
                            <Badge variant="outline" className="ml-2 shrink-0 border-accent/20 text-accent">{process.tag}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ProcessWizard data={treeData} />
                        </div>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[60vh] p-6 pr-10">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {process.description}
                        </p>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    )
}
