import React, { useState, useEffect } from "react";
import { ChevronDown, Volume2, Sparkles, PlusCircle, ArrowRight } from "lucide-react";

export const RazorpayHero = ({ onNewDecision, onScrollDown }) => {
  const [time, setTime] = useState("");
  const [soundActive, setSoundActive] = useState(true);

  // Live real-time clock in bottom right (like Buildathon's 23:47)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: "88vh",
      borderRadius: "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "28px 36px",
      backgroundImage: "url('/hero-night.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 0 100px rgba(0, 0, 0, 0.7)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      marginBottom: "40px"
    }}>
      {/* Dark Vignette Overlay for Crisp Legibility */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at center, rgba(14, 11, 8, 0.45) 0%, rgba(14, 11, 8, 0.88) 100%)",
        pointerEvents: "none",
        zIndex: 1
      }} />

      {/* Top Navbar Row inside Hero */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
      }}>
        {/* Brand Logo - Razorpay Buildathon slash style */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "1.45rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#fdfdfd" }}>
            Decision<span style={{ color: "#f59e0b" }}>OS</span>
          </span>
          <span style={{ fontSize: "1.25rem", color: "rgba(255, 255, 255, 0.45)", fontWeight: 300 }}>
            /boardroom
          </span>
        </div>

        {/* Top Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Sound Toggle */}
          <div 
            onClick={() => setSoundActive(!soundActive)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: soundActive ? "#f59e0b" : "var(--text-muted)",
              transition: "color 0.15s"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "12px" }}>
              <div style={{ width: "2px", height: soundActive ? "10px" : "3px", background: soundActive ? "#f59e0b" : "var(--text-muted)", borderRadius: "1px" }} />
              <div style={{ width: "2px", height: soundActive ? "14px" : "3px", background: soundActive ? "#f59e0b" : "var(--text-muted)", borderRadius: "1px" }} />
              <div style={{ width: "2px", height: soundActive ? "7px" : "3px", background: soundActive ? "#f59e0b" : "var(--text-muted)", borderRadius: "1px" }} />
            </div>
            <span>sound</span>
          </div>

          <button
            onClick={onNewDecision}
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              color: "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease"
            }}
          >
            <span>Convene now</span>
          </button>
        </div>
      </div>

      {/* Hero Center Body (Buildathon Typography) */}
      <div style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        maxWidth: "800px",
        margin: "auto",
        padding: "40px 0"
      }}>
        {/* Subhead */}
        <p style={{
          fontSize: "1.35rem",
          fontWeight: 500,
          color: "#e2d9cd",
          letterSpacing: "-0.01em",
          marginBottom: "12px"
        }}>
          Think you can make the right call alone?
        </p>

        {/* Massive Headline (Exact Razorpay "Prove it." scale) */}
        <h1 style={{
          fontSize: "clamp(3.8rem, 9vw, 6.8rem)",
          fontWeight: 900,
          color: "#fbf8f3",
          letterSpacing: "-0.04em",
          lineHeight: "0.95",
          marginBottom: "20px",
          textShadow: "0 4px 30px rgba(0, 0, 0, 0.8)"
        }}>
          Prove it.
        </h1>

        {/* Description */}
        <p style={{
          fontSize: "1.1rem",
          color: "#b8ada1",
          maxWidth: "600px",
          margin: "0 auto 28px",
          lineHeight: "1.5",
          fontWeight: 400
        }}>
          An AI-Powered Personal Board of Directors to stress-test your career, venture, and capital dilemmas across 6 executive lenses.
        </p>

        {/* Center CTA Pill */}
        <button
          onClick={onNewDecision}
          style={{
            background: "rgba(35, 27, 18, 0.85)",
            color: "#f5f0e8",
            border: "1px solid rgba(245, 158, 11, 0.5)",
            padding: "13px 32px",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f59e0b";
            e.currentTarget.style.color = "#0e0b08";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(35, 27, 18, 0.85)";
            e.currentTarget.style.color = "#f5f0e8";
          }}
        >
          Convene the Board
        </button>

        {/* Bottom Slashed Value Props Row */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          marginTop: "32px",
          fontSize: "0.9rem",
          fontWeight: 500,
          color: "#dfd7ce"
        }}>
          <span><strong style={{ color: "#f59e0b" }}>/</strong> 6 Autonomous Advisors</span>
          <span><strong style={{ color: "#f59e0b" }}>/</strong> ChromaDB Long-Term Memory</span>
          <span><strong style={{ color: "#f59e0b" }}>/</strong> Pre-Mortem Risk Audits</span>
        </div>
      </div>

      {/* Hero Bottom Footer Row */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        color: "#998f84",
        fontSize: "0.78rem",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.12em"
      }}>
        <div style={{ width: "60px" }} />

        {/* Center SCROLL indicator */}
        <div 
          onClick={onScrollDown}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            color: "#dfd7ce"
          }}
        >
          <span>S C R O L L</span>
          <ChevronDown size={14} className="animate-bounce" />
        </div>

        {/* Live Clock (Exact Buildathon style) */}
        <div style={{ fontWeight: 700, color: "#dfd7ce" }}>
          {time || "23:47"}
        </div>
      </div>
    </div>
  );
};
