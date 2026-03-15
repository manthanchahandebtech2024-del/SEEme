import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import JobSeeker from "./pages/JobSeeker";
import Recruiter from "./pages/Recruiter";
import ChatCoach from "./components/ChatCoach";

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/seeker" element={<JobSeeker />} />
            <Route path="/recruiter" element={<Recruiter />} />
          </Routes>
          <ChatCoach />
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}
