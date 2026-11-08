/** Developer menu, reachable at #dev. */
export default function DevHome() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <h1 style={{ fontFamily: "'Tanker', serif", fontWeight: 400, fontSize: '2.6rem', margin: 0 }}>ABOUT US</h1>
      <p>Development menu.</p>
      <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
        <li><a href="#">Home</a></li>
        <li><a href="#book">Open the book</a></li>
        <li><a href="#pagination">Page layout test (Stage 2)</a></li>
        <li><a href="#stage1">Design tokens test (Stage 1)</a></li>
      </ul>
    </main>
  );
}
