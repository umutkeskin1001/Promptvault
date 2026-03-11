# PromptVault 🔮

> Save every prompt you write on AI sites — automatically.

PromptVault silently captures prompts from ChatGPT, Claude, Gemini, Perplexity, Grok, Mistral, and Copilot. Click the purple vault icon to browse, organize, and reuse your entire prompt history.

## Features
- **Auto-capture** from 7 AI sites
- **Tags & Collections** for organization
- **Templates** with `{{variable}}` syntax
- **Search & filter** by content, tag, or source
- **Favorites & pins** for quick access
- **Duplicate detection** (Jaccard trigram similarity)
- **Export / Import** as JSON
- **Keyboard shortcut** `Ctrl+Shift+P`
- **Zero server** — 100% local storage

## Install (dev)
```bash
git clone https://github.com/yourname/promptvault
cd promptvault
npm install
npm run build
```
Load `dist/` in Chrome → Extensions → Developer Mode → Load unpacked.

## Tech Stack
Chrome Extension MV3 · React 18 · TypeScript · Vite · Zustand · Shadow DOM

## License
MIT
