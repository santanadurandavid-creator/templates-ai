'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Template } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Badge } from '../ui/badge';
import { X, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Switch } from '../ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  content: z.string().min(10, { message: 'El contenido es requerido.' }),
  category: z.string().min(2, { message: 'La categoría es requerida.' }),
  tags: z.array(z.string()),
  isQuick: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTemplateDialogProps {
  template: Template | null;
  allTemplates: Template[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FormValues) => void;
  isNew?: boolean;
}

export function EditTemplateDialog({ template, allTemplates, open, onOpenChange, onSave, isNew = false }: EditTemplateDialogProps) {
  const [tagInput, setTagInput] = useState('');
  const [isCategoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'General',
      tags: [],
      isQuick: false,
    },
  });

  // Get unique categories from all templates, trimmed and sorted
  const categories = useMemo(() => {
    const existingCategories = allTemplates
      .map(t => t.category?.trim())
      .filter(Boolean);

    // Add some default categories if not present
    const defaults = ['Saludo', 'Despedida', 'Empatía', 'Proceso', 'Ventas', 'Soporte', 'General'];
    const combined = [...new Set([...existingCategories, ...defaults])];

    return combined.sort((a, b) => a.localeCompare(b));
  }, [allTemplates]);

  useEffect(() => {
    if (open) {
      if (template) {
        form.reset({
          title: template.title || '',
          content: template.content || '',
          category: template.category || 'General',
          tags: template.tags || [],
          isQuick: template.isQuick || false,
        });
      } else if (isNew) {
        form.reset({
          title: '',
          content: '',
          category: 'General',
          tags: [],
          isQuick: false,
        });
      }
      setCategorySearch('');
    }
  }, [open, template, isNew, form]);

  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, []);


  const tags = form.watch('tags');

  const onSubmit = (values: FormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...new Set([...tags, tagInput.trim()])];
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);

    // Safety check: ensure body is unlocked when closing
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isNew ? 'Crear Nueva Plantilla' : 'Editar Plantilla'}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Añade una nueva plantilla a tu colección.' : 'Realiza cambios a tu plantilla.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Categoría</FormLabel>
                  <Popover open={isCategoryPopoverOpen} onOpenChange={setCategoryPopoverOpen} modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Seleccionar categoría"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto"
                      align="start"
                      side="bottom"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                    >
                      <Command>
                        <CommandInput
                          placeholder="Buscar o crear categoría..."
                          value={categorySearch}
                          onValueChange={setCategorySearch}
                        />
                        <CommandList className="max-h-[220px] overflow-y-auto">
                          <CommandGroup heading="Resultados">
                            {categorySearch && !categories.includes(categorySearch) && (
                              <CommandItem
                                value={categorySearch}
                                onSelect={() => {
                                  form.setValue("category", categorySearch);
                                  setCategoryPopoverOpen(false);
                                }}
                                className="cursor-pointer gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Crear "{categorySearch}"</span>
                              </CommandItem>
                            )}
                            {categories.map((category) => (
                              <CommandItem
                                value={category}
                                key={category}
                                onSelect={() => {
                                  form.setValue("category", category);
                                  setCategoryPopoverOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {category}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandEmpty className="p-4 text-xs text-muted-foreground">
                            No se encontraron categorías.
                          </CommandEmpty>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Escribe un tag y presiona Enter"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button type="button" className="ml-2" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name="isQuick"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Plantilla Rápida</FormLabel>
                    <DialogDescription>
                      Mostrar en la cuadrícula de acceso rápido.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
