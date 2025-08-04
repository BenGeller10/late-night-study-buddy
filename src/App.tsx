import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DynamicBottomNavigation from "@/components/layout/DynamicBottomNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import TutorsList from "./pages/TutorsList";
import TutorProfile from "./pages/TutorProfile";
import LikedTutors from "./pages/LikedTutors";
import LikedStudents from "./pages/LikedStudents";
import Bookings from "./pages/Bookings";
import Trends from "./pages/Trends";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import MySessions from "./pages/MySessions";
import StudyGroups from "./pages/StudyGroups";
import SetAvailability from "./pages/SetAvailability";
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/tutors" element={<TutorsList />} />
            <Route path="/tutor/:tutorId" element={<TutorProfile />} />
            <Route path="/liked-tutors" element={<LikedTutors />} />
            <Route path="/liked-students" element={<LikedStudents />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:tutorId" element={<Chat />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-sessions" element={<MySessions />} />
            <Route path="/study-groups" element={<StudyGroups />} />
            <Route path="/set-availability" element={<SetAvailability />} />
            <Route path="/bookings" element={<Bookings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Dynamic Bottom Navigation - Adapts to user role */}
          <DynamicBottomNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
