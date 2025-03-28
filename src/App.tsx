import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SingleFile from "./pages/SingleFile";
import NotFound from "./pages/NotFound";
import SolanaControls from './components/SolanaControls';
import ErrorBoundary from './components/ErrorBoundary';
import { Suspense } from 'react';

// Создаем клиент запросов с обработкой ошибок
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("🚨 ОШИБКА ЗАПРОСА:", error);
      }
    },
  },
});

// Компонент для загрузки
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="bg-solana p-8 rounded-xl shadow-xl">
      <p className="text-white font-bold text-xl">ЗАГРУЖАЕМ РАКЕТУ НА ЛУНУ... 🚀</p>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <div className="flex">
              <SolanaControls />
              <div className="ml-64 p-4 flex-1">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<SingleFile />} />
                    <Route path="/index" element={<SingleFile />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;