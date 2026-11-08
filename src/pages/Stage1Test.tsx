import React from 'react';
import type { Poem } from '../types/poem.ts';
import poemsData from '../data/poems.json';
import '../styles/test-page.css';

const poems: Poem[] = poemsData as Poem[];

const PALETTE = [
  { name: 'ivory', hex: '#F7F1E3', description: 'Background alt & light tint' },
  { name: 'cream', hex: '#FBF7EC', description: 'Primary page surface' },
  { name: 'parchment', hex: '#EADFC8', description: 'Borders & subtle cards' },
  { name: 'sage', hex: '#A9B89A', description: 'Muted borders & accents' },
  { name: 'olive', hex: '#6B7A45', description: 'Secondary text & badges' },
  { name: 'forest', hex: '#2F4A3A', description: 'Brand emphasis & deep contrast' },
  { name: 'charcoal', hex: '#2E2A25', description: 'Primary reading text' },
  { name: 'peach', hex: '#E8B9A0', description: 'Rare accent & featured tag' },
];

export const Stage1Test: React.FC = () => {
  return (
    <main className="test-page-container">
      {/* Brand Header */}
      <header className="brand-header">
        <h1 className="brand-title">ABOUT US</h1>
        <p className="brand-subtitle">Stage 1 Foundation — Design System & Poem Test Page</p>
      </header>

      {/* Section 1: Palette */}
      <section className="test-section" aria-labelledby="palette-heading">
        <h2 id="palette-heading" className="section-title">Color Palette</h2>
        <p className="section-description">
          Warm, editorial tokens defined in <code>tokens.css</code> per <code>AGENTS.md</code>.
        </p>
        <div className="palette-grid">
          {PALETTE.map((swatch) => (
            <div key={swatch.name} className="swatch-card">
              <div
                className="swatch-color"
                style={{ backgroundColor: swatch.hex }}
                aria-hidden="true"
              />
              <div className="swatch-name">{swatch.name}</div>
              <div className="swatch-hex">{swatch.hex}</div>
              <div className="poem-meta" style={{ marginTop: '4px' }}>{swatch.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Fonts */}
      <section className="test-section" aria-labelledby="fonts-heading">
        <h2 id="fonts-heading" className="section-title">Typography (3 Self-Hosted Fonts)</h2>
        <p className="section-description">
          All fonts configured with <code>font-display: swap</code>.
        </p>
        <div className="font-specimens">
          <div className="font-card">
            <div className="font-card-label">Tanker (Local font in src/assets/fonts) — Branding & Big Headings Only</div>
            <div className="specimen-tanker">ABOUT US — POETRY & COMPANIONSHIP</div>
          </div>

          <div className="font-card">
            <div className="font-card-label">Newsreader (@fontsource/newsreader) — Poem Verses & Editorial Body</div>
            <div className="specimen-newsreader">
              &ldquo;We pause where morning touches the sill, holding what words were never meant to spill.&rdquo;
            </div>
          </div>

          <div className="font-card">
            <div className="font-card-label">DM Sans (@fontsource/dm-sans) — Interface, Navigation & Metadata</div>
            <div className="specimen-dm-sans">
              <p>Clean, human geometry designed for legible reading across mobile viewports.</p>
              <div className="sample-ui-row">
                <button type="button">Read Poem</button>
                <button type="button">Bookmark</button>
                <span className="pill-badge">Domestic</span>
                <span className="pill-badge featured">Featured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Poem List */}
      <section className="test-section" aria-labelledby="poems-heading">
        <h2 id="poems-heading" className="section-title">Poem Collection ({poems.length} Items)</h2>
        <p className="section-description">
          Loaded from <code>src/data/poems.json</code>, validated automatically by <code>scripts/validate-poems.mjs</code>.
        </p>

        <div className="poem-cards-list">
          {poems.map((poem) => {
            const totalLines = poem.stanzas.reduce((acc, s) => acc + s.length, 0);

            return (
              <article key={poem.id} className="poem-card">
                <header className="poem-card-header">
                  <div>
                    <h3 className="poem-title">{poem.title}</h3>
                    <div className="poem-meta">
                      <span>{poem.date}</span>
                      <span>&bull;</span>
                      <span className="stanza-count-badge">
                        {poem.stanzas.length} {poem.stanzas.length === 1 ? 'stanza' : 'stanzas'} ({totalLines} {totalLines === 1 ? 'line' : 'lines'})
                      </span>
                      {poem.category && (
                        <>
                          <span>&bull;</span>
                          <span>{poem.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {poem.featured && (
                    <span className="pill-badge featured">Featured</span>
                  )}
                </header>

                {poem.tags && poem.tags.length > 0 && (
                  <div className="poem-tags">
                    {poem.tags.map((tag) => (
                      <span key={tag} className="pill-badge">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="poem-body">
                  {poem.stanzas.map((stanza, sIdx) => (
                    <div key={sIdx} className="poem-stanza">
                      {stanza.map((line, lIdx) => (
                        <span key={lIdx} className="poem-line">
                          {line}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Stage1Test;
