'use client';

import React, { useState } from 'react';
import { TreeData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';

interface ProcessWizardProps {
  data: TreeData;
  onClose?: () => void;
}

export function ProcessWizard({ data, onClose }: ProcessWizardProps) {
  const [currentId, setCurrentId] = useState<string>('start');
  const [history, setHistory] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'in' | 'back' | 'out'>('in');

  const currentNode = data[currentId];

  if (!currentNode) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Error: No se pudo cargar el nodo "{currentId}".</p>
        <Button onClick={() => setCurrentId('start')} className="mt-4">Reiniciar</Button>
      </div>
    );
  }

  const handleNext = (nextId: string) => {
    setDirection('out');
    setIsAnimating(true);
    setTimeout(() => {
      setHistory(prev => [...prev, currentId]);
      setCurrentId(nextId);
      setDirection('in');
      setIsAnimating(false);
    }, 200);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    setDirection('out');
    setIsAnimating(true);
    setTimeout(() => {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentId(prevId);
      setDirection('back');
      setIsAnimating(false);
    }, 200);
  };

  const handleRestart = () => {
    setDirection('out');
    setIsAnimating(true);
    setTimeout(() => {
      setHistory([]);
      setCurrentId('start');
      setDirection('in');
      setIsAnimating(false);
    }, 200);
  };

  const getBadgeStyles = () => {
    switch (currentNode.type) {
      case 'question': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'process': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'end': return currentNode.variant === 'ok' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const getBorderColor = () => {
    switch (currentNode.type) {
      case 'question': return 'bg-blue-500';
      case 'process': return 'bg-amber-500';
      case 'end': return currentNode.variant === 'ok' ? 'bg-emerald-500' : 'bg-rose-500';
      default: return 'bg-slate-300 dark:bg-slate-700';
    }
  };

  const getBadgeLabel = () => {
    switch (currentNode.type) {
      case 'question': return 'Pregunta';
      case 'process': return 'Proceso';
      case 'end': return currentNode.variant === 'ok' ? 'Resultado' : 'Alerta';
      default: return 'Nodo';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-10 mb-20 overflow-hidden">
        <Card
          className={cn(
            "w-full max-w-[520px] p-6 sm:p-10 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden transition-all duration-300",
            direction === 'in' && "animate-in slide-in-from-right-12 fade-in duration-300",
            direction === 'back' && "animate-in slide-in-from-left-12 fade-in duration-300",
            direction === 'out' && "animate-out slide-out-to-left-12 fade-out duration-200",
            isAnimating && "pointer-events-none"
          )}
        >
          {/* Accent Line */}
          <div className={cn("absolute top-0 left-0 right-0 h-[3px]", getBorderColor())} />

          {/* Type Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.8px] px-2.5 py-1 rounded-full mb-6",
            getBadgeStyles()
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {getBadgeLabel()}
          </div>

          {/* Icon for end nodes */}
          {currentNode.type === 'end' && currentNode.icon && (
            <div className="text-5xl mb-4 leading-none">{currentNode.icon}</div>
          )}

          {/* Title */}
          <h2 className="text-xl sm:text-[22px] font-bold text-foreground leading-[1.4] mb-2">
            {currentNode.title}
          </h2>

          {/* Hint / Description */}
          {currentNode.hint && (
            <p className="text-[13px] text-muted-foreground leading-[1.5] mb-8">
              {currentNode.hint}
            </p>
          )}

          {/* Process Steps */}
          {currentNode.type === 'process' && (
            <div className="flex flex-col gap-3 mb-7">
              {currentNode.steps?.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="w-[22px] h-[22px] bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold rounded-full shrink-0 mt-[1px]">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-[1.5]">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* End Message */}
          {currentNode.type === 'end' && (
            <div className="text-[14px] text-slate-600 dark:text-slate-400 leading-[1.6]">
              {currentNode.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2.5 mt-8">
            {currentNode.type === 'question' && (
              <>
                {currentNode.yes && currentNode.no ? (
                  <>
                    <button
                      className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[14px] font-medium text-slate-900 dark:text-slate-100 text-left flex items-center gap-3 relative transition-all hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:translate-y-[-1px] group"
                      onClick={() => handleNext(currentNode.yes!)}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[16px]">✓</div>
                      <span>Sí</span>
                      <span className="absolute right-4 text-[18px] text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-all">›</span>
                    </button>
                    <button
                      className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[14px] font-medium text-slate-900 dark:text-slate-100 text-left flex items-center gap-3 relative transition-all hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:translate-y-[-1px] group"
                      onClick={() => handleNext(currentNode.no!)}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-[16px]">✗</div>
                      <span>No</span>
                      <span className="absolute right-4 text-[18px] text-slate-300 dark:text-slate-700 group-hover:text-rose-500 transition-all">›</span>
                    </button>
                  </>
                ) : (
                  currentNode.options?.map((opt, i) => (
                    <button
                      key={i}
                      className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[14px] font-medium text-slate-900 dark:text-slate-100 text-left flex items-center gap-3 relative transition-all hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:translate-y-[-1px] group"
                      onClick={() => handleNext(opt.next)}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[16px]">{opt.icon}</div>
                      <span>{opt.label}</span>
                      <span className="absolute right-4 text-[18px] text-slate-300 dark:text-slate-700 group-hover:text-blue-500 transition-all">›</span>
                    </button>
                  ))
                )}
              </>
            )}

            {currentNode.type === 'process' && currentNode.next && (
              <button
                className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[14px] font-medium text-slate-900 dark:text-slate-100 text-left flex items-center gap-3 relative transition-all hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:translate-y-[-1px] group"
                onClick={() => handleNext(currentNode.next!)}
              >
                <div className="w-[34px] h-[34px] rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[16px]">✓</div>
                <span>Pasos completados — Continuar</span>
                <span className="absolute right-4 text-[18px] text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-all">›</span>
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3.5 px-4 sm:px-8 flex items-center gap-2 sm:gap-3 z-[100]">
        <button
          className="flex items-center gap-1.5 p-2 px-3 sm:px-4 border border-border rounded-lg bg-background text-[12px] sm:text-[13px] font-medium text-muted-foreground transition-all hover:border-slate-400 dark:hover:border-slate-600 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none shrink-0"
          onClick={handleBack}
          disabled={history.length === 0 || isAnimating}
        >
          <ArrowLeft className="h-4 w-4" /> <span className="hidden xs:inline">Atrás</span>
        </button>

        <button
          className="flex items-center gap-1.5 p-2 px-3 sm:px-4 border-none rounded-lg bg-rose-100 dark:bg-rose-900/30 text-[12px] sm:text-[13px] font-medium text-rose-700 dark:text-rose-400 transition-all hover:bg-rose-200 dark:hover:bg-rose-900/50"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              const closeBtn = document.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLButtonElement;
              if (closeBtn) closeBtn.click();
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }
          }}
        >
          <RotateCcw className="h-4 w-4 rotate-45" /> Cerrar
        </button>

        <button
          className="ml-auto flex items-center gap-1.5 p-2 px-3 sm:px-4 border-none rounded-lg bg-accent text-[12px] sm:text-[13px] font-medium text-accent-foreground transition-all hover:bg-accent/80 shrink-0"
          onClick={handleRestart}
        >
          <RotateCcw className="h-4 w-4" /> <span className="hidden xs:inline">Reiniciar</span>
        </button>
      </div>
    </div>
  );
}
