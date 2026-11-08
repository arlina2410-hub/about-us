import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  failed: boolean;
}

/** If anything crashes, show a calm message instead of a blank white screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ABOUT US crashed', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          padding: 24,
          textAlign: 'center',
          background: '#F7F1E3',
          color: '#2E2A25',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Tanker', serif", fontWeight: 400, fontSize: '2.4rem', color: '#2F4A3A' }}>
            ABOUT US
          </h1>
          <p style={{ margin: '12px 0 20px', fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.15rem' }}>
            Something went wrong while opening the page.
          </p>
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }}
            style={{
              minHeight: 48,
              padding: '0 24px',
              border: '1.5px solid #2F4A3A',
              borderRadius: 999,
              background: '#2F4A3A',
              color: '#F7F1E3',
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </main>
    );
  }
}
