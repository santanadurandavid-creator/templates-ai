'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFollowUpProcesses } from '@/hooks/use-follow-up-processes';
import { useFollowUps } from '@/hooks/use-follow-ups';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Settings } from 'lucide-react';
import type { FollowUpProcess } from '@/lib/types';
import { ManageFollowUpProcessesDialog } from './manage-follow-up-processes-dialog';
import { Textarea } from '../ui/textarea';

interface FollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  caseUrl: z.string().url({ message: 'Por favor, introduce una URL válida.' }),
  processId: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function FollowUpDialog({ open, onOpenChange }: FollowUpDialogProps) {
  const [selectedProcess, setSelectedProcess] = useState<FollowUpProcess | null>(null);
  const { followUpProcesses, isLoading: isLoadingProcesses } = useFollowUpProcesses();
  const { addFollowUp } = useFollowUps();
  const { toast } = useToast();
  const [isManageDialogOpen, setManageDialogOpen] = useState(false);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseUrl: '',
      processId: undefined,
      description: '',
    },
  });

  const processId = form.watch('processId');

  useEffect(() => {
    if (processId) {
      const process = followUpProcesses.find(p => p.id === processId);
      setSelectedProcess(process || null);
    } else {
      setSelectedProcess(null);
    }
  }, [processId, followUpProcesses]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setSelectedProcess(null);

      // Safety check: ensure body is unlocked when closing
      setTimeout(() => {
        if (document.querySelectorAll('[role="dialog"]').length === 0) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
      }, 100);
    }
    onOpenChange(isOpen);
  }

  const onSubmit = (values: FormValues) => {
    const process = values.processId ? followUpProcesses.find(p => p.id === values.processId) : null;

    addFollowUp({
      caseUrl: values.caseUrl,
      processId: process?.id || '',
      processTitle: process?.title || '',
      processDescription: process?.description || '',
      description: values.description,
    });

    toast({
      title: 'Seguimiento Guardado',
      description: 'El caso ha sido añadido al dashboard.',
    });

    handleOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Seguimiento</DialogTitle>
            <DialogDescription>
              Añade un nuevo caso para darle seguimiento desde el dashboard.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="caseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Caso</FormLabel>
                    <FormControl>
                      <Input placeholder="Pega la URL del ticket o caso aquí..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Adicional (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Añade notas o un resumen del caso..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Proceso a Seguir (Opcional)</FormLabel>
                  <Button variant="outline" size="sm" type="button" onClick={() => setManageDialogOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Gestionar Procesos
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="processId"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={isLoadingProcesses}>
                            {isLoadingProcesses ? <Loader2 className="animate-spin mr-2" /> : null}
                            <SelectValue placeholder="Selecciona un proceso..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {followUpProcesses.length > 0 ? (
                            followUpProcesses.map(process => (
                              <SelectItem key={process.id} value={process.id}>
                                {process.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No hay procesos. Añade uno para empezar.</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedProcess && (
                <div className="space-y-2 rounded-md border bg-muted/50 p-4">
                  <h4 className="font-semibold text-sm">Descripción del Proceso Seleccionado:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProcess.description}</p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Guardar Seguimiento</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ManageFollowUpProcessesDialog
        open={isManageDialogOpen}
        onOpenChange={setManageDialogOpen}
      />
    </>
  );
}
