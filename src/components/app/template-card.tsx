'use client';

import type { Template } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, MoreVertical, Edit, History, MessageSquareQuote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface TemplateCardProps {
  template: Template;
  onCopy: (content: string, title: string, id: string) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onRephrase: (template: Template) => void;
  onShowHistory: (template: Template) => void;
}

export function TemplateCard({ template, onCopy, onEdit, onDelete, onRephrase, onShowHistory }: TemplateCardProps) {

  const handleDropdownSelect = (e: Event) => {
    e.preventDefault();
  };

  return (
    <Card
      className="flex flex-col cursor-pointer transition-shadow hover:shadow-md border-accent/10"
      onClick={() => onCopy(template.content, template.title, template.id)}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start gap-1">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-bold truncate leading-tight">{template.title}</CardTitle>
            <div className="mt-1 flex items-center">
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-accent/20 text-accent/80 font-medium">{template.category}</Badge>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuItem onSelect={() => onEdit(template)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onRephrase(template)}>
                  <MessageSquareQuote className="mr-2 h-4 w-4" />
                  <span>Parafrasear (Rápido)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onShowHistory(template)}>
                  <History className="mr-2 h-4 w-4" />
                  <span>Historial de Parafraseo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={handleDropdownSelect} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la plantilla.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(template.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1.5 flex-1">
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {template.content}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags && template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-[9px] h-4 px-1">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
