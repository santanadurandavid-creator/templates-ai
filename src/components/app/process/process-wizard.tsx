'use client';

import React, { useState, useEffect } from 'react';
import { TreeData, TreeNode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, RotateCcw, Check, X, ChevronRight } from 'lucide-react';

interface ProcessWizardProps {
  data: TreeData;
}

export function ProcessWizard({ data }: ProcessWizardProps) {
  const [currentId, setCurrentId] = useState<string>('start');
  const [history, setHistory] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'in' | 'back'>('in');

  const currentNode = data[currentId];

  if (!currentNode) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Error: No se pudo cargar el inicio del protocolo.</p>
        <Button onClick={() => setCurrentId('start')} className="mt-4">Reiniciar</Button>
      </div>
    );
  }

  const handleNext = (nextId: string) => {
    setDirection('in');
    setIsAnimating(true);
    setTimeout(() => {
      setHistory(prev => [...prev, currentId]);
      setCurrentId(nextId);
      setIsAnimating(false);
    }, 200);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    setDirection('back');
    setIsAnimating(true);
    setTimeout(() => {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentId(prevId);
      setIsAnimating(false);
    }, 200);
  };

  const handleRestart = () => {
    setDirection('in');
    setIsAnimating(true);
    setTimeout(() => {
      setHistory([]);
      setCurrentId('start');
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className="flex flex-col h-full min-h-[450px]">
      <div className="flex-grow flex items-center justify-center p-4">
        <div 
          className={cn(
            "w-full max-w-[520px] transition-all duration-300",
            isAnimating 
              ? (direction === 'in' ? "opacity-0 translate-x-12 scale-95" : "opacity-0 -translate-x-12 scale-95")
              : "opacity-100 translate-x-0 scale-100"
          )}
        >
          <Card className={cn(
            "relative overflow-hidden p-8 border-t-4 shadow-xl",
            currentNode.type === 'question' && "border-t-blue-500",
            currentNode.type === 'process' && "border-t-amber-500",
            currentNode.type === 'end' && (currentNode.variant === 'ok' ? "border-t-green-600" : "border-t-red-600")
          )}>
            {/* Badge */}
            <div className={cn(
              "inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6",
              currentNode.type === 'question' && "bg-blue-50 text-blue-600",
              currentNode.type === 'process' && "bg-amber-50 text-amber-600",
              currentNode.type === 'end' && (currentNode.variant === 'ok' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {currentNode.type === 'question' ? 'Pregunta' : currentNode.type === 'process' ? 'Proceso' : 'Resultado'}
            </div>

            {/* Content */}
            {currentNode.type === 'end' && currentNode.icon && (
              <span className="text-5xl block mb-4">{currentNode.icon}</span>
            )}

            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
              {currentNode.title}
            </h2>

            {currentNode.hint && (
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {currentNode.hint}
              </p>
            )}

            {currentNode.type === 'process' && (
              <div className="space-y-3 mb-8">
                 {currentNode.steps?.map((step, i) => (
                   <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                       {i + 1}
                     </div>
                     <p className="text-sm text-slate-700 leading-snug">{step}</p>
                   </div>
                 ))}
              </div>
            )}

            {currentNode.type === 'end' && (
              <p className="text-slate-600 leading-relaxed mb-4">
                {currentNode.message}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              {currentNode.type === 'question' && (
                <>
                  {currentNode.yes && currentNode.no ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-14 text-base font-medium border-2 hover:border-green-600 hover:bg-green-50 group transition-all"
                        onClick={() => handleNext(currentNode.yes!)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">✓</div>
                          Sí
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-green-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between h-14 text-base font-medium border-2 hover:border-red-600 hover:bg-red-50 group transition-all"
                        onClick={() => handleNext(currentNode.no!)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">✗</div>
                          No
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-red-600" />
                      </Button>
                    </>
                  ) : (
                    currentNode.options?.map((opt, i) => (
                      <Button 
                        key={i}
                        variant="outline" 
                        className="w-full justify-between h-14 text-base font-medium border-2 hover:border-blue-600 hover:bg-blue-50 group transition-all"
                        onClick={() => handleNext(opt.next)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">{opt.icon}</div>
                          {opt.label}
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                      </Button>
                    ))
                  )}
                </>
              )}

              {currentNode.type === 'process' && currentNode.next && (
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-14 text-base font-medium border-2 hover:border-green-600 hover:bg-green-50 group transition-all"
                  onClick={() => handleNext(currentNode.next!)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">✓</div>
                    Pasos completados — Continuar
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-green-600" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto border-t p-4 flex items-center gap-4 bg-white/80 backdrop-blur sticky bottom-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack} 
          disabled={history.length === 0 || isAnimating}
          className="gap-2 text-slate-500 font-medium h-10 px-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRestart} 
          disabled={isAnimating}
          className="ml-auto gap-2 text-slate-400 hover:text-slate-900 font-medium h-10 px-4"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
