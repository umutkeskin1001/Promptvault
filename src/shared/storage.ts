import type { StorageSchema, Prompt, Collection, AppSettings } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY } from './constants';

function nanoid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

async function getAll(): Promise<StorageSchema> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? {
    prompts: [],
    collections: [],
    settings: DEFAULT_SETTINGS,
  };
}

async function setAll(data: StorageSchema): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

export async function getAllPrompts(): Promise<Prompt[]> {
  const data = await getAll();
  return data.prompts;
}

export async function savePrompt(p: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Prompt> {
  const data = await getAll();
  const now = Date.now();
  const prompt: Prompt = {
    ...p,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    usageCount: 0,
  };
  data.prompts = [prompt, ...data.prompts];
  await setAll(data);
  return prompt;
}

export async function updatePrompt(id: string, patch: Partial<Prompt>): Promise<void> {
  const data = await getAll();
  data.prompts = data.prompts.map(p =>
    p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
  );
  await setAll(data);
}

export async function deletePrompt(id: string): Promise<void> {
  const data = await getAll();
  data.prompts = data.prompts.filter(p => p.id !== id);
  await setAll(data);
}

export async function getAllCollections(): Promise<Collection[]> {
  const data = await getAll();
  return data.collections;
}

export async function saveCollection(c: Omit<Collection, 'id' | 'createdAt'>): Promise<Collection> {
  const data = await getAll();
  const col: Collection = { ...c, id: nanoid(), createdAt: Date.now() };
  data.collections = [...data.collections, col];
  await setAll(data);
  return col;
}

export async function deleteCollection(id: string): Promise<void> {
  const data = await getAll();
  data.collections = data.collections.filter(c => c.id !== id);
  // orphan prompts — remove their collectionId
  data.prompts = data.prompts.map(p =>
    p.collectionId === id ? { ...p, collectionId: null } : p
  );
  await setAll(data);
}

export async function getSettings(): Promise<AppSettings> {
  const data = await getAll();
  return { ...DEFAULT_SETTINGS, ...data.settings };
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const data = await getAll();
  data.settings = { ...data.settings, ...patch };
  await setAll(data);
}

export async function exportData(): Promise<string> {
  const data = await getAll();
  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<void> {
  const incoming = JSON.parse(json) as StorageSchema;
  // Merge: add incoming prompts that don't exist by id
  const data = await getAll();
  const existingIds = new Set(data.prompts.map(p => p.id));
  const newPrompts = incoming.prompts.filter(p => !existingIds.has(p.id));
  data.prompts = [...newPrompts, ...data.prompts];
  // Merge collections
  const existingColIds = new Set(data.collections.map(c => c.id));
  const newCols = incoming.collections.filter(c => !existingColIds.has(c.id));
  data.collections = [...data.collections, ...newCols];
  await setAll(data);
}
