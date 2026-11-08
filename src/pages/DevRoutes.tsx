import DevHome from './DevHome';
import PaginationTest from './PaginationTest';
import Stage1Test from './Stage1Test';

/** Developer test pages. Only loaded by `npm run dev`; they are not part of the real website. */
export default function DevRoutes({ hash }: { hash: string }) {
  if (hash === '#pagination') return <PaginationTest />;
  if (hash === '#stage1') return <Stage1Test />;
  return <DevHome />;
}
