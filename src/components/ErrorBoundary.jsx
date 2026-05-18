import React from 'react';

/**
 * Global Error Boundary
 * Catches runtime errors and shows a useful message instead of a white screen.
 * Vercel production builds silence console errors, so without this the app
 * appears completely blank when any component throws during render.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔴 [ErrorBoundary] Caught error:', error);
        console.error('🔴 [ErrorBoundary] Component stack:', errorInfo?.componentStack);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env.DEV;
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                        fontFamily: 'system-ui, sans-serif',
                        padding: '24px',
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '40px',
                            maxWidth: '600px',
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                            Terjadi Kesalahan
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                            Halaman mengalami error. Klik tombol di bawah untuk kembali ke halaman utama.
                        </p>

                        {isDev && this.state.error && (
                            <div
                                style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    textAlign: 'left',
                                    overflowX: 'auto',
                                }}
                            >
                                <p style={{ color: '#fca5a5', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre style={{ color: '#fda4af', fontSize: '11px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 32px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            🏠 Kembali ke Halaman Utama
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
