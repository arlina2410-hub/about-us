import type { Poem } from '../types/poem';

/** Plain text of a poem with its line breaks and stanza gaps kept. */
export function poemToText(poem: Poem): string {
  const body = poem.stanzas.map((s) => s.join('\n')).join('\n\n');
  return `${poem.title}\n\n${body}\n\nABOUT US`;
}

/** Link that opens the book at this poem. */
export function poemUrl(id: string): string {
  return `${window.location.origin}${window.location.pathname}#book/${encodeURIComponent(id)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the older method */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Uses the phone's share sheet when there is one, otherwise copies the poem and its link. */
export async function sharePoem(poem: Poem): Promise<ShareResult> {
  const text = poemToText(poem);
  const url = poemUrl(poem.id);
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: poem.title, text, url });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(`${text}\n${url}`)) ? 'copied' : 'failed';
}

export async function copyPoem(poem: Poem): Promise<boolean> {
  return copyText(`${poemToText(poem)}\n${poemUrl(poem.id)}`);
}
