import Atlas from '@/components/atlas/Atlas';
import ViewToggle from '@/components/ViewToggle';
import data from '@/lib/atlas/atlas.json';
import './atlas.css';

export const metadata = {
  title: 'Atlas',
  description:
    'A living topographic map of Anshveer Singh’s work — every project, skill and experience embedded with a sentence-transformer, projected with UMAP and drawn with hand-written WebGL2 shaders. Search it by meaning, right in your browser.',
  alternates: { canonical: '/atlas' },
};

export default function AtlasPage() {
  return (
    <>
      <h1 className="sr-only">An Atlas of Anshveer Singh — a map of his work, searchable by meaning</h1>
      <Atlas />
      <noscript>
        <ul>
          {data.nodes.map((n) => (
            <li key={n.id}>
              <strong>{n.title}</strong>
              {n.body ? ` — ${n.body}` : ''}
            </li>
          ))}
        </ul>
      </noscript>
      <ViewToggle current="atlas" />
    </>
  );
}
