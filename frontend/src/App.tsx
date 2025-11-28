import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DiagnosticPage from "./pages/DiagnosticPage";
import ReportPage from "./pages/ReportPage";
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Import PrivacyPolicy
import NotFound from "./pages/NotFound";
import { DiagnosticProvider } from "./context/DiagnosticContext";
import { BackendHealthIndicator } from "@/components/BackendHealthIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner
        position="bottom-center" // Center toasts horizontally at the bottom
      />
      <BackendHealthIndicator />
      <DiagnosticProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* Add PrivacyPolicy route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DiagnosticProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;