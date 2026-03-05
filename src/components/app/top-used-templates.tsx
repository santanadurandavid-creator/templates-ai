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
    onHide: () => void;
}

export function TopUsedTemplates({ templates, isLoading, onCopy, onHide }: TopUsedTemplatesProps) {
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
                            <CarouselItem key={index} className="basis-[23%] sm:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex flex-col h-28 items-start justify-between p-3">
                                            <Skeleton className="h-3 w-16 rounded-full" />
                                            <Skeleton className="h-4 w-4/5 mt-1" />
                                            <Skeleton className="h-4 w-24 mt-2" />
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        );
    }

    if (topTemplates.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold tracking-tight">Top 7 Usadas</h2>
                <Button variant="ghost" size="icon" onClick={onHide} className="h-7 w-7">
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
                        <CarouselItem key={template.id} className="basis-[23%] sm:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Card
                                    className="hover:shadow-md transition-shadow cursor-pointer h-full border-accent/10"
                                    onClick={() => onCopy(template.content, template.title, template.id)}
                                >
                                    <CardContent className="flex flex-col h-28 items-start justify-between p-3 select-none">
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1">{template.category}</Badge>
                                        <div className="flex-1 mt-1 w-full overflow-hidden">
                                            <p className="font-bold text-xs truncate leading-tight" title={template.title}>{template.title}</p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
                                                {template.content}
                                            </p>
                                        </div>
                                        <div className="text-[9px] text-muted-foreground/70 font-medium">{template.usageCount} usos</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
