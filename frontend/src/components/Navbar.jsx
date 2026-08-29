import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { useLanguage, SUPPORTED_LANGUAGES } from "../context/LanguageContext";
import { 
  Compass, 
  PlusCircle, 
  LayoutDashboard, 
  Database, 
  User as UserIcon, 
  HelpCircle,
  LogOut,
  Globe,
  ChevronDown,
  Check,
  Search,
  Command,
  Bot
} from "lucide-react";
import { playNavSound, playClickSound, playPopSound } from "../utils/audioUtils";

export const Navbar = ({ activeTab, setActiveTab, onOpenPalette }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, currentLanguageConfig } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "dashboard", labelKey: "nav.dashboard", defaultLabel: "Executive Cockpit", icon: LayoutDashboard },
    { id: "new-decision", labelKey: "nav.new_decision", defaultLabel: "New Dilemma", icon: PlusCircle },
    { id: "memory-vault", labelKey: "nav.memory_vault", defaultLabel: "Memory Vault", icon: Database },
    { id: "about", labelKey: "nav.about", defaultLabel: "How It Works", icon: HelpCircle },
    { id: "profile", labelKey: "nav.profile", defaultLabel: "Profile & Values", icon: UserIcon },
  ];

  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) {
      playNavSound();
    } else {
      playClickSound();
    }
    setActiveTab(tabId);
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 999,
      background: "rgba(11, 9, 7, 0.94)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "clamp(8px, 2vw, 12px) clamp(10px, 3vw, 24px)",
      width: "100%",
      maxWidth: "100vw",
      overflow: "visible"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        width: "100%",
        flexWrap: "nowrap"
      }}>


        {/* Brand Logo */}
        <div 
          onClick={() => handleTabChange("dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer"
          }}
        >
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)"
          }}>
            <Compass size={22} color="#0b0907" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Decision<span style={{ color: "#f59e0b" }}>OS</span>
              </span>
              <span className="desktop-only" style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                textTransform: "uppercase",
                padding: "2px 6px",
                background: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                borderRadius: "4px",
                fontWeight: 700,
                border: "1px solid rgba(245, 158, 11, 0.3)"
              }}>
                {t("nav.convening", "Quorum")}
              </span>
            </div>
            <p className="desktop-only" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "-2px" }}>
              Personal Board of Directors
            </p>
          </div>
        </div>

        {/* Navigation Items with Spring Gliding Pill (Desktop >= 768px) */}
        <div className="desktop-nav-items" style={{ display: "flex", alignItems: "center", gap: "4px", background: "#15120d", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-subtle)", position: "relative" }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const NavIcon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontWeight: isActive ? 800 : 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 2,
                  transition: "color 0.15s ease"
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "8px",
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)",
                      zIndex: -1
                    }}
                  />
                )}
                <NavIcon size={15} color={isActive ? "#f59e0b" : "var(--text-muted)"} />
                <span>{t(item.labelKey, item.defaultLabel)}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Language Dropdown + User Status & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Quick Board Copilot Trigger (Desktop only) */}
          <button
            type="button"
            onClick={() => {
              playPopSound();
              window.dispatchEvent(new Event("decisionos_open_chatbot"));
            }}
            className="btn-secondary desktop-only"
            title="Open AI Board Copilot"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "0.8rem",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              color: "#fef08a",
              fontWeight: 700
            }}
          >
            <Bot size={15} color="#f59e0b" />
            <span>Copilot</span>
          </button>

          {/* Search / Command Palette Trigger Button (Desktop only) */}
          {onOpenPalette && (
            <button
              type="button"
              onClick={() => {
                playPopSound();
                onOpenPalette();
              }}
              className="btn-secondary desktop-only"
              title="Open Command Palette (Ctrl+K / Cmd+K)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)"
              }}
            >
              <Search size={14} color="#f59e0b" />
              <span>Search</span>
              <span style={{
                fontSize: "0.68rem",
                fontFamily: "var(--font-mono)",
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                color: "#fef08a",
                padding: "1px 6px",
                borderRadius: "4px",
                fontWeight: 700
              }}>
                {typeof navigator !== "undefined" && navigator.platform?.toLowerCase().includes("mac") ? "⌘K" : "Ctrl+K"}
              </span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div ref={langMenuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setLangMenuOpen(!langMenuOpen);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                color: "#fef08a",
                padding: "6px 10px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <span>{currentLanguageConfig.flag}</span>
              <span className="desktop-only" style={{ fontFamily: "var(--font-mono)" }}>{currentLanguageConfig.nativeName}</span>
              <ChevronDown size={14} style={{ transform: langMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {langMenuOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "185px",
                maxHeight: "360px",
                overflowY: "auto",
                background: "#15120d",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "10px",
                padding: "6px",
                boxShadow: "0 14px 40px rgba(0,0,0,0.95), 0 0 20px rgba(245, 158, 11, 0.2)",
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                gap: "3px"
              }}>

                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = l.code === language;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: isSelected ? "rgba(245, 158, 11, 0.15)" : "transparent",
                        border: "none",
                        color: isSelected ? "#f59e0b" : "#e2e8f0",
                        fontSize: "0.82rem",
                        fontWeight: isSelected ? 800 : 500,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </div>
                      {isSelected && <Check size={14} color="#f59e0b" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <div 
                onClick={() => handleTabChange("profile")}
                title="View Profile & Values"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: user.profile?.avatar_url ? "#15120d" : "#f59e0b",
                  border: user.profile?.avatar_url ? "1px solid #f59e0b" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "0.82rem",
                  color: "#0b0907",
                  cursor: "pointer",
                  overflow: "hidden",
                  flexShrink: 0
                }}
              >
                {user.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt={user.full_name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  user.full_name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="desktop-only" style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {user.full_name}
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                  {user.profile?.current_role || "Executive Member"}
                </span>
              </div>
            </div>
          )}


          <button
            onClick={() => {
              playClickSound();
              logout();
            }}
            title={t("nav.sign_out", "Sign Out")}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "7px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>


      {/* =========================================================================
         NATIVE MOBILE BOTTOM NAVIGATION BAR (< 768px)
         ========================================================================= */}
      <div 
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "rgba(18, 14, 10, 0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(245, 158, 11, 0.25)",
          padding: "8px 12px calc(8px + env(safe-area-inset-bottom, 8px))",
          boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.85)"
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const NavIcon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  background: "transparent",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  color: isActive ? "#f59e0b" : "var(--text-muted)",
                  cursor: "pointer",
                  minWidth: "56px"
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(245, 158, 11, 0.18)" : "transparent",
                  border: isActive ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease"
                }}>
                  <NavIcon size={18} color={isActive ? "#f59e0b" : "var(--text-secondary)"} />
                </div>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: isActive ? 800 : 500,
                  letterSpacing: "-0.01em"
                }}>
                  {item.id === "dashboard" ? "Cockpit" :
                   item.id === "new-decision" ? "New" :
                   item.id === "memory-vault" ? "Vault" :
                   item.id === "profile" ? "Profile" : "Guide"}
                </span>
              </button>
            );
          })}

          {/* Dedicated Copilot Mobile Button */}
          <button
            onClick={() => {
              playPopSound();
              window.dispatchEvent(new Event("decisionos_open_chatbot"));
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              background: "transparent",
              border: "none",
              padding: "4px 8px",
              borderRadius: "8px",
              color: "#fef08a",
              cursor: "pointer",
              minWidth: "56px"
            }}
          >
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f59e0b 0%, #ff6a00 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(245, 158, 11, 0.5)"
            }}>
              <Bot size={18} color="#090705" />
            </div>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#f59e0b" }}>
              Copilot
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

