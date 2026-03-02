'use client';

import { useState, useMemo } from 'react';
import { useFollowUps } from '@/hooks/use-follow-ups';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, CalendarIcon, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { followUps, toggleFollowUpStatus, isLoading } = useFollowUps();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filteredFollowUps = useMemo(() => {
    if (!selectedDate) {
      return followUps;
    }
    return followUps.filter(followUp => {
      if (!followUp.createdAt) return false;
      return format(new Date(followUp.createdAt), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    });
  }, [followUps, selectedDate]);

  const sortedFollowUps = [...filteredFollowUps].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  });

  const handleToggle = (id: string) => {
    toggleFollowUpStatus(id);
  };
  
  if (isLoading) {
    return <div className="container mx-auto p-4 md:p-6 text-center">Cargando seguimientos...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 md:pl-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
            <UserCheck className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Seguimientos de Casos</h1>
        </div>

        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={es}
                />
                </PopoverContent>
            </Popover>
            {selectedDate && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>

      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Seguimientos</CardTitle>
          <CardDescription>
            {selectedDate 
              ? `Mostrando seguimientos para el ${format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}.`
              : "Aquí puedes ver y gestionar los casos pendientes que has registrado."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Estado</TableHead>
                <TableHead>Proceso</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>URL del Caso</TableHead>
                <TableHead>Fecha de Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFollowUps.length > 0 ? (
                sortedFollowUps.map(followUp => (
                  <TableRow key={followUp.id}>
                    <TableCell>
                       <Checkbox
                        id={`check-${followUp.id}`}
                        checked={followUp.status === 'done'}
                        onCheckedChange={() => handleToggle(followUp.id)}
                        aria-label={`Marcar como ${followUp.status === 'done' ? 'pendiente' : 'realizado'}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{followUp.processTitle || '-'}</TableCell>
                     <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                        {followUp.description}
                    </TableCell>
                    <TableCell>
                      <Link href={followUp.caseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">
                        {followUp.caseUrl}
                      </Link>
                    </TableCell>
                     <TableCell>
                       {followUp.createdAt ? format(new Date(followUp.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es }) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay seguimientos registrados {selectedDate ? 'para esta fecha' : ''}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
