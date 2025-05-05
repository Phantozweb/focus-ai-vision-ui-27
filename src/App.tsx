
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Assistant from "./pages/Assistant";
import StudyNotes from "./pages/StudyNotes";
import Quizzes from "./pages/Quizzes";
import CaseStudies from "./pages/CaseStudies";
import NotFound from "./pages/NotFound";

// Create the query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/notes" element={<StudyNotes />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
