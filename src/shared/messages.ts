import type { Prompt, Collection, AppSettings, AISource } from './types';

export type Message =
  | { type: 'SAVE_PROMPT';    payload: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> }
  | { type: 'GET_ALL';        payload?: never }
  | { type: 'UPDATE_PROMPT';  payload: { id: string; patch: Partial<Prompt> } }
  | { type: 'DELETE_PROMPT';  payload: { id: string } }
  | { type: 'GET_COLLECTIONS';payload?: never }
  | { type: 'SAVE_COLLECTION';payload: Omit<Collection, 'id' | 'createdAt'> }
  | { type: 'DELETE_COLLECTION'; payload: { id: string } }
  | { type: 'GET_SETTINGS';   payload?: never }
  | { type: 'UPDATE_SETTINGS';payload: Partial<AppSettings> }
  | { type: 'IMPORT_DATA';    payload: { json: string } }
  | { type: 'PROMPT_CAPTURED';payload: { source: AISource; isDuplicate?: boolean } };
