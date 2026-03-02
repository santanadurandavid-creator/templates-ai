'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { suggestTagsForTemplate, type SuggestTagsForTemplateOutput } from "@/ai/flows/suggest-tags-for-template";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTagRules } from "@/hooks/use-tag-rules";

interface SuggestStepsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SuggestStepsDialog({ open, onOpenChange }: SuggestStepsDialogProps) {
    const [clientMessage, setClientMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<SuggestTagsForTemplateOutput | null>(null);
    const [notFound, setNotFound] = useState(false);
    const { toast } = useToast();
    const { tagRules } = useTagRules();

    const handleSuggest = async () => {
        setIsLoading(true);
        setSuggestion(null);
        setNotFound(false);
        const { id: toastId, update } = toast({ title: 'Analizando con IA...' });

        const result = await suggestTagsForTemplate({ 
          situation: clientMessage,
          tagRules: tagRules 
        });
        
        setIsLoading(false);

        if (result.success && result.data) {
            setSuggestion(result.data);
            update({ id: toastId, title: '¡Sugerencia recibida!' });
        } else {
            setNotFound(true);
            update({ id: toastId, title: 'Error de IA', description: result.error, variant: 'destructive' });
        }
    };

    const resetState = () => {
        setClientMessage('');
        setSuggestion(null);
        setNotFound(false);
        setIsLoading(false);
    }
    
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetState();
        }
        onOpenChange(isOpen);
    }
    
    const severityColors = {
        VERDE: 'bg-green-100 text-green-800 border-green-200',
        AMARILLO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        ROJO: 'bg-red-100 text-red-800 border-red-200',
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Sparkles className="text-blue-500" />Sugerencia de Pasos con IA</DialogTitle>
                    <DialogDescription>
                        Pega el mensaje del cliente. La IA lo clasificará basándose en tus reglas de etiquetas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mensaje del Cliente</label>
                        <Textarea
                            placeholder="Ej: 'El conductor fue grosero y tomó una ruta más larga para cobrarme de más...'"
                            className="min-h-[120px] bg-slate-50"
                            value={clientMessage}
                            onChange={(e) => setClientMessage(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {suggestion && (
                        <Alert className="bg-slate-50 border-slate-200">
                          <Tag className="h-4 w-4" />
                          <AlertTitle className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">Tag: {suggestion.tag}</span>
                             <Badge className={cn("px-3 py-1", severityColors[suggestion.severity])}>
                                Severidad: {suggestion.severity}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-4 pt-3 border-t border-slate-200">
                            <span className="block text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Análisis de la situación:</span>
                            <p className="text-sm italic text-slate-700">"{suggestion.justification}"</p>
                          </AlertDescription>
                        </Alert>
                    )}

                    {notFound && (
                         <Alert variant="destructive">
                          <Terminal className="h-4 w-4" />
                          <AlertTitle>No se encontró un proceso</AlertTitle>
                          <AlertDescription>
                            No se pudo clasificar el incidente. Revisa que tu API Key sea correcta o intenta con otro mensaje.
                          </AlertDescription>
                        </Alert>
                    )}

                </div>
                <DialogFooter>
                    <Button onClick={handleSuggest} disabled={isLoading || !clientMessage} className="w-full sm:w-auto">
                        {isLoading ? (
                            <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando... </>
                        ) : (
                            <> <Sparkles className="mr-2 h-4 w-4" /> Sugerir Clasificación </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
