'use server';

/**
 * @fileOverview A flow for generating empathetic templates and analyzing customer messages.
 *
 * - generateEmpatheticTemplate - A function that generates an empathetic template and analyzes the intent.
 * - GenerateEmpatheticTemplateInput - The input type for the generateEmpatheticTemplate function.
 * - GenerateEmpatheticTemplateOutput - The return type for the generateEmpatheticTemplate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEmpatheticTemplateInputSchema = z.object({
  context: z.string().describe('El mensaje del cliente o situación a analizar.'),
  existingTemplates: z
    .array(z.object({ title: z.string(), content: z.string() }))
    .describe('Lista de plantillas existentes para copiar el estilo.'),
  knowledgeBase: z
    .string()
    .optional()
    .describe('Información de procesos para que la IA sepa qué responder.'),
  tagRules: z
    .string()
    .optional()
    .describe('Reglas personalizadas sobre qué tags usar y cuándo.'),
});
export type GenerateEmpatheticTemplateInput = z.infer<
  typeof GenerateEmpatheticTemplateInputSchema
>;

const GenerateEmpatheticTemplateOutputSchema = z.object({
  summary: z.string().describe('Un resumen de qué quiere el cliente o por qué se queja.'),
  title: z.string().describe('Título sugerido para la plantilla.'),
  content: z.string().describe('El contenido del mensaje generado.'),
  recommendedTag: z.string().optional().describe('El tag más adecuado basado en las reglas proporcionadas.'),
  matchedProcessTitle: z.string().optional().describe('El título exacto del proceso de la base de conocimientos que concuerda con esta situación, si lo hay.'),
});
export type GenerateEmpatheticTemplateOutput = z.infer<
  typeof GenerateEmpatheticTemplateOutputSchema
>;

export async function generateEmpatheticTemplate(
  input: GenerateEmpatheticTemplateInput
): Promise<{ success: boolean; data?: GenerateEmpatheticTemplateOutput, error?: string }> {
  try {
    const output = await generateEmpatheticTemplateFlow(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error in generateEmpatheticTemplate flow', error);
    return { success: false, error: error.message || 'Error al analizar el mensaje.' };
  }
}

const prompt = ai.definePrompt({
  name: 'generateEmpatheticTemplatePrompt',
  input: { schema: GenerateEmpatheticTemplateInputSchema },
  output: { schema: GenerateEmpatheticTemplateOutputSchema },
  prompt: `Eres un asistente experto en análisis de casos y comunicación de inDrive. Tu objetivo es analizar el mensaje del conductor o pasajero y proponer la mejor respuesta.

Analiza el **Contexto** (el mensaje del usuario):
1. **Resumen del Análisis**: Identifica claramente QUÉ quiere el cliente o POR QUÉ se queja (ej: "Se queja de un cobro doble porque el viaje se canceló pero el banco retuvo el dinero").
2. **Generación de Respuesta**: Crea una respuesta empática y profesional. Usa la **Base de Conocimientos** para ser preciso.
3. **Clasificación**: Elige el 'recommendedTag' más adecuado según las reglas.
4. **Cruce con Procesos**: Si el mensaje concuerda con alguno de los procesos listados en la **Base de Conocimientos**, indica el título exacto de ese proceso en 'matchedProcessTitle'.

{{#if tagRules}}
**Reglas de Etiquetas (Tags):**
Usa estas reglas para elegir el 'recommendedTag' más apropiado:
{{{tagRules}}}
{{/if}}

Reglas de Estilo para la respuesta:
1. **Máxima Empatía**: Valida el sentimiento del cliente al inicio.
2. **Brevedad Extrema**: Máximo 2-3 frases.
3. **Trato de "Tú"**: Cercano y humano.

**Mensaje del Usuario a Analizar:** 
{{{context}}}

{{#if knowledgeBase}}
**Base de Conocimientos (Procesos):**
{{{knowledgeBase}}}
{{/if}}

**Referencia de Estilo:**
{{#each existingTemplates}}
- {{{content}}}
{{/each}}
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const generateEmpatheticTemplateFlow = ai.defineFlow(
  {
    name: 'generateEmpatheticTemplateFlow',
    inputSchema: GenerateEmpatheticTemplateInputSchema,
    outputSchema: GenerateEmpatheticTemplateOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
