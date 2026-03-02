'use client';

import React, { useState } from 'react';
import { TreeData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';

interface ProcessWizardProps {
  data: TreeData;
}

export function ProcessWizard({ data }: ProcessWizardProps) {
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
      case 'question': return 'bg-[#e8f0fe] text-[#1967d2]';
      case 'process': return 'bg-[#fef9e0] text-[#b06000]';
      case 'end': return currentNode.variant === 'ok' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#fce8e6] text-[#c5221f]';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getBorderColor = () => {
    switch (currentNode.type) {
      case 'question': return 'bg-[#1a73e8]';
      case 'process': return 'bg-[#f9ab00]';
      case 'end': return currentNode.variant === 'ok' ? 'bg-[#1e8e3e]' : 'bg-[#d93025]';
      default: return 'bg-slate-300';
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
    <div className="flex flex-col h-full bg-[#f5f6fa] font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-10 mb-20 overflow-hidden">
        <Card
          className={cn(
            "w-full max-w-[520px] p-10 shadow-2xl rounded-2xl border border-[#e8eaed] bg-white relative overflow-hidden transition-all duration-300",
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
          <h2 className="text-[22px] font-bold text-[#202124] leading-[1.4] mb-2">
            {currentNode.title}
          </h2>

          {/* Hint / Description */}
          {currentNode.hint && (
            <p className="text-[13px] text-[#80868b] leading-[1.5] mb-8">
              {currentNode.hint}
            </p>
          )}

          {/* Process Steps */}
          {currentNode.type === 'process' && (
            <div className="flex flex-col gap-3 mb-7">
              {currentNode.steps?.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-[#f8f9fa] rounded-lg">
                  <div className="w-[22px] h-[22px] bg-[#f9ab00] text-white flex items-center justify-center text-[11px] font-bold rounded-full shrink-0 mt-[1px]">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-[#3c4043] leading-[1.5]">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* End Message */}
          {currentNode.type === 'end' && (
            <div className="text-[14px] text-[#5f6368] leading-[1.6]">
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
                      className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-[#e8eaed] bg-white text-[14px] font-medium text-[#202124] text-left flex items-center gap-3 relative transition-all hover:border-[#1e8e3e] hover:bg-[#f5fbf6] hover:translate-y-[-1px] group"
                      onClick={() => handleNext(currentNode.yes!)}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-[#e6f4ea] flex items-center justify-center text-[16px]">✓</div>
                      <span>Sí</span>
                      <span className="absolute right-4 text-[18px] text-[#dadce0] group-hover:text-[#1e8e3e] group-hover:right-3 transition-all">›</span>
                    </button>
                    <button
                      className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-[#e8eaed] bg-white text-[14px] font-medium text-[#202124] text-left flex items-center gap-3 relative transition-all hover:border-[#d93025] hover:bg-[#fef7f7] hover:translate-y-[-1px] group"
                      onClick={() => handleNext(currentNode.no!)}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-[#fce8e6] flex items-center justify-center text-[16px]">✗</div>
                      <span>No</span>
                      <span className="absolute right-4 text-[18px] text-[#dadce0] group-hover:text-[#d93025] group-hover:right-3 transition-all">›</span>
                    </button>
                  </>
                ) : (
                  currentNode.options?.map((opt, i) => (
                    <button
                      key={i}
                      className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-[#e8eaed] bg-white text-[14px] font-medium text-[#202124] text-left flex items-center gap-3 relative transition-all hover:border-[#1a73e8] hover:bg-[#f8fbff] hover:translate-y-[-1px] group"
                      onClick={() => handleNext(opt.next)}
                    >
                      <div className="w-[34px] h-[34px] rounded-lg bg-[#e8f0fe] flex items-center justify-center text-[16px]">{opt.icon}</div>
                      <span>{opt.label}</span>
                      <span className="absolute right-4 text-[18px] text-[#dadce0] group-hover:text-[#1a73e8] group-hover:right-3 transition-all">›</span>
                    </button>
                  ))
                )}
              </>
            )}

            {currentNode.type === 'process' && currentNode.next && (
              <button
                className="w-full p-3.5 px-5 rounded-xl border-[1.5px] border-[#e8eaed] bg-white text-[14px] font-medium text-[#202124] text-left flex items-center gap-3 relative transition-all hover:border-[#1e8e3e] hover:bg-[#f5fbf6] hover:translate-y-[-1px] group"
                onClick={() => handleNext(currentNode.next!)}
              >
                <div className="w-[34px] h-[34px] rounded-lg bg-[#e6f4ea] flex items-center justify-center text-[16px]">✓</div>
                <span>Pasos completados — Continuar</span>
                <span className="absolute right-4 text-[18px] text-[#dadce0] group-hover:text-[#1e8e3e] group-hover:right-3 transition-all">›</span>
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8eaed] p-3.5 px-8 flex items-center gap-3 z-[100]">
        <button
          className="flex items-center gap-1.5 p-2 px-4 border-[1.5px] border-[#e8eaed] rounded-lg bg-white text-[13px] font-medium text-[#5f6368] transition-all hover:border-[#bdc1c6] hover:text-[#202124] disabled:opacity-30 disabled:pointer-events-none"
          onClick={handleBack}
          disabled={history.length === 0 || isAnimating}
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button
          className="ml-auto flex items-center gap-1.5 p-2 px-4 border-none rounded-lg bg-[#f1f3f4] text-[13px] font-medium text-[#5f6368] transition-all hover:bg-[#e8eaed] hover:text-[#202124]"
          onClick={handleRestart}
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
    </div>
  );
}
