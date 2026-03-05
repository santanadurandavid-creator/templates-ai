'use client';

import type { Template } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Trash2, Edit, GripHorizontal } from 'lucide-react';
import React from 'react';
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
} from '../ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';

interface QuickTemplateButtonProps {
  template: Template;
  index: number;
  isEditMode: boolean;
  onCopy: (content: string, title: string, id: string) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}

const QuickTemplateButton: React.FC<QuickTemplateButtonProps> = ({ template, index, isEditMode, onCopy, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCopy = () => {
    if (isEditMode) return;
    onCopy(template.content, template.title, template.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCopy}
                style={{ backgroundColor: template.color || '#4A779D' }}
                className={cn(
                  'w-full p-0 text-lg font-bold text-white shadow-md transition-all aspect-square',
                  isEditMode ? 'cursor-default' : 'hover:brightness-110 cursor-pointer'
                )}
                {...(isEditMode ? {} : attributes)}
              >
                {index + 1}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-bold">{template.title}</p>
              <p className="text-muted-foreground line-clamp-2">{template.content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isEditMode && (
          <>
            <div className="absolute -top-2 -right-2 flex gap-1 z-10">
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 rounded-full shadow-sm border bg-background hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(template);
                }}
              >
                <Edit className="h-3 w-3 text-primary" />
              </Button>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 rounded-full shadow-sm border bg-background hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </AlertDialogTrigger>
            </div>

            <div
              {...attributes}
              {...listeners}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-md cursor-grab active:cursor-grabbing"
            >
              <GripHorizontal className="text-white h-6 w-6 drop-shadow-md" />
            </div>
          </>
        )}

        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla rápida?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{template.title}". Esta acción es permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(template.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface QuickTemplatesGridProps {
  templates: Template[];
  isLoading: boolean;
  isEditMode: boolean;
  onCopy: (content: string, title: string, id: string) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onReorder: (newTemplates: Template[]) => void;
}

export function QuickTemplatesGrid({ templates, isLoading, isEditMode, onCopy, onEdit, onDelete, onReorder }: QuickTemplatesGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="w-full aspect-square" />
        ))}
      </div>
    );
  }

  const seenIds = new Set();
  const uniqueTemplates = templates.filter((template) => {
    if (seenIds.has(template.id)) {
      return false;
    } else {
      seenIds.add(template.id);
      return true;
    }
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = uniqueTemplates.findIndex((t) => t.id === active.id);
      const newIndex = uniqueTemplates.findIndex((t) => t.id === over.id);

      const reordered = arrayMove(uniqueTemplates, oldIndex, newIndex);
      onReorder(reordered);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToFirstScrollableAncestor]}
    >
      <SortableContext
        items={uniqueTemplates.map(t => t.id)}
        strategy={rectSortingStrategy}
        disabled={!isEditMode}
      >
        <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-2">
          {uniqueTemplates.map((template, index) => (
            <QuickTemplateButton
              key={template.id}
              template={template}
              index={index}
              isEditMode={isEditMode}
              onCopy={onCopy}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
