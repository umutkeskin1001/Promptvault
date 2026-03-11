// Jaccard similarity on trigrams — lightweight, no deps
function trigrams(s: string): Set<string> {
  const clean = s.toLowerCase().replace(/\s+/g, ' ').trim();
  const set = new Set<string>();
  for (let i = 0; i < clean.length - 2; i++) {
    set.add(clean.slice(i, i + 3));
  }
  return set;
}

export function similarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  ta.forEach(t => { if (tb.has(t)) intersection++; });
  return intersection / (ta.size + tb.size - intersection);
}

// Returns the existing prompt if similarity > threshold
export function findDuplicate(
  content: string,
  existing: { id: string; content: string }[],
  threshold = 0.85
): string | null {
  for (const p of existing) {
    if (similarity(content, p.content) >= threshold) return p.id;
  }
  return null;
}
