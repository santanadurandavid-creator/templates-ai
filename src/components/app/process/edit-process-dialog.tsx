'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { KnowledgeProcess } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
                                    <FormLabel>Descripción / Pasos</FormLabel>
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
