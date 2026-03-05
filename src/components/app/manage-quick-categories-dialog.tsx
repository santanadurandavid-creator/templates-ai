'use client';

import { useState } from 'react';
import type { Template } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2, Check, X } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

interface ManageQuickCategoriesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onRename: (oldName: string, newName: string) => void;
  onDelete: (categoryName: string) => void;
}

export function ManageQuickCategoriesDialog({
  isOpen,
  onOpenChange,
  templates,
  onRename,
  onDelete,
}: ManageQuickCategoriesDialogProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean))).sort();

  const handleStartEdit = (cat: string) => {
    setEditingCategory(cat);
    setNewName(cat);
  };

  const handleSave = () => {
    if (editingCategory && newName.trim() && newName !== editingCategory) {
      onRename(editingCategory, newName.trim());
    }
    setEditingCategory(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías Rápidas</DialogTitle>
          <DialogDescription>
            Cambia el nombre o elimina categorías enteras de tus notas rápidas.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] mt-4 pr-4">
          <div className="space-y-2">
            {categories.length > 0 ? (
              categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border">
                  {editingCategory === cat ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={handleSave}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setEditingCategory(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium">{cat}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStartEdit(cat)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminarán la categoría "{cat}" y TODAS las notas rápidas que contiene. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(cat)} className="bg-destructive text-destructive-foreground">Eliminar Todo</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay categorías que gestionar.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
