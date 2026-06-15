import TodayPlanFinal from "./pages/TodayPlanFinal";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Roadmaps from "./pages/Roadmaps";
import RolePractice from "./pages/RolePractice.jsx";
import DSA from "./pages/DSA";
import Practice from "./pages/Practice";
import Resources from "./pages/Resources";
import Companies from "./pages/Companies";
import ResumeCoach from "./pages/ResumeCoach";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyRoleDetail from "./pages/CompanyRoleDetail";
import RoleDetail from "./pages/RoleDetail";
import Progress from "./pages/Progress";
import Admin from "./pages/Admin";
import InterviewCoach from "./pages/InterviewCoach";
import ProfileSetup from "./pages/ProfileSetup";
import "./styles/globalPageStyle.css";
import "./styles/uniformTheme.css";
import "./styles/resourcesForceFinal.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/today" element={<TodayPlanFinal />} />
            <Route path="/today-plan" element={<Today />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/roadmap" element={<Roadmaps />} />
            <Route path="/role-practice/:role" element={<RolePractice />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/dsa-tracker" element={<DSA />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice-mcqs" element={<Practice />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companyName" element={<CompanyDetail />
          <Route path="/companies/:companyName/roles/:roleIndex" element={<CompanyRoleDetail />} />} />
            <Route path="/companies/:companyName/roles/:roleId" element={<RoleDetail />} />
            <Route path="/resume" element={<ResumeCoach />} />
            <Route path="/resume-coach" element={<ResumeCoach />} />
            <Route path="/interview" element={<InterviewCoach />} />
            <Route path="/interview-coach" element={<InterviewCoach />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
