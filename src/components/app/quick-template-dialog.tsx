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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  content: z.string().min(5, { message: 'El contenido es requerido.' }),
  category: z.string().min(2, { message: 'La categoría es requerida.' }),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickTemplateDialogProps {
  template: Template | null;
  allTemplates: Template[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FormValues) => void;
}

export function QuickTemplateDialog({ template, allTemplates, isOpen, onOpenChange, onSave }: QuickTemplateDialogProps) {
  const [isCategoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'Quick',
      color: '#4A779D',
    }
  });

  const quickCategories = useMemo(() => {
    const existing = allTemplates
      .filter(t => t.isQuick)
      .map(t => t.category?.trim())
      .filter(Boolean);
    // Ya no usamos categorías predeterminadas fijas, solo las que existen en las notas
    return [...new Set(existing)].sort((a, b) => a.localeCompare(b));
  }, [allTemplates]);

  useEffect(() => {
    if (isOpen) {
      setIsAddingNewCategory(false);
      if (template) {
        form.reset({
          title: template.title,
          content: template.content,
          category: template.category || 'Quick',
          color: template.color || '#4A779D',
        });
      } else {
        form.reset({
          title: '',
          content: '',
          category: 'Quick',
          color: '#4A779D',
        });
      }
      setCategorySearch('');
    }
  }, [template, isOpen, form]);

  const color = form.watch('color');

  const handleSave = (values: FormValues) => {
    onSave(values);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        if (document.querySelectorAll('[role="dialog"]').length === 0) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{template ? 'Editar' : 'Nueva'} Nota Rápida</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Saludo" {...field} />
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
                    <Textarea placeholder="Contenido a copiar..." className="min-h-[100px] font-mono" {...field} />
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
                  <div className="flex gap-2">
                    {isAddingNewCategory ? (
                      <FormControl>
                        <Input 
                          placeholder="Nombre de la nueva categoría..." 
                          {...field} 
                          autoFocus
                        />
                      </FormControl>
                    ) : (
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
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <div className="flex items-center border-b px-3 py-2">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                              placeholder="Buscar categoría..."
                              className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto p-1">
                            {quickCategories
                              .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                              .map((category) => (
                                <div
                                  key={category}
                                  className={cn(
                                    "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                    category === field.value && "bg-accent text-accent-foreground"
                                  )}
                                  onClick={() => {
                                    form.setValue("category", category);
                                    setCategoryPopoverOpen(false);
                                  }}
                                >
                                  <Check className={cn("h-4 w-4", category === field.value ? "opacity-100" : "opacity-0")} />
                                  {category}
                                </div>
                              ))}
                            {categorySearch && !quickCategories.some(c => c.toLowerCase() === categorySearch.toLowerCase()) && (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-xs gap-2 py-1.5 h-auto px-2"
                                    onClick={() => {
                                        form.setValue("category", categorySearch);
                                        setCategoryPopoverOpen(false);
                                    }}
                                >
                                    <Plus className="h-3 w-3" />
                                    Añadir "{categorySearch}"
                                </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        setIsAddingNewCategory(!isAddingNewCategory);
                        if (!isAddingNewCategory) form.setValue('category', 'Quick');
                      }}
                      title={isAddingNewCategory ? "Volver a la lista" : "Añadir nueva categoría"}
                    >
                      {isAddingNewCategory ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color del Botón</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-24 p-1 h-10 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: color }} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar Nota</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
