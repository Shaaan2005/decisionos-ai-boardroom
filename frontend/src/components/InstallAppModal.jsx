import React, { useState, useEffect } from "react";
import { X, Smartphone, Download, CheckCircle, Apple, HelpCircle, ShieldCheck } from "lucide-react";

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState("android"); // 'android' | 'ios'

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 999999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0, 0, 0, 0.82)",
      backdropFilter: "blur(12px)",
      padding: "20px"
    }}>
      <div style={{
        background: "linear-gradient(180deg, #18140f 0%, #0d0b08 100%)",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "480px",
        padding: "28px",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.2)",
        position: "relative",
        color: "#ffffff"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>

        {/* Header with App Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "#14100c",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
            flexShrink: 0
          }}>
            <img src="/decisionos-logo.png" alt="DecisionOS" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>
              Decision<span style={{ color: "#f59e0b" }}>OS</span> Mobile
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
              AI Personal Board of Directors in your pocket
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.04)",
          padding: "4px",
          borderRadius: "10px",
          marginBottom: "20px"
        }}>
          <button
            onClick={() => setActiveTab("android")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "android" ? "#f59e0b" : "transparent",
              color: activeTab === "android" ? "#0b0907" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <Smartphone size={16} /> Android (.APK)
          </button>
          <button
            onClick={() => setActiveTab("ios")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "ios" ? "#f59e0b" : "transparent",
              color: activeTab === "ios" ? "#0b0907" : "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <Apple size={16} /> iPhone & iPad
          </button>
        </div>

        {/* Android Content */}
        {activeTab === "android" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <a
              href="/DecisionOS.apk"
              download="DecisionOS.apk"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px 20px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#0b0907",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 0 25px rgba(245, 158, 11, 0.4)",
                transition: "transform 0.15s ease"
              }}
            >
              <Download size={20} strokeWidth={2.5} />
              Download Android App (.APK)
            </a>

            {deferredPrompt && (
              <button
                onClick={handleNativeInstall}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer"
                }}
              >
                <Smartphone size={18} color="#f59e0b" />
                1-Click Instant PWA Install
              </button>
            )}

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "10px 14px",
              background: "rgba(245, 158, 11, 0.08)",
              borderRadius: "10px",
              border: "1px solid rgba(245, 158, 11, 0.15)",
              marginTop: "6px"
            }}>
              <ShieldCheck size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                Tap the downloaded <strong>DecisionOS.apk</strong> file on your Android phone and select <em>Install</em>.
              </p>
            </div>
          </div>
        )}

        {/* iOS Content */}
        {activeTab === "ios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.04)",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.85rem",
              lineHeight: "1.6"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#f59e0b", fontWeight: 700 }}>
                <span>1.</span> Open Safari & Tap Share
              </div>
              <p style={{ margin: "0 0 10px 20px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Tap the <strong>Share</strong> button at the bottom of Safari (the square with arrow pointing up).
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#f59e0b", fontWeight: 700 }}>
                <span>2.</span> Tap "Add to Home Screen"
              </div>
              <p style={{ margin: "0 0 0 20px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Scroll down and select <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
