import { BaseCaptor, type CaptureCallback } from './base';

export class MistralCaptor extends BaseCaptor {
  source = 'mistral' as const;
  private observer: MutationObserver | null = null;

  constructor(cb: CaptureCallback) { super(cb); }

  attach(): void {
    this.observer = new MutationObserver(() => this.tryBind());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.tryBind();
  }

  private tryBind(): void {
    const ta = document.querySelector<HTMLTextAreaElement>('textarea');
    if (!ta || ta.dataset['pv_bound']) return;
    ta.dataset['pv_bound'] = '1';
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) this.emit(ta.value);
    }, true);
    const btn = document.querySelector<HTMLButtonElement>('button[type="submit"]');
    btn?.addEventListener('click', () => this.emit(ta.value), true);
  }

  detach(): void { this.observer?.disconnect(); }
}
