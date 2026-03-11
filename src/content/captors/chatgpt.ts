import { BaseCaptor, type CaptureCallback } from './base';

// ChatGPT uses a contenteditable div, not a textarea.
// We intercept the submit button click or Enter keydown.
export class ChatGPTCaptor extends BaseCaptor {
  source = 'chatgpt' as const;
  private handler: (() => void) | null = null;
  private observer: MutationObserver | null = null;

  constructor(cb: CaptureCallback) { super(cb); }

  attach(): void {
    this.observer = new MutationObserver(() => this.tryBind());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.tryBind();
  }

  private tryBind(): void {
    const btn = document.querySelector<HTMLButtonElement>('[data-testid="send-button"]');
    if (!btn || btn.dataset['pv_bound']) return;
    btn.dataset['pv_bound'] = '1';
    const h = () => {
      const editor = document.querySelector<HTMLElement>('#prompt-textarea');
      if (editor) this.emit(editor.innerText || editor.textContent || '');
    };
    btn.addEventListener('click', h, true);
    this.handler = h;

    // Also bind Enter on the textarea
    const editor = document.querySelector<HTMLElement>('#prompt-textarea');
    if (editor && !editor.dataset['pv_bound']) {
      editor.dataset['pv_bound'] = '1';
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
          // Wait a bit for the UI to process the enter if needed
          setTimeout(h, 0);
        }
      }, true);
    }
  }

  detach(): void {
    this.observer?.disconnect();
  }
}
