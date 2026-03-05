'use server';

/**
 * @fileOverview Flow for generating empathetic templates and analyzing customer messages using Mistral AI.
 */

import { callMistralAI } from '@/ai/genkit';

export interface GenerateEmpatheticTemplateInput {
  context: string;
  existingTemplates: { title: string; content: string }[];
  knowledgeBase?: string;
  tagRules?: string;
}

export interface GenerateEmpatheticTemplateOutput {
  summary: string;
  title: string;
  content: string;
  recommendedTag?: string;
  matchedProcessTitle?: string;
}

export async function generateEmpatheticTemplate(
  input: GenerateEmpatheticTemplateInput
): Promise<{ success: boolean; data?: GenerateEmpatheticTemplateOutput; error?: string }> {
  try {
    const systemPrompt = `Eres un asistente experto en análisis de casos y comunicación de inDrive. Tu objetivo es analizar el mensaje del conductor o pasajero y proponer la mejor respuesta.

Analiza el mensaje del usuario:
1. **Resumen del Análisis**: Identifica claramente QUÉ quiere el cliente o POR QUÉ se queja.
2. **Generación de Respuesta**: Crea una respuesta empática y profesional.
3. **Clasificación**: Elige el 'recommendedTag' más adecuado según las reglas.
4. **Cruce con Procesos**: Si concuerda con un proceso, indica el título exacto en 'matchedProcessTitle'.

${input.tagRules ? `**Reglas de Etiquetas (Tags):**\n${input.tagRules}` : ''}

Reglas de Estilo:
1. **Máxima Empatía**: Valida el sentimiento del cliente al inicio.
2. **Brevedad Extrema**: Máximo 2-3 frases.
3. **Trato de "Tú"**: Cercano y humano.

Responde SOLO con un JSON válido con los campos: summary, title, content, recommendedTag (opcional), matchedProcessTitle (opcional).`;

    const styleRef = input.existingTemplates.map(t => `- ${t.content}`).join('\n');
    const userPrompt = `**Mensaje del Usuario:**\n${input.context}\n\n${input.knowledgeBase ? `**Base de Conocimientos (Procesos):**\n${input.knowledgeBase}\n\n` : ''}**Referencia de Estilo:**\n${styleRef}`;

    const result = await callMistralAI<GenerateEmpatheticTemplateOutput>(systemPrompt, userPrompt);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in generateEmpatheticTemplate flow', error);
    return { success: false, error: error.message || 'Error al analizar el mensaje.' };
  }
}
