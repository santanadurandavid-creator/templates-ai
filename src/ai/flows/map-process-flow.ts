'use server';

/**
 * @fileOverview This file defines a Genkit flow to map unstructured text to a structured interactive decision tree.
 *
 * - mapProcess - A function that handles the process mapping.
 * - MapProcessInput - The input type for the mapProcess function.
 * - MapProcessOutput - The return type for the mapProcess function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MapProcessInputSchema = z.object({
  processDescription: z.string().describe('El texto crudo o desordenado que describe un proceso.'),
  existingProcesses: z.array(z.object({
    title: z.string(),
    tag: z.string(),
    description: z.string(),
  })).optional().describe('Lista de procesos existentes para aprender el formato.'),
});
export type MapProcessInput = z.infer<typeof MapProcessInputSchema>;

const MapProcessOutputSchema = z.object({
  title: z.string().describe('Un título corto y profesional.'),
  tag: z.string().describe('Una etiqueta de una sola palabra.'),
  description: z.string().describe('El árbol de decisión estructurado en formato JSON string.'),
});
export type MapProcessOutput = z.infer<typeof MapProcessOutputSchema>;

export async function mapProcess(
  input: MapProcessInput
): Promise<{ success: boolean; data?: MapProcessOutput, error?: string }> {
  try {
    const output = await mapProcessFlow(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error in mapProcess flow', error);
    return { success: false, error: error.message || 'Error al mapear el proceso.' };
  }
}

const prompt = ai.definePrompt({
  name: 'mapProcessPrompt',
  input: { schema: MapProcessInputSchema },
  output: { schema: MapProcessOutputSchema },
  prompt: `Eres un Analista de Procesos Senior. Tu objetivo es convertir texto desordenado en un PROTOCOLO INTERACTIVO (árbol de decisión).

**Instrucciones del Formato de Salida:**
Debes generar un objeto JSON en el campo 'description' que represente un árbol de decisión. El nodo inicial SIEMPRE debe llamarse "start".

Estructura de los nodos:
1. 'question': Requiere 'title', 'hint' (opcional), y ya sea ('yes' y 'no' apuntando a otros IDs de nodos) o una lista de 'options' (cada una con 'label', 'icon' y 'next').
2. 'process': Requiere 'title', una lista de 'steps' (strings) y un 'next' apuntando al siguiente nodo.
3. 'end': Requiere 'variant' ("ok" o "warn"), 'icon', 'title' y 'message'.

Ejemplo de JSON para 'description':
{
  "start": { "type": "question", "title": "¿El cliente tiene el recibo?", "yes": "validar", "no": "pedir_datos" },
  "validar": { "type": "process", "title": "Validación", "steps": ["Check fecha", "Check monto"], "next": "fin_ok" },
  "pedir_datos": { "type": "end", "variant": "warn", "icon": "⚠️", "title": "Sin recibo", "message": "No se puede proceder." },
  "fin_ok": { "type": "end", "variant": "ok", "icon": "✅", "title": "Listo", "message": "Proceso completado." }
}

Convierte el siguiente texto en este formato estructurado:
{{{processDescription}}}

Devuelve el JSON como una cadena de texto (string) pura dentro del campo 'description'. NO incluyas introducciones, ni bloques de código markdown, ni texto explicativo antes o después del JSON. Solo el objeto JSON.`,
});

const mapProcessFlow = ai.defineFlow(
  {
    name: 'mapProcessFlow',
    inputSchema: MapProcessInputSchema,
    outputSchema: MapProcessOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
