export type AISource =
  | 'chatgpt' | 'claude' | 'gemini' | 'perplexity'
  | 'grok' | 'mistral' | 'copilot' | 'manual';

export interface TemplateVar {
  key: string;       // e.g. "topic"
  label: string;     // e.g. "Topic"
  defaultValue: string;
}

export interface Prompt {
  id: string;
  content: string;
  title: string;          // auto-generated from first 60 chars, editable
  tags: string[];
  collectionId: string | null;
  source: AISource;
  createdAt: number;      // Date.now()
  updatedAt: number;
  usageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  isTemplate: boolean;
  templateVars: TemplateVar[];
}

export interface Collection {
  id: string;
  name: string;
  color: string;   // hex
  emoji: string;
  createdAt: number;
}

export interface AppSettings {
  autoCapture: boolean;
  minLength: number;        // don't save prompts shorter than N chars (default 10)
  showDuplicateWarning: boolean;
  keyboardShortcut: string; // default "Ctrl+Shift+P"
  theme: 'dark' | 'light';  // future
}

export interface StorageSchema {
  prompts: Prompt[];
  collections: Collection[];
  settings: AppSettings;
}
