import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  LayoutDashboard, 
  PlusCircle, 
  Database, 
  User, 
  HelpCircle, 
  Globe, 
  Sliders, 
  Flame, 
  Mic, 
  Gavel, 
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X
} from "lucide-react";
import { playClickSound, playPopSound, playNavSound } from "../utils/audioUtils";
import { useLanguage, SUPPORTED_LANGUAGES } from "../context/LanguageContext";

/**
 * Global Keyboard Command Palette (Cmd + K / Ctrl + K)
 * Fast keyboard-first executive navigation and decision action switcher.
 */
export const CommandPalette = ({ isOpen, onClose, onNavigate, onSelectDecision }) => {
  const { setLanguage, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commandItems = [
    // Core Navigation
    { id: "dashboard", title: "Go to Executive Dashboard", category: "Navigation", icon: LayoutDashboard, action: () => onNavigate("dashboard") },
    { id: "new-decision", title: "Convene New Board Meeting (+)", category: "Actions", icon: PlusCircle, action: () => onNavigate("new-decision") },
    { id: "memory-vault", title: "Explore Long-Term Memory Vault", category: "Navigation", icon: Database, action: () => onNavigate("memory-vault") },
    { id: "profile", title: "Executive Profile & Core Values", category: "Navigation", icon: User, action: () => onNavigate("profile") },
    { id: "about", title: "How It Works & 4-Step Guide", category: "Navigation", icon: HelpCircle, action: () => onNavigate("about") },

    // Languages
    { id: "lang-en", title: "Switch Language to English (EN)", category: "Language", icon: Globe, action: () => setLanguage("en") },
    { id: "lang-hi", title: "हिंदी में बदलें (Hindi)", category: "Language", icon: Globe, action: () => setLanguage("hi") },
    { id: "lang-es", title: "Cambiar a Español (Spanish)", category: "Language", icon: Globe, action: () => setLanguage("es") },
    { id: "lang-fr", title: "Changer en Français (French)", category: "Language", icon: Globe, action: () => setLanguage("fr") },
    { id: "lang-de", title: "Auf Deutsch Wechseln (German)", category: "Language", icon: Globe, action: () => setLanguage("de") },
    { id: "lang-ja", title: "日本語に切り替え (Japanese)", category: "Language", icon: Globe, action: () => setLanguage("ja") }
  ];

  // Filter commands
  const filteredCommands = commandItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      playClickSound();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      playClickSound();
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      playPopSound();
      filteredCommands[selectedIndex].action();
      onClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "12vh",
          paddingLeft: "16px",
          paddingRight: "16px"
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "600px",
            background: "#13100b",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: "14px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.2)",
            overflow: "hidden"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header Input */}
          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            gap: "12px"
          }}>
            <Search size={20} color="#f59e0b" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or jump to page... (e.g. 'Dashboard', 'New Dilemma', 'Español')"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "1.05rem",
                outline: "none"
              }}
            />
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "4px 8px",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                cursor: "pointer"
              }}
            >
              ESC
            </button>
          </div>

          {/* Command List */}
          <div style={{ maxHeight: "360px", overflowY: "auto", padding: "8px" }}>
            {filteredCommands.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No matching executive actions found.
              </div>
            ) : (
              filteredCommands.map((item, index) => {
                const ItemIcon = item.icon;
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playPopSound();
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: isSelected ? "rgba(245, 158, 11, 0.15)" : "transparent",
                      border: `1px solid ${isSelected ? "rgba(245, 158, 11, 0.35)" : "transparent"}`,
                      cursor: "pointer",
                      transition: "all 0.1s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <ItemIcon size={16} color={isSelected ? "#f59e0b" : "var(--text-muted)"} />
                      </div>
                      <span style={{ fontSize: "0.9rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#ffffff" : "var(--text-secondary)" }}>
                        {item.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text-muted)"
                      }}>
                        {item.category}
                      </span>
                      {isSelected && <CornerDownLeft size={14} color="#f59e0b" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            background: "rgba(0, 0, 0, 0.3)",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "0.75rem",
            color: "var(--text-muted)"
          }}>
            <div style={{ display: "flex", gap: "14px" }}>
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
            </div>
            <span>DecisionOS Command Pilot</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
