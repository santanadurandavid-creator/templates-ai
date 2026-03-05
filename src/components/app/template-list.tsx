'use client';

import type { Template } from '@/lib/types';
import { TemplateCard } from './template-card';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface TemplateListProps {
  templates: Template[];
  isLoading: boolean;
  onCopy: (content: string, title: string, id: string) => void;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onRephrase: (template: Template) => void;
  onShowHistory: (template: Template) => void;
  onAddNew: () => void;
}

export function TemplateList({ templates, isLoading, onCopy, onEdit, onDelete, onRephrase, onShowHistory, onAddNew }: TemplateListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-5 w-1/5" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex justify-end mt-4">
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {templates.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onCopy={onCopy}
              onEdit={() => onEdit(template)}
              onDelete={onDelete}
              onRephrase={onRephrase}
              onShowHistory={onShowHistory}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <p className="text-muted-foreground text-sm">No se encontraron plantillas. ¡Intenta con otra búsqueda o crea una nueva!</p>
        </Card>
      )}
    </div>
  );
}
