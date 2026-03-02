'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { KnowledgeProcess } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { mapProcess } from "@/ai/flows/map-process-flow";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
    title: z.string().min(3, "El título es requerido"),
    tag: z.string().min(2, "La etiqueta es requerida"),
    description: z.string().min(10, "La descripción es requerida"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProcessDialogProps {
    process: KnowledgeProcess | null;
    allProcesses: KnowledgeProcess[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (values: FormValues, id?: string) => void;
    onDelete: (id: string) => void;
}

export function EditProcessDialog({ process, allProcesses, open, onOpenChange, onSave, onDelete }: EditProcessDialogProps) {
    const [isTagPopoverOpen, setTagPopoverOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            tag: '',
            description: ''
        }
    });

    const tags = Array.from(new Set(allProcesses.map(p => p.tag).filter(Boolean)));

    useEffect(() => {
        if (open) {
            form.reset(process ? { title: process.title, tag: process.tag, description: process.description } : { title: '', tag: '', description: '' });
        }
    }, [open, process, form]);

    const handleFormSubmit = (data: FormValues) => {
        onSave(data, process?.id);
    };

    const handleRegenerate = async () => {
        const currentDescription = form.getValues('description');
        if (!currentDescription || currentDescription.length < 10) {
            toast({
                variant: 'destructive',
                title: 'Contenido insuficiente',
                description: 'La descripción es demasiado corta para regenerar un flujo.',
            });
            return;
        }

        setIsRegenerating(true);
        const { id: toastId, update } = toast({ title: 'Regenerando flujo con IA...' });

        try {
            const result = await mapProcess({
                processDescription: currentDescription,
                existingProcesses: allProcesses,
            });

            if (result.success && result.data) {
                form.setValue('description', result.data.description);
                if (!form.getValues('title')) form.setValue('title', result.data.title);
                if (!form.getValues('tag')) form.setValue('tag', result.data.tag);

                update({
                    id: toastId,
                    title: '¡Flujo regenerado!',
                    description: 'La IA ha generado una nueva estructura para este proceso.',
                });
            } else {
                throw new Error(result.error || 'Error al regenerar el flujo.');
            }
        } catch (error: any) {
            update({
                id: toastId,
                variant: 'destructive',
                title: 'Error de regeneración',
                description: error.message,
            });
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{process ? 'Editar Proceso' : 'Nuevo Proceso'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título del Proceso</FormLabel>
                                    <FormControl><Input placeholder="Título del Proceso" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Etiqueta (Tag)</FormLabel>
                                    <Popover open={isTagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? tags.find(
                                                            (tag) => tag === field.value
                                                        ) || field.value
                                                        : "Seleccionar etiqueta"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Buscar o crear etiqueta..."
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        field.onChange(e.target.value);
                                                    }}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró la etiqueta. Se creará una nueva.</CommandEmpty>
                                                    <CommandGroup>
                                                        <ScrollArea className="h-48">
                                                            {tags.map((tag) => (
                                                                <CommandItem
                                                                    value={tag}
                                                                    key={tag}
                                                                    onSelect={() => {
                                                                        form.setValue("tag", tag);
                                                                        setTagPopoverOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            tag === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {tag}
                                                                </CommandItem>
                                                            ))}
                                                        </ScrollArea>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Descripción / Pasos</FormLabel>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                            onClick={handleRegenerate}
                                            disabled={isRegenerating}
                                        >
                                            {isRegenerating ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-3 w-3" />
                                            )}
                                            Regenerar flujo (IA)
                                        </Button>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe los pasos detalladamente..."
                                            className="min-h-[200px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            {process && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button" variant="destructive" className="mr-auto">
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción es permanente y no se puede deshacer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(process.id)}>Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
