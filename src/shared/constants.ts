export const SOURCE_COLORS: Record<string, string> = {
  chatgpt:    '#10A37F',
  claude:     '#D97757',
  gemini:     '#4285F4',
  perplexity: '#20B2AA',
  grok:       '#1D9BF0',
  mistral:    '#FF7000',
  copilot:    '#0078D4',
  manual:     '#7C3AED',
};

export const SOURCE_LABELS: Record<string, string> = {
  chatgpt:    'ChatGPT',
  claude:     'Claude',
  gemini:     'Gemini',
  perplexity: 'Perplexity',
  grok:       'Grok',
  mistral:    'Mistral',
  copilot:    'Copilot',
  manual:     'Manual',
};

export const DEFAULT_SETTINGS = {
  autoCapture: true,
  minLength: 10,
  showDuplicateWarning: true,
  keyboardShortcut: 'Ctrl+Shift+P',
  theme: 'dark' as const,
};

export const STORAGE_KEY = 'promptvault_data';
