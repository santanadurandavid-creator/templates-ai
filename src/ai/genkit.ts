'use server';

const MISTRAL_API_KEY = 'SQ8naGYTeJac9I0HFUdaYBtj38qUH9t2';
const MISTRAL_MODEL = 'mistral-small-latest';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MistralResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

/**
 * Calls the Mistral AI API directly.
 * Returns the parsed JSON content from the response.
 */
export async function callMistralAI<T = any>(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = true
): Promise<T> {
  const messages: MistralMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const body: any = {
    model: MISTRAL_MODEL,
    messages,
    temperature: 0.4,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API error (${response.status}): ${errorText}`);
  }

  const data: MistralResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in Mistral response');
  }

  if (jsonMode) {
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error(`Failed to parse Mistral JSON response: ${content.substring(0, 200)}`);
    }
  }

  return content as T;
}
