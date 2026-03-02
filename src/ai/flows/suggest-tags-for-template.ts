'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest relevant tags and classify a security incident.
 *
 * - suggestTagsForTemplate - A function that handles the tag suggestion process.
 * - SuggestTagsForTemplateInput - The input type for the suggestTagsForTemplate function.
 * - SuggestTagsForTemplateOutput - The return type for the suggestTagsForTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsForTemplateInputSchema = z.object({
  situation: z
    .string()
    .describe('The content of the template for which tags are to be suggested.'),
  tagRules: z
    .string()
    .optional()
    .describe('Reglas personalizadas sobre qué tags usar y cuándo.'),
});
export type SuggestTagsForTemplateInput = z.infer<
  typeof SuggestTagsForTemplateInputSchema
>;

const SuggestTagsForTemplateOutputSchema = z.object({
  tag: z.string().describe('El tag más adecuado de la lista.'),
  severity: z.enum(['VERDE', 'AMARILLO', 'ROJO']).describe('La gravedad del incidente.'),
  justification: z.string().describe('Una justificación breve de la clasificación.'),
});
export type SuggestTagsForTemplateOutput = z.infer<
  typeof SuggestTagsForTemplateOutputSchema
>;

export async function suggestTagsForTemplate(
  input: SuggestTagsForTemplateInput
): Promise<{ success: boolean; data?: SuggestTagsForTemplateOutput, error?: string}> {
  try {
    const output = await suggestTagsForTemplateFlow(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error in suggestTagsForTemplate flow', error);
    return { success: false, error: error.message || 'Error al sugerir tags.' };
  }
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: { schema: SuggestTagsForTemplateInputSchema },
  output: { schema: SuggestTagsForTemplateOutputSchema },
  prompt: `Eres un experto en seguridad y soporte de transporte. Tu tarea es clasificar el incidente proporcionado en la 'situation'.

{{#if tagRules}}
**Reglas de Etiquetas Personalizadas (Prioridad Máxima):**
Usa estas reglas para determinar el 'tag' y la 'severity':
{{{tagRules}}}
{{else}}
**TAGS Estándar (Usar si no hay reglas):**
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
- Rojo: Peligro de vida o daño grave.
{{/if}}

**Instrucciones:**
1. Lee la situación.
2. Basándote en las reglas (preferiblemente las personalizadas), elige el TAG más adecuado.
3. Determina la Gravedad (VERDE, AMARILLO, o ROJO).
4. Justifica tu decisión brevemente en español.

**Situación a analizar:**
{{{situation}}}
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ]
  }
});


const suggestTagsForTemplateFlow = ai.defineFlow(
  {
    name: 'suggestTagsForTemplateFlow',
    inputSchema: SuggestTagsForTemplateInputSchema,
    outputSchema: SuggestTagsForTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
