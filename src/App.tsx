import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import TutorsList from "./pages/TutorsList";
import TutorProfile from "./pages/TutorProfile";
import Trends from "./pages/Trends";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/tutors" element={<TutorsList />} />
            <Route path="/tutor/:tutorId" element={<TutorProfile />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:tutorId" element={<Chat />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Bottom Navigation - Persistent across all pages */}
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
