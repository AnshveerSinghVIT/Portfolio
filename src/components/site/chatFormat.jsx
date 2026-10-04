import { Fragment } from 'react';

export function normalise(s) {
  return s.replace(/[\u2010\u2011]/g, '-').replace(/[\u00a0\u202f]/g, ' ').replace(/(\d) %/g, '$1%');
}

// Strips control tags; while streaming, hides a half-received "[[" tag so it never flashes on screen.
export function parseReply(raw, streaming) {
  const tags = [...raw.matchAll(/\[\[(nav|next|error)(?::([^\]]*))?\]\]/g)];
  let text = raw.replace(/\[\[[\s\S]*?\]\]/g, '');
  if (streaming) {
    const open = text.lastIndexOf('[[');
    if (open !== -1) text = text.slice(0, open);
    text = text.replace(/\[$/, '');
  }
  const nav = tags.find((t) => t[1] === 'nav')?.[2]?.trim().toLowerCase();
  const next = tags
    .find((t) => t[1] === 'next')?.[2]
    ?.split('|')
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 2);
  return { text: normalise(text).trim(), nav: nav || null, next: next ?? [], error: tags.some((t) => t[1] === 'error') };
}

const INLINE = /(\*\*[^*\n]+\*\*|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|https?:\/\/[^\s)]+)/g;

function Inline({ text }) {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(part)) return <a key={i} href={`mailto:${part}`}>{part}</a>;
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text }) {
  const blocks = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const bullet = /^[-•*]\s+/.test(trimmed);
    const content = trimmed.replace(/^[-•*]\s+/, '');
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === 'ul') last.items.push(content);
      else blocks.push({ type: 'ul', items: [content] });
    } else {
      blocks.push({ type: 'p', text: content });
    }
  }
  return blocks.map((b, i) =>
    b.type === 'ul' ? (
      <ul key={i}>
        {b.items.map((it, j) => (
          <li key={j}>
            <Inline text={it} />
          </li>
        ))}
      </ul>
    ) : (
      <p key={i}>
        <Inline text={b.text} />
      </p>
    )
  );
}
