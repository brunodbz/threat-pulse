import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            {/* TODO: Add other protected routes here */}
            <Route path="/alerts" element={
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Alertas - Em Desenvolvimento</h1>
                </div>
              </MainLayout>
            } />
            <Route path="/analytics" element={
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Analytics - Em Desenvolvimento</h1>
                </div>
              </MainLayout>
            } />
            <Route path="/audit" element={
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Auditoria - Em Desenvolvimento</h1>
                </div>
              </MainLayout>
            } />
            <Route path="/users" element={
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Usuários - Em Desenvolvimento</h1>
                </div>
              </MainLayout>
            } />
            <Route path="/integrations" element={
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Integrações - Em Desenvolvimento</h1>
                </div>
              </MainLayout>
            } />
            <Route path="/settings" element={
              <MainLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Configurações - Em Desenvolvimento</h1>
                </div>
              </MainLayout>
            } />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
