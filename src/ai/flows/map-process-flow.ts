'use server';

/**
 * @fileOverview Flow to map unstructured text to a structured interactive decision tree using Mistral AI.
 */

import { callMistralAI } from '@/ai/genkit';

export interface MapProcessInput {
  processDescription: string;
  existingProcesses?: { title: string; tag: string; description: string }[];
}

export interface MapProcessOutput {
  title: string;
  tag: string;
  description: string;
}

const SYSTEM_PROMPT = `Eres un Analista de Procesos Senior. Tu objetivo es convertir texto desordenado en un PROTOCOLO INTERACTIVO (árbol de decisión).

**Instrucciones del Formato de Salida:**
Debes generar un objeto JSON con los campos: "title" (string), "tag" (string), y "description" (string con JSON dentro).
El campo 'description' debe contener un árbol de decisión como JSON string. El nodo inicial SIEMPRE debe llamarse "start".

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

Responde SOLO con un JSON válido con los campos: title, tag, description (string con el JSON del árbol).`;

export async function mapProcess(
  input: MapProcessInput
): Promise<{ success: boolean; data?: MapProcessOutput; error?: string }> {
  try {
    const userPrompt = `Convierte el siguiente texto en un protocolo estructurado:\n\n${input.processDescription}`;

    const result = await callMistralAI<MapProcessOutput>(SYSTEM_PROMPT, userPrompt);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in mapProcess flow', error);
    return { success: false, error: error.message || 'Error al mapear el proceso.' };
  }
}
