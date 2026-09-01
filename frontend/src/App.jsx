import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { useTypingSound } from "./hooks/useTypingSound";
import { Navbar } from "./components/Navbar";
import { TAB_ROUTES } from "./routes";
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const NewDecisionPage = lazy(() => import("./pages/NewDecisionPage").then((module) => ({ default: module.NewDecisionPage })));
const DecisionDetailPage = lazy(() => import("./pages/DecisionDetailPage").then((module) => ({ default: module.DecisionDetailPage })));
const MemoryVaultPage = lazy(() => import("./pages/MemoryVaultPage").then((module) => ({ default: module.MemoryVaultPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const DecisionOSBootLoader = lazy(() => import("./components/DecisionOSBootLoader").then((module) => ({ default: module.DecisionOSBootLoader })));
const SmartAIChatBot = lazy(() => import("./components/SmartAIChatBot").then((module) => ({ default: module.SmartAIChatBot })));
const CommandPalette = lazy(() => import("./components/CommandPalette").then((module) => ({ default: module.CommandPalette })));
import { AmbientBackground } from "./components/AmbientBackground";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Footer } from "./components/Footer";
import { AnimatePresence } from "framer-motion";

// Public auth routes: bounce to the cockpit once a session exists.
const LoginRoute = () => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <LoginPage onSwitchToRegister={() => navigate("/register")} />;
};

const RegisterRoute = () => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <RegisterPage onSwitchToLogin={() => navigate("/login")} />;
};

// Shared authenticated chrome (nav, palette, footer) around all app routes.
const ProtectedLayout = () => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar onOpenPalette={() => setIsPaletteOpen(true)} />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={(tab) => {
          navigate(TAB_ROUTES[tab] || "/");
          setIsPaletteOpen(false);
        }}
      />

      <ErrorBoundary>
        <main style={{ flexGrow: 1 }} className="page-fade-in" key={location.pathname}>
          <Outlet />
        </main>
      </ErrorBoundary>

      {/* Global Executive Footer */}
      <Footer
        onNavigate={(tab) => navigate(TAB_ROUTES[tab] || "/")}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />
    </>
  );
};

const DashboardRoute = () => {
  const navigate = useNavigate();
  return (
    <DashboardPage
      onSelectDecision={(id) => navigate(`/decisions/${id}`)}
      onNewDecision={() => navigate("/decisions/new")}
    />
  );
};

const NewDecisionRoute = () => {
  const navigate = useNavigate();
  return (
    <NewDecisionPage
      onCancel={() => navigate("/")}
      onCreated={(id) => navigate(`/decisions/${id}`)}
    />
  );
};

const DecisionDetailRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <DecisionDetailPage
      decisionId={id}
      onBack={() => navigate("/")}
    />
  );
};

const AboutRoute = () => {
  const navigate = useNavigate();
  return <AboutPage onGetStarted={() => navigate("/decisions/new")} />;
};

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  const [booting, setBooting] = useState(() => !sessionStorage.getItem("decisionos_session_initialized"));

  // Global crisp typing sound on all keyboard input
  useTypingSound();

  const handleBootComplete = () => {
    sessionStorage.setItem("decisionos_session_initialized", "true");
    setBooting(false);
  };


  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "#0b0907" }}>
      <Suspense fallback={null}>
        <AnimatePresence>
          {booting && <DecisionOSBootLoader onComplete={handleBootComplete} />}
        </AnimatePresence>

      {/* Dynamic Floating Glowing Ambient Orbs */}
      <AmbientBackground />

      <div className="tech-grid" />

      {/* Main Content Area */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<DashboardRoute />} />
            <Route path="/decisions/new" element={<NewDecisionRoute />} />
            <Route path="/decisions/:id" element={<DecisionDetailRoute />} />
            <Route path="/memory" element={<MemoryVaultPage />} />
            <Route path="/about" element={<AboutRoute />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Smart LinkedIn-Style Docked AI Board Copilot Chat Box (Hidden during boot sequence) */}
      {!booting && isAuthenticated && <SmartAIChatBot />}
      </Suspense>
    </div>
  );
};

import { LanguageProvider } from "./context/LanguageContext";

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
