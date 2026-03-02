'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { Template } from '@/lib/types';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TemplateSearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  templates: Template[];
}

export function TemplateSearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  templates,
}: TemplateSearchAndFiltersProps) {
  const categories = useMemo(() => {
    const allCategories = templates.map((t) => t.category?.trim()).filter(Boolean);
    const uniqueCategories = Array.from(new Set(allCategories)).sort((a, b) => a.localeCompare(b));
    return ['All', ...uniqueCategories];
  }, [templates]);

  return (
    <div className="flex flex-row gap-2 sm:gap-4 items-center">
      <div className="relative w-1/2 flex items-center">
        <Input
          type="search"
          placeholder="Buscar plantillas..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>
      <div className="w-1/2">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category, index) => (
              <SelectItem key={`${category}-${index}`} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
