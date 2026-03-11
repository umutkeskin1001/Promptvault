import type { AISource } from '../../shared/types';

export type CaptureCallback = (content: string, source: AISource) => void;

export abstract class BaseCaptor {
  abstract source: AISource;
  protected onCapture: CaptureCallback;
  protected lastCaptured = '';

  constructor(cb: CaptureCallback) {
    this.onCapture = cb;
  }

  abstract attach(): void;
  abstract detach(): void;

  protected emit(content: string): void {
    const trimmed = content.trim();
    if (!trimmed || trimmed === this.lastCaptured) return;
    this.lastCaptured = trimmed;
    this.onCapture(trimmed, this.source);
  }
}
