import { Cover } from '../book/BookPages';
import '../book/book.css';

const BOOK_WIDTH = 220;

/** A closed hardcover book drawn with CSS 3D. Tapping it opens the reader. */
export function BookHero({ poemCount }: { poemCount: number }) {
  return (
    <section className="bookhero" id="the-book" aria-labelledby="book-heading">
      <a className="bookhero__link" href="#book" tabIndex={-1} aria-hidden="true">
        <div className="bookhero__scene">
          <div className="bookhero__book">
            <div className="bookhero__back" />
            <div className="bookhero__pages" />
            <div className="bookhero__spine">
              <span>ABOUT US</span>
            </div>
            <div className="bookhero__front">
              <Cover pageWidth={BOOK_WIDTH} />
            </div>
          </div>
          <div className="bookhero__shadow" />
        </div>
      </a>
      <div className="bookhero__copy">
        <h2 id="book-heading" className="section-title">
          The book
        </h2>
        <p>
          {poemCount === 1 ? 'The poem is' : `All ${poemCount} poems are`} bound together in one small book. Turn the
          pages the way you would a real one.
        </p>
        <a className="btn btn--solid" href="#book">
          Open the Book
        </a>
      </div>
    </section>
  );
}
