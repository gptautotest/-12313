
import React, { Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Sonner } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import './App.css';

// Ленивая загрузка компонентов чтобы сократить время загрузки
const SolanaControls = React.lazy(() => import('./components/SolanaControls'));
const SingleFile = React.lazy(() => import('./pages/SingleFile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Создаем новый QueryClient с правильными настройками для ретраев
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 10000,
      refetchOnWindowFocus: false,
    },
  },
});

// Компонент для обработки ошибок
class ErrorBoundary extends React.Component<{children: React.ReactNode}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("🔴 ПОЙМАЛИ ОШИБКУ:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h1 className="text-xl font-bold mb-2">💸 МЕМКОИН-ОШИБКА! 💸</h1>
          <p>Даже миллионеры иногда ошибаются! Наш супер-бот столкнулся с проблемой.</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => window.location.reload()}
          >
            🚀 ПЕРЕЗАПУСТИТЬ РАКЕТУ
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Компонент загрузки
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="mb-4 text-3xl font-bold animate-pulse">⚡ ЗАГРУЖАЕМ СУПЕР-БОТА ⚡</div>
      <div className="text-xl">Скоро полетим на луну! 🚀</div>
    </div>
  </div>
);

const App = () => {
  const [mounted, setMounted] = useState(false);
  
  // Используем React.useEffect для безопасного монтирования компонентов
  React.useEffect(() => {
    setMounted(true);
    
    // Глобальный обработчик необработанных обещаний
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('⚠️ Необработанная ошибка:', event.reason);
      event.preventDefault(); // Предотвращаем стандартное поведение
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  if (!mounted) return <LoadingFallback />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <div className="flex flex-col md:flex-row min-h-screen">
                <SolanaControls />
                <div className="md:ml-64 p-4 flex-1">
                  <Routes>
                    <Route path="/" element={<SingleFile />} />
                    <Route path="/index" element={<SingleFile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </Suspense>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
