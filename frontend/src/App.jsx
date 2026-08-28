import React, { lazy, Suspense, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { useTypingSound } from "./hooks/useTypingSound";
import { Navbar } from "./components/Navbar";
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

const MainApp = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [booting, setBooting] = useState(true);
  const [authView, setAuthView] = useState("login");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDecisionId, setSelectedDecisionId] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Global crisp typing sound on all keyboard input
  useTypingSound();

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
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
        {!isAuthenticated ? (
          <div>
            {authView === "register" ? (
              <RegisterPage onSwitchToLogin={() => setAuthView("login")} />
            ) : (
              <LoginPage onSwitchToRegister={() => setAuthView("register")} />
            )}
          </div>
        ) : (
          <>
            <Navbar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onOpenPalette={() => setIsPaletteOpen(true)}
            />

            <CommandPalette
              isOpen={isPaletteOpen}
              onClose={() => setIsPaletteOpen(false)}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setIsPaletteOpen(false);
              }}
            />

            <ErrorBoundary>
              <main style={{ flexGrow: 1 }} className="page-fade-in" key={activeTab}>
                {activeTab === "dashboard" && (
                  <DashboardPage
                    onSelectDecision={(id) => {
                      setSelectedDecisionId(id);
                      setActiveTab("decision-detail");
                    }}
                    onNewDecision={() => setActiveTab("new-decision")}
                  />
                )}

                {activeTab === "new-decision" && (
                  <NewDecisionPage
                    onCancel={() => setActiveTab("dashboard")}
                    onCreated={(id) => {
                      setSelectedDecisionId(id);
                      setActiveTab("decision-detail");
                    }}
                  />
                )}

                {activeTab === "decision-detail" && (
                  selectedDecisionId ? (
                    <DecisionDetailPage
                      decisionId={selectedDecisionId}
                      onBack={() => setActiveTab("dashboard")}
                    />
                  ) : (
                    <DashboardPage
                      onSelectDecision={(id) => {
                        setSelectedDecisionId(id);
                        setActiveTab("decision-detail");
                      }}
                      onNewDecision={() => setActiveTab("new-decision")}
                    />
                  )
                )}

                {activeTab === "memory-vault" && (
                  <MemoryVaultPage />
                )}

                {activeTab === "about" && (
                  <AboutPage onGetStarted={() => setActiveTab("new-decision")} />
                )}

                {activeTab === "profile" && (
                  <ProfilePage />
                )}
              </main>
            </ErrorBoundary>

            {/* Global Executive Footer */}
            <Footer 
              onNavigate={(tab) => setActiveTab(tab)} 
              onOpenPalette={() => setIsPaletteOpen(true)} 
            />
          </>
        )}
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
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
