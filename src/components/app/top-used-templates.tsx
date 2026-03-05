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
                            <CarouselItem key={index} className="basis-[23.5%] sm:basis-1/2 lg:basis-1/3 pl-1">
                                <div>
                                    <Card>
                                        <CardContent className="flex flex-col h-[70px] items-start justify-center p-2">
                                            <Skeleton className="h-3 w-16 rounded-full" />
                                            <Skeleton className="h-4 w-4/5 mt-1" />
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
            <Carousel
                opts={{
                    align: 'start',
                    loop: topTemplates.length > 3
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-1">
                    {topTemplates.map((template) => (
                        <CarouselItem key={template.id} className="basis-[23.5%] sm:basis-1/2 lg:basis-1/3 pl-1">
                            <div>
                                <Card
                                    className="hover:shadow-md transition-shadow cursor-pointer h-full border-accent/10"
                                    onClick={() => onCopy(template.content, template.title, template.id)}
                                >
                                    <CardContent className="flex flex-col h-[70px] items-start justify-center p-2 select-none overflow-hidden">
                                        <div className="flex items-center justify-between w-full mb-0.5">
                                            <Badge variant="secondary" className="text-[8px] h-3 px-1 leading-none">{template.category}</Badge>
                                            <span className="text-[8px] text-muted-foreground/60">{template.usageCount}u</span>
                                        </div>
                                        <p className="font-bold text-[11px] truncate w-full leading-tight" title={template.title}>{template.title}</p>
                                        <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5 leading-none opacity-80">
                                            {template.content}
                                        </p>
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
