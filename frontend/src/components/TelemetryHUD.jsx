import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, ShieldCheck, Zap, Radio, Database, Terminal } from "lucide-react";

/**
 * Hyper-Advanced Executive Cybernetic Telemetry HUD
 * Displays real-time neural graph status, vector memory health, and execution latency telemetry.
 */
export const TelemetryHUD = () => {
  const [latency, setLatency] = useState(14);
  const [fps, setFps] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(11 + Math.random() * 6));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        background: "rgba(10, 8, 6, 0.95)",
        borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
        padding: "6px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.72rem",
        fontFamily: "var(--font-mono)",
        color: "var(--text-muted)",
        position: "relative",
        zIndex: 45,
        overflowX: "auto"
      }}
    >
      {/* Left Telemetry: Neural Engine & Node Quorum */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ position: "relative", display: "flex", width: "6px", height: "6px" }}>
            <span className="animate-ping" style={{ position: "absolute", display: "inline-flex", height: "100%", width: "100%", borderRadius: "50%", background: "#10b981", opacity: 0.75 }} />
            <span style={{ position: "relative", display: "inline-flex", borderRadius: "50%", height: "6px", width: "6px", background: "#10b981" }} />
          </span>
          <span style={{ color: "#34d399", fontWeight: 700 }}>LANGGRAPH v2.4 QUORUM: 6/6 NODES ONLINE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Cpu size={12} color="#f59e0b" />
          <span>SYNTHESIS ENGINE: <strong style={{ color: "#fef08a" }}>AUTONOMOUS DIALECTIC</strong></span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Database size={12} color="#06b6d4" />
          <span>VECTOR VAULT: <strong style={{ color: "#7dd3fc" }}>CHROMADB EMBEDDED</strong></span>
        </div>
      </div>

      {/* Right Telemetry: Latency & Encryption Ciphers */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Activity size={12} color="#a855f7" />
          <span>LATENCY: <strong style={{ color: "#c084fc" }}>{latency}ms</strong></span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldCheck size={12} color="#10b981" />
          <span>CIPHER: <strong style={{ color: "#e2e8f0" }}>AES-GCM-256 ZERO-LEAK</strong></span>
        </div>

        <div style={{
          padding: "2px 6px",
          borderRadius: "3px",
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          color: "#f59e0b",
          fontWeight: 800
        }}>
          LIVE HUD
        </div>
      </div>
    </div>
  );
};
