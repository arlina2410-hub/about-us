import { useMemo, useRef, useState } from 'react';
import type { Poem } from '../types/poem';
import { Sprig } from '../book/BookPages';
import { BookHero } from './BookHero';
import { BrowseSection } from './BrowseSection';
import { FeaturedCard } from './FeaturedCard';
import { Header, type MenuLink } from './Header';
import { LatestRow } from './LatestRow';
import { ArrowRightIcon } from './icons';
import { useBookmarks, useReadingPosition } from '../lib/stores';
import { latestPoems, pickFeatured } from './poemUtils';
import { useInstallKind } from '../pwa/hooks';
import { InstallSheet } from '../pwa/InstallSheet';
import './home.css';

const MENU_LINKS: MenuLink[] = [
  { label: 'Featured poem', targetId: 'featured' },
  { label: 'New poems', targetId: 'new-poems' },
  { label: 'The book', targetId: 'the-book' },
  { label: 'All poems', targetId: 'all-poems' },
];

function scrollToId(id: string) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function HomePage({ poems }: { poems: Poem[] }) {
  const featured = useMemo(() => pickFeatured(poems), [poems]);
  const latest = useMemo(() => latestPoems(poems, 8), [poems]);
  const searchRef = useRef<HTMLInputElement>(null);
  const installKind = useInstallKind();
  const [installOpen, setInstallOpen] = useState(false);
  const bookmarks = useBookmarks();
  const [position] = useReadingPosition();
  const resumePoem = position ? poems.find((p) => p.id === position.poemId) : undefined;

  const goSearch = () => {
    scrollToId('all-poems');
    window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 350);
  };

  return (
    <div className="home">
      <Header
        links={MENU_LINKS}
        onNavigate={scrollToId}
        onSearch={goSearch}
        showInstall={installKind !== 'installed'}
        onInstall={() => setInstallOpen(true)}
      />

      <main className="home__wrap">
        <div className="hero">
          <section className="welcome" aria-labelledby="welcome-heading">
            <Sprig className="welcome__sprig" />
            <h1 id="welcome-heading" className="welcome__title">
              Hello, reader.
            </h1>
            <p className="welcome__ask">Which poem will you read today?</p>
            <p className="welcome__text">
              ABOUT US is a personal collection of poems and memories, written over time and kept together in one small
              book.
            </p>
            <div className="welcome__actions">
              {resumePoem ? (
                <>
                  <a className="btn btn--solid" href="#continue">
                    Continue reading
                  </a>
                  <a className="btn btn--outline" href="#book">
                    Open the Book
                  </a>
                </>
              ) : (
                <>
                  <a className="btn btn--solid" href="#book">
                    Open the Book
                  </a>
                  {poems.length > 0 && (
                    <button className="btn btn--outline" onClick={() => scrollToId('all-poems')}>
                      Browse poems
                    </button>
                  )}
                </>
              )}
            </div>
            {resumePoem && <p className="welcome__resume">Last read: {resumePoem.title}</p>}
          </section>

          {featured && (
            <section id="featured" className="block" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="section-title">
                Featured poem
              </h2>
              <FeaturedCard poem={featured} />
            </section>
          )}
        </div>

        {poems.length === 0 ? (
          <p className="home__empty">The first poem is on its way.</p>
        ) : (
          <>
            <section id="new-poems" className="block" aria-labelledby="new-heading">
              <div className="block__head">
                <h2 id="new-heading" className="section-title">
                  New poems
                </h2>
                <button className="textlink" onClick={() => scrollToId('all-poems')}>
                  See all <ArrowRightIcon />
                </button>
              </div>
              <LatestRow poems={latest} />
            </section>

            <BookHero poemCount={poems.length} />
            <BrowseSection poems={poems} savedIds={bookmarks.ids} inputRef={searchRef} />
          </>
        )}
      </main>

      <footer className="home__foot">
        <p>ABOUT US. A personal collection of poems and memories.</p>
        {installKind !== 'installed' && (
          <button className="textlink" onClick={() => setInstallOpen(true)}>
            Install the app
          </button>
        )}
      </footer>
      {installOpen && <InstallSheet onClose={() => setInstallOpen(false)} />}
    </div>
  );
}
