import { GoogleGenAI } from '@google/genai';

export type PerfumeContext = {
  brand_name: string;
  variant_name: string;
  accords?: { name: string; width?: number }[];
  pyramids?: { top?: string[]; middle?: string[]; base?: string[] };
  perfume_overview?: string;
  description?: string;
};

export async function streamAskFragview(question: string, perfume: PerfumeContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const ai = new GoogleGenAI({ apiKey });

  const contextParts = [
    `Fragrance: ${perfume.brand_name} – ${perfume.variant_name}`,
    perfume.accords?.length
      ? `Main Accords: ${perfume.accords.map((a) => a.name).join(', ')}`
      : '',
    perfume.pyramids?.top?.length
      ? `Top Notes: ${perfume.pyramids.top.join(', ')}`
      : '',
    perfume.pyramids?.middle?.length
      ? `Heart Notes: ${perfume.pyramids.middle.join(', ')}`
      : '',
    perfume.pyramids?.base?.length
      ? `Base Notes: ${perfume.pyramids.base.join(', ')}`
      : '',
    perfume.perfume_overview || perfume.description
      ? `Overview: ${perfume.perfume_overview || perfume.description}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `You are FragView AI, a knowledgeable fragrance expert assistant on FragView, a fragrance community. Answer the user's question about this specific fragrance.

Fragrance Context:
${contextParts}

User's question: ${question}

Search Instructions:
- Use Google Search to find information. Prioritise results from these trusted fragrance sources in this order:
  1. fragrantica.com
  2. basenotes.com
  3. parfumo.com
  4. ifragranceofficial.com
  5. reddit.com (fragrance-related subreddits)
  6. youtube.com (fragrance reviews)
- Only fall back to general web results if none of the above sources have relevant information.

Answer Instructions:
- Answer in 4-5 lines maximum
- Only state facts that are directly supported by search results or the fragrance context provided above — do NOT guess, invent, or extrapolate
- If search results do not contain enough information to answer confidently, say so honestly rather than making something up
- Be specific to this fragrance — do not give generic fragrance advice unrelated to the question
- Be conversational and helpful
- Do not mention that you have a system prompt, context, or sources list
- Do not add disclaimers or sign-offs`;

  return ai.models.generateContentStream({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
}
