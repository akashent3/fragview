// src/lib/ai/openai-client.ts
// OpenAI GPT-4o-mini client - Fast & cheap! 

import OpenAI from 'openai';

export class OpenAIClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = 'gpt-4o-mini'; // Cheapest & fastest
  }

  /**
   * Generate text completion from OpenAI
   * Cost: $0.15 per 1M input tokens, $0.60 per 1M output tokens
   */
  async generate(prompt: string): Promise<string> {
    try {
      const completion = await this.client.chat. completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert perfume reviewer. Analyze reviews and create concise, helpful summaries.'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500, // Keep output concise to save money
        top_p: 0.9,
      });

      return completion.choices[0]?.message?.content?. trim() || '';
    } catch (error) {
      console. error('Error calling OpenAI:', error);
      throw error;
    }
  }

  /**
   * Check if OpenAI API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current usage and costs
   */
  async getUsage(): Promise<void> {
    try {
      // Note: You can view usage at https://platform.openai.com/usage
      console.log('💰 View usage at: https://platform.openai.com/usage');
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  }
}