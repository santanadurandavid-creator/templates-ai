'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Template, RephrasedTemplate } from '@/lib/types';
import { Button } from '../ui/button';
import { Copy, History, Loader2, Sparkles } from 'lucide-react';
import { useRephraseHistory } from '@/hooks/use-rephrase-history';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { rephraseTemplate } from '@/ai/flows/rephrase-template-flow';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface RephraseHistorySheetProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RephraseHistorySheet({ template, open, onOpenChange }: RephraseHistorySheetProps) {
  const { getHistoryForTemplate, addRephraseHistory } = useRephraseHistory();
  const [isLoading, setIsLoading] = useState(false);
  const { copy } = useCopyToClipboard();
  const { toast } = useToast();

  const history = template ? getHistoryForTemplate(template.id) : [];

  const handleGenerate = async () => {
    if (!template) return;

    setIsLoading(true);
    const { id: toastId, update } = toast({ title: 'Generando nueva versión...' });

    onOpenChange(false); // Close sheet to prevent blocking UI

    try {
      const result = await rephraseTemplate({ title: template.title, content: template.content });
      if (result.success && result.data) {
        addRephraseHistory({
          originalTemplateId: template.id,
          originalContent: template.content,
          rephrasedContent: result.data.rephrasedContent,
        });
        update({ id: toastId, title: '¡Nueva versión generada!', description: 'Puedes verla en el historial.' });
      } else {
        throw new Error(result.error || 'Respuesta inválida de la IA');
      }
    } catch (error: any) {
      update({ id: toastId, variant: 'destructive', title: 'Error de IA', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={"sm:max-w-xl flex flex-col" as any}>
        <SheetHeader>
          <SheetTitle className={"flex items-center gap-2" as any}>
            <History />
            Historial de Parafraseo
          </SheetTitle>
          <SheetDescription>
            Revisa las versiones de la IA para "{template?.title}". Cada vez que generas una nueva, se guarda aquí.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <Card className={"bg-slate-50 flex-shrink-0" as any}>
            <CardHeader className="pb-2">
              <CardTitle className='text-base'>Original</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{template?.content}</p>
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} disabled={isLoading || !template} className={"w-full flex-shrink-0" as any}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Generar nueva versión y cerrar
          </Button>
        </div>

        <Separator />

        <div className="flex-grow flex flex-col min-h-0">
          <h3 className="font-semibold text-lg flex-shrink-0 mb-4">Versiones Generadas</h3>
          <ScrollArea className={"flex-grow pr-4 -mr-4" as any}>
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map(item => (
                  <Card key={item.id}>
                    <CardHeader className='py-3'>
                      <CardDescription>
                        Generado {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='pt-0 pb-3'>
                      <p className="text-sm">{item.rephrasedContent}</p>
                      <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy(item.rephrasedContent)}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  No hay versiones generadas para esta plantilla.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
