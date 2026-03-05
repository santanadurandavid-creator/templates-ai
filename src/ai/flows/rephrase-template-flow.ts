'use server';

/**
 * @fileOverview Flow for rephrasing template content using Mistral AI.
 */

import { callMistralAI } from '@/ai/genkit';

export interface RephraseTemplateInput {
  title: string;
  content: string;
}

export interface RephraseTemplateOutput {
  rephrasedContent: string;
}

export async function rephraseTemplate(
  input: RephraseTemplateInput
): Promise<{ success: boolean; data?: RephraseTemplateOutput; error?: string }> {
  try {
    const systemPrompt = `Eres un experto en comunicación humana y natural para servicio al cliente.
Tu tarea es parafrasear el siguiente texto siguiendo estas reglas estrictas:
1. Empatía Humana: La prioridad es que el cliente se sienta escuchado y comprendido. Usa un lenguaje que conecte emocionalmente.
2. Informalidad Natural: Habla siempre de "tú", de forma cercana (como un amigo o colega).
3. Brevedad Extrema: No des vueltas. Máximo 2-3 frases súper directas.
4. Fluidez: Que no parezca una traducción o un texto predefinido.

Responde SOLO con un JSON válido con el campo: rephrasedContent.`;

    const userPrompt = `Título Original (para contexto): ${input.title}\n\nContenido Original:\n"${input.content}"\n\nGenera únicamente el nuevo contenido parafraseado.`;

    const result = await callMistralAI<RephraseTemplateOutput>(systemPrompt, userPrompt);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in rephraseTemplate flow', error);
    return { success: false, error: error.message || 'Error al parafrasear la plantilla.' };
  }
}
