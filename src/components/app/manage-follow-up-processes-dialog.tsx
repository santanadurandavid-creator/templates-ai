'use client';

import { useState } from 'react';
import { useFollowUpProcesses } from '@/hooks/use-follow-up-processes';
import type { FollowUpProcess } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const processSchema = z.object({
  title: z.string().min(3, 'El título es requerido'),
  description: z.string().min(10, 'La descripción es requerida'),
});

interface ManageFollowUpProcessesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageFollowUpProcessesDialog({ open, onOpenChange }: ManageFollowUpProcessesDialogProps) {
  const { followUpProcesses, addProcess, updateProcess, deleteProcess, isLoading } = useFollowUpProcesses();
  const [editingProcess, setEditingProcess] = useState<FollowUpProcess | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof processSchema>>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleEdit = (process: FollowUpProcess) => {
    setEditingProcess(process);
    form.reset({
      title: process.title,
      description: process.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingProcess(null);
    form.reset({ title: '', description: '' });
  };

  const handleDelete = (id: string) => {
    deleteProcess(id);
    toast({ title: 'Proceso eliminado', variant: 'destructive' });
  };

  const onSubmit = (values: z.infer<typeof processSchema>) => {
    if (editingProcess) {
      updateProcess({ ...editingProcess, ...values });
      toast({ title: 'Proceso actualizado' });
    } else {
      addProcess(values);
      toast({ title: 'Proceso añadido' });
    }
    handleCancelEdit();
  };

  const handleOpenChangeInternal = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        if (document.querySelectorAll('[role="dialog"]').length === 0) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestionar Procesos de Seguimiento</DialogTitle>
          <DialogDescription>
            Añade, edita o elimina los procesos que aparecerán en el selector de seguimientos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">{editingProcess ? 'Editar Proceso' : 'Añadir Nuevo Proceso'}</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Proceso</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Escalado de Caso Urgente" {...field} />
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
                      <FormLabel>Descripción / Pasos</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe los pasos del proceso..." {...field} className="min-h-[150px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end">
                  {editingProcess && (
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit">
                    {editingProcess ? 'Guardar Cambios' : 'Añadir Proceso'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Procesos Existentes</h3>
            <ScrollArea className="h-72">
              <div className="space-y-2 pr-4">
                {isLoading ? (
                  <p>Cargando procesos...</p>
                ) : followUpProcesses.length > 0 ? (
                  followUpProcesses.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                      <span className="font-medium text-sm truncate pr-2">{p.title}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center pt-8">No hay procesos guardados.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
