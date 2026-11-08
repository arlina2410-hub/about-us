import { lazy, Suspense, useEffect, useState } from 'react';
import poemsData from './data/poems.json';
import type { Poem } from './types/poem';
import { ErrorBoundary } from './components/ErrorBoundary';
import HomePage from './home/HomePage';
import { UpdateBanner } from './pwa/UpdateBanner';

// The book (and its page-flip library) loads only when someone opens it, so the home screen stays light.
const BookReader = lazy(() => import('./book/BookReader'));
// Developer test pages exist only in `npm run dev`; the real website leaves them out completely.
const DevRoutes = import.meta.env.DEV ? lazy(() => import('./pages/DevRoutes')) : null;

const poems = poemsData as unknown as Poem[];

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const closeBook = () => {
  window.location.hash = '';
};

function Screen() {
  const hash = useHash();

  // #book opens at the cover; #book/<poem id> opens at that poem; #continue opens where the reader stopped.
  if (hash === '#book' || hash === '#continue' || hash.startsWith('#book/')) {
    const poemId = hash.startsWith('#book/') ? safeDecode(hash.slice('#book/'.length)) : undefined;
    return (
      <Suspense fallback={<p style={{ padding: 24, fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}>Opening the book…</p>}>
        <BookReader
          key={hash === '#continue' ? 'continue' : (poemId ?? 'cover')}
          poems={poems}
          initialPoemId={poemId}
          resume={hash === '#continue'}
          onClose={closeBook}
        />
      </Suspense>
    );
  }
  if (DevRoutes && (hash === '#dev' || hash === '#pagination' || hash === '#stage1')) {
    return (
      <Suspense fallback={null}>
        <DevRoutes hash={hash} />
      </Suspense>
    );
  }
  return <HomePage poems={poems} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Screen />
      <UpdateBanner />
    </ErrorBoundary>
  );
}
