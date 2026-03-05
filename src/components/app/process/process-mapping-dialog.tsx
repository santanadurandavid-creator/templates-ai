'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mapProcess, type MapProcessOutput } from '@/ai/flows/map-process-flow';
import type { KnowledgeProcess } from '@/lib/types';

interface ProcessMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcessMapped: (mappedData: MapProcessOutput) => void;
  existingProcesses: KnowledgeProcess[];
}

export function ProcessMappingDialog({
  open,
  onOpenChange,
  onProcessMapped,
  existingProcesses,
}: ProcessMappingDialogProps) {
  const [processDescription, setProcessDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStructureProcess = async () => {
    if (!processDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Texto vacío',
        description: 'Por favor, pega el contenido que quieres estructurar.',
      });
      return;
    }

    setIsLoading(true);
    const { id: toastId, update } = toast({ title: 'Analizando y estructurando con IA...' });

    try {
      const result = await mapProcess({
        processDescription,
        existingProcesses,
      });

      if (result.success && result.data) {
        update({ id: toastId, title: '¡Proceso Estructurado!', description: 'Revisa y guarda el nuevo proceso.' });
        onProcessMapped(result.data);
      } else {
        throw new Error(result.error || 'No se pudo procesar el texto.');
      }
    } catch (error: any) {
      update({
        id: toastId,
        title: 'Error de IA',
        description: error.message,
        variant: 'destructive',
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setProcessDescription('');
      setIsLoading(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={"sm:max-w-2xl" as any}>
        <DialogHeader>
          <DialogTitle className={"flex items-center gap-2" as any}>
            <Sparkles className="text-amber-500" />
            Mapeo de Proceso Inteligente
          </DialogTitle>
          <DialogDescription>
            Pega aquí tus notas desordenadas, un correo, o una transcripción. La IA lo convertirá en un proceso estructurado.
          </DialogDescription>
        </DialogHeader>
        <div className={"py-4" as any}>
          <Textarea
            placeholder="Pega aquí tus notas desordenadas, un correo o instrucciones rápidas..."
            className="min-h-[250px] text-base"
            value={processDescription}
            onChange={(e) => setProcessDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleStructureProcess} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Estructurando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Estructurar y Crear
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
