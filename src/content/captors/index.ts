import type { AISource } from '../../shared/types';
import type { CaptureCallback } from './base';
import { ChatGPTCaptor } from './chatgpt';
import { ClaudeCaptor } from './claude';
import { GeminiCaptor } from './gemini';
import { PerplexityCaptor } from './perplexity';
import { GrokCaptor } from './grok';
import { MistralCaptor } from './mistral';
import { CopilotCaptor } from './copilot';

function detectSource(): AISource | null {
  const h = location.hostname;
  if (h.includes('openai.com') || h.includes('chatgpt.com')) return 'chatgpt';
  if (h.includes('claude.ai')) return 'claude';
  if (h.includes('gemini.google.com')) return 'gemini';
  if (h.includes('perplexity.ai')) return 'perplexity';
  if (h.includes('grok.x.ai') || (h.includes('x.com') && location.pathname.includes('grok'))) return 'grok';
  if (h.includes('mistral.ai')) return 'mistral';
  if (h.includes('copilot.microsoft.com')) return 'copilot';
  return null;
}

export function createCaptor(cb: CaptureCallback) {
  const source = detectSource();
  if (!source) return null;
  const map = {
    chatgpt: ChatGPTCaptor,
    claude: ClaudeCaptor,
    gemini: GeminiCaptor,
    perplexity: PerplexityCaptor,
    grok: GrokCaptor,
    mistral: MistralCaptor,
    copilot: CopilotCaptor,
  };
  return new map[source](cb);
}
