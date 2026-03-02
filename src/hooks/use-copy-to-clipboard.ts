'use client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = async (text: string) => {
    if (!navigator?.clipboard) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La API del portapapeles no está disponible.',
      });
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      // Removed the generic toast from here to allow for custom toasts
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      toast({
        variant: 'destructive',
        title: 'Error al copiar',
        description: 'No se pudo copiar el texto.',
      });
      setCopiedText(null);
      return false;
    }
  };

  return { copiedText, copy };
}
