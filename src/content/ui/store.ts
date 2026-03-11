import { create } from 'zustand';
import type { Prompt, Collection, AppSettings } from '../../shared/types';

type View = 'list' | 'editor' | 'settings' | 'template';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface PVStore {
  // Panel state
  isOpen: boolean;
  view: View;
  editingId: string | null;
  templateId: string | null;
  activeCollectionId: string | null;
  searchQuery: string;
  activeTag: string | null;
  activeSource: string | null;

  // Data
  prompts: Prompt[];
  collections: Collection[];
  settings: AppSettings | null;
  toasts: Toast[];

  // Actions
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setView: (v: View) => void;
  setEditingId: (id: string | null) => void;
  setTemplateId: (id: string | null) => void;
  setActiveCollection: (id: string | null) => void;
  setSearch: (q: string) => void;
  setActiveTag: (t: string | null) => void;
  setActiveSource: (s: string | null) => void;
  setData: (p: Prompt[], c: Collection[], s: AppSettings) => void;
  setPrompts: (p: Prompt[]) => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const usePVStore = create<PVStore>((set) => ({
  isOpen: false,
  view: 'list',
  editingId: null,
  templateId: null,
  activeCollectionId: null,
  searchQuery: '',
  activeTag: null,
  activeSource: null,
  prompts: [],
  collections: [],
  settings: null,
  toasts: [],

  setOpen: (v) => set({ isOpen: v }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setView: (v) => set({ view: v }),
  setEditingId: (id) => set({ editingId: id, view: id ? 'editor' : 'list' }),
  setTemplateId: (id) => set({ templateId: id, view: id ? 'template' : 'list' }),
  setActiveCollection: (id) => set({ activeCollectionId: id }),
  setSearch: (q) => set({ searchQuery: q }),
  setActiveTag: (t) => set({ activeTag: t }),
  setActiveSource: (s) => set({ activeSource: s }),
  setData: (p, c, s) => set({ prompts: p, collections: c, settings: s }),
  setPrompts: (p) => set({ prompts: p }),
  addToast: (t) => set((s) => ({
    toasts: [...s.toasts, { ...t, id: Math.random().toString(36).slice(2) }]
  })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
