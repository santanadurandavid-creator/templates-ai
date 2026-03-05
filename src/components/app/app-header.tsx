'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Search, UserCheck, Upload, Download, Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AITemplateModal } from './ai-template-modal';
import { ImportExport } from './import-export';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { eventBus } from '@/lib/utils';
import { useAppSettings } from '@/hooks/use-app-settings';
import { FollowUpDialog } from './follow-up-dialog';

export function AppHeader() {
  const [isAiModalOpen, setAiModalOpen] = useState(false);
  const [isFollowUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, toggleTheme } = useAppSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddQuickTemplate = () => {
    eventBus.dispatch('open-quick-template-dialog');
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-8 items-center justify-end px-4">
        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
          <div className="flex items-center space-x-1">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center px-1.5 sm:px-2 h-7 rounded-md hover:bg-accent/10 transition-colors text-[10px] sm:text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Search className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Cuentas</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buscador de Cuentas</DialogTitle>
                </DialogHeader>
                <Input placeholder="Buscar cuenta... (placeholder)" />
              </DialogContent>
            </Dialog>
            <button onClick={() => setFollowUpModalOpen(true)} className="flex items-center px-1.5 sm:px-2 h-7 rounded-md hover:bg-accent/10 transition-colors text-[10px] sm:text-xs font-medium text-muted-foreground hover:text-foreground">
              <UserCheck className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Seguimientos</span>
            </button>
            <ImportExport />
          </div>

          <AITemplateModal open={isAiModalOpen} onOpenChange={setAiModalOpen}>
            <Button size="sm" className="h-7 text-[10px] sm:text-xs px-2 sm:px-3">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Generador IA</span>
              <span className="inline sm:hidden">IA</span>
            </Button>
          </AITemplateModal>

          {/* Botón de tema claro/oscuro */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-7 w-7 transition-colors hover:bg-accent/10 hover:text-accent"
            title={mounted ? (isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro') : 'Cargando tema...'}
          >
            {mounted ? (
              isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" /> // Placeholder to avoid hydration mismatch
            )}
          </Button>

        </div>
      </div>

      <FollowUpDialog open={isFollowUpModalOpen} onOpenChange={setFollowUpModalOpen} />
    </header>
  );
}
