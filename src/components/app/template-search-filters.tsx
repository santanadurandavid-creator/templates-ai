'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import type { Template } from '@/lib/types';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TemplateSearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  templates: Template[];
  onAddNew: () => void;
}

export function TemplateSearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  templates,
  onAddNew,
}: TemplateSearchAndFiltersProps) {
  const categories = useMemo(() => {
    const allCategories = templates.map((t) => t.category?.trim()).filter(Boolean);
    const uniqueCategories = Array.from(new Set(allCategories)).sort((a, b) => a.localeCompare(b));
    return ['All', ...uniqueCategories];
  }, [templates]);

  return (
    <div className="flex flex-row gap-2 items-center w-full">
      <div className="relative flex-1 flex items-center">
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-9 h-8 text-[11px] sm:text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[110px] sm:w-[150px] h-8 text-[11px] sm:text-xs">
            <SelectValue placeholder="Cat." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category, index) => (
              <SelectItem key={`${category}-${index}`} value={category} className="text-xs">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={onAddNew}
          className="h-8 w-8 shrink-0 border-accent/20 text-accent hover:bg-accent/10"
          title="Añadir Nueva Plantilla"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
