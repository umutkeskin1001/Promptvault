import {
  savePrompt, getAllPrompts, updatePrompt, deletePrompt,
  getAllCollections, saveCollection, deleteCollection,
  getSettings, updateSettings, importData
} from '../shared/storage';
import { findDuplicate } from '../shared/duplicate';
import type { Message } from '../shared/messages';

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch(err => {
    console.error('[PromptVault BG]', err);
    sendResponse({ error: String(err) });
  });
  return true; // keep channel open for async
});

async function handleMessage(msg: Message): Promise<unknown> {
  switch (msg.type) {
    case 'SAVE_PROMPT': {
      const settings = await getSettings();
      if (msg.payload.content.length < settings.minLength) {
        return { skipped: true, reason: 'too_short' };
      }
      if (settings.showDuplicateWarning) {
        const all = await getAllPrompts();
        const dupId = findDuplicate(msg.payload.content, all);
        if (dupId) return { duplicate: true, existingId: dupId };
      }
      const prompt = await savePrompt(msg.payload);
      // Broadcast to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'PROMPT_CAPTURED',
              payload: { source: msg.payload.source }
            }).catch(() => {}); // Ignore tabs where extension isn't loaded
          }
        });
      });
      return { saved: true, prompt };
    }
    case 'GET_ALL': {
      const [prompts, collections, settings] = await Promise.all([
        getAllPrompts(), getAllCollections(), getSettings()
      ]);
      return { prompts, collections, settings };
    }
    case 'UPDATE_PROMPT':
      await updatePrompt(msg.payload.id, msg.payload.patch);
      return { ok: true };
    case 'DELETE_PROMPT':
      await deletePrompt(msg.payload.id);
      return { ok: true };
    case 'GET_COLLECTIONS':
      return getAllCollections();
    case 'SAVE_COLLECTION':
      return saveCollection(msg.payload);
    case 'DELETE_COLLECTION':
      await deleteCollection(msg.payload.id);
      return { ok: true };
    case 'GET_SETTINGS':
      return getSettings();
    case 'UPDATE_SETTINGS':
      await updateSettings(msg.payload);
      return { ok: true };
    case 'IMPORT_DATA':
      await importData(msg.payload.json);
      return { ok: true };
    default:
      return { error: 'unknown_message' };
  }
}
