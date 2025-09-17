import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import { Login } from "./components/auth/Login";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Accounts from "./pages/Accounts";
import Investments from "./pages/Investments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <FinanceProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => {}} user={user} />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
