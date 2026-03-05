'use server';

/**
 * @fileOverview Flow for suggesting tags and classifying incidents using Mistral AI.
 */

import { callMistralAI } from '@/ai/genkit';

export interface SuggestTagsForTemplateInput {
  situation: string;
  tagRules?: string;
}

export interface SuggestTagsForTemplateOutput {
  tag: string;
  severity: 'VERDE' | 'AMARILLO' | 'ROJO';
  justification: string;
}

export async function suggestTagsForTemplate(
  input: SuggestTagsForTemplateInput
): Promise<{ success: boolean; data?: SuggestTagsForTemplateOutput; error?: string }> {
  try {
    const systemPrompt = `Eres un experto en seguridad y soporte de transporte. Tu tarea es clasificar el incidente proporcionado.

${input.tagRules ? `**Reglas de Etiquetas Personalizadas (Prioridad Máxima):**
Usa estas reglas para determinar el 'tag' y la 'severity':
${input.tagRules}` : `**TAGS Estándar:**
- Accidentes de coche
- Agresiones
- Acoso sexual
- Secuestro
- Robo
- Disputa de pago
- Objeto olvidado
- Problema con el vehículo
- Conducta inapropiada

**Reglas de Gravedad Estándar:**
- Verde: Sin riesgo inmediato/físico.
- Amarillo: Riesgo potencial o daño menor.
- Rojo: Peligro de vida o daño grave.`}

**Instrucciones:**
1. Lee la situación.
2. Elige el TAG más adecuado.
3. Determina la Gravedad (VERDE, AMARILLO, o ROJO).
4. Justifica tu decisión brevemente en español.

Responde SOLO con un JSON válido con los campos: tag, severity, justification.`;

    const result = await callMistralAI<SuggestTagsForTemplateOutput>(systemPrompt, input.situation);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in suggestTagsForTemplate flow', error);
    return { success: false, error: error.message || 'Error al sugerir tags.' };
  }
}
