'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

export default function JirasPage() {
  return (
    <div className="container mx-auto p-4 md:pl-24 flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Ticket className="h-6 w-6" />
                    Gestión de Tickets (Jira)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">La integración con Jira para la gestión de tickets estará disponible próximamente.</p>
            </CardContent>
        </Card>
    </div>
  )
}
