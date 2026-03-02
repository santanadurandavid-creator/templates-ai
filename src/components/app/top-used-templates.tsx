'use client';

import type { Template } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '../ui/button';
import { EyeOff } from 'lucide-react';

interface TopUsedTemplatesProps {
  templates: Template[];
  isLoading: boolean;
  onCopy: (content: string, title: string, id: string) => void;
}

export function TopUsedTemplates({ templates, isLoading, onCopy }: TopUsedTemplatesProps) {
  const [isVisible, setIsVisible] = useLocalStorage('show-top-used', true);

  const topTemplates = templates
    .filter(t => t.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 7);
    
  if (isLoading) {
    return (
       <div className="w-full">
            <Carousel opts={{ align: "start", loop: false }}>
                <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index} className="basis-full sm:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Card>
                                    <CardContent className="flex flex-col h-32 items-start justify-between p-4">
                                        <Skeleton className="h-4 w-24 rounded-full" />
                                        <Skeleton className="h-5 w-4/5 mt-2" />
                                        <Skeleton className="h-4 w-3/5 mt-1" />
                                        <Skeleton className="h-8 w-24 mt-4" />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
    );
  }


  if (topTemplates.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="w-full">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">Top 7 Usadas</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-8 w-8">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
            </Button>
        </div>
        <Carousel
            opts={{
              align: 'start',
              loop: topTemplates.length > 3
            }}
            className="w-full"
        >
            <CarouselContent>
            {topTemplates.map((template) => (
                <CarouselItem key={template.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                    <Card
                        className="hover:shadow-md transition-shadow cursor-pointer h-full"
                        onClick={() => onCopy(template.content, template.title, template.id)}
                    >
                    <CardContent className="flex flex-col h-32 items-start justify-between p-4">
                        <Badge variant="secondary">{template.category}</Badge>
                        <div className="flex-1 mt-2">
                            <p className="font-semibold text-lg">{template.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {template.content}
                            </p>
                        </div>
                        <div className="text-xs text-muted-foreground">Usada {template.usageCount} veces</div>
                    </CardContent>
                    </Card>
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex"/>
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    </div>
  );
}
