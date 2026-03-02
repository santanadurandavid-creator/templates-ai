'use server';

/**
 * @fileOverview A flow for rephrasing a template's content.
 *
 * - rephraseTemplate - A function that rephrases the content of a template.
 * - RephraseTemplateInput - The input type for the rephraseTemplate function.
 * - RephraseTemplateOutput - The return type for the rephraseTemplate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RephraseTemplateInputSchema = z.object({
  title: z.string().describe('The title of the template to provide context.'),
  content: z.string().describe('The content of the template to be rephrased.'),
});
export type RephraseTemplateInput = z.infer<typeof RephraseTemplateInputSchema>;

const RephraseTemplateOutputSchema = z.object({
  rephrasedContent: z.string().describe('The newly generated, rephrased content.'),
});
export type RephraseTemplateOutput = z.infer<
  typeof RephraseTemplateOutputSchema
>;

export async function rephraseTemplate(
  input: RephraseTemplateInput
): Promise<{ success: boolean; data?: RephraseTemplateOutput; error?: string }> {
  try {
    const output = await rephraseTemplateFlow(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error in rephraseTemplate flow', error);
    return {
      success: false,
      error: error.message || 'Error al parafrasear la plantilla.',
    };
  }
}

const prompt = ai.definePrompt({
  name: 'rephraseTemplatePrompt',
  input: { schema: RephraseTemplateInputSchema },
  output: { schema: RephraseTemplateOutputSchema },
  prompt: `Eres un experto en comunicación humana y natural para servicio al cliente.
Tu tarea es parafrasear el siguiente texto siguiendo estas reglas estrictas:
1. Empatía Humana: La prioridad es que el cliente se sienta escuchado y comprendido. Usa un lenguaje que conecte emocionalmente.
2. Informalidad Natural: Habla siempre de "tú", de forma cercana (como un amigo o colega).
3. Brevedad Extrema: No des vueltas. Máximo 2-3 frases súper directas.
4. Fluidez: Que no parezca una traducción o un texto predefinido.

Título Original (para darte contexto): {{{title}}}

Contenido Original:
"{{{content}}}"

Genera únicamente el nuevo contenido para el campo 'rephrasedContent'.
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

const rephraseTemplateFlow = ai.defineFlow(
  {
    name: 'rephraseTemplateFlow',
    inputSchema: RephraseTemplateInputSchema,
    outputSchema: RephraseTemplateOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
