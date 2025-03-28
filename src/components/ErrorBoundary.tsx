
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 ПОЙМАНА ОШИБКА В КОМПОНЕНТЕ:", error);
    console.error("Детали ошибки:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900 to-red-950 text-white">
          <h1 className="text-3xl font-bold mb-4">🚨 КРИТИЧЕСКАЯ ОШИБКА В КОДЕ!</h1>
          <div className="bg-black/30 p-6 rounded-lg max-w-2xl w-full mb-4">
            <p className="mb-4 text-red-300">{this.state.error?.message || "Неизвестная ошибка"}</p>
            <details className="text-sm opacity-70">
              <summary className="cursor-pointer">Технические детали для гениев</summary>
              <pre className="mt-2 p-2 bg-black/50 rounded overflow-auto max-h-60">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-solana hover:bg-solana-secondary text-white font-bold rounded-full transition-colors"
          >
            🔄 ПЕРЕЗАПУСТИТЬ ПРИЛОЖЕНИЕ
          </button>
          <p className="mt-6 text-sm text-center max-w-md opacity-70">
            Это не баг, это фича! Даже мемкоин-миллионеры иногда перезагружают свои ламборгини!
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
