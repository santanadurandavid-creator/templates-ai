'use client';

import { useState } from 'react';
import { useLinks } from '@/hooks/use-links';
import type { Link } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink, Edit, Trash2, PlusCircle } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

const linkSchema = z.object({
  title: z.string().min(3, 'El título es requerido'),
  url: z.string().url('Debe ser una URL válida'),
});

interface LinkManagerProps {
  category: 'forms' | 'sheets';
}

export function LinkManager({ category }: LinkManagerProps) {
  const { links, addLink, updateLink, deleteLink, isLoading } = useLinks();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const categoryLinks = links.filter((link) => link.category === category);

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: '',
      url: '',
    },
  });

  const handleOpenDialog = (link: Link | null = null) => {
    setEditingLink(link);
    form.reset(link ? { title: link.title, url: link.url } : { title: '', url: '' });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof linkSchema>) => {
    if (editingLink) {
      updateLink({ ...editingLink, ...values });
    } else {
      addLink({ ...values, category });
    }
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
        <Card>
            <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-6" />
                <div className="space-y-4">
                    <div className="flex justify-between items-center"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-10" /></div>
                    <div className="flex justify-between items-center"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-5 w-10" /></div>
                    <div className="flex justify-between items-center"><Skeleton className="h-5 w-2/5" /><Skeleton className="h-5 w-10" /></div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Nuevo Link
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryLinks.length > 0 ? (
                categoryLinks.map((link) => (
                <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(link)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción eliminará el enlace permanentemente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteLink(link.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No hay links en esta categoría.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Editar Link' : 'Añadir Nuevo Link'}</DialogTitle>
            <DialogDescription>
              Introduce el título y la URL del enlace que quieres guardar.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Reporte de Ventas Q3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
