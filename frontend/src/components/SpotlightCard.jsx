import React, { useRef } from "react";
import { motion } from "framer-motion";

/**
 * Ultra-Fast High-Performance Spotlight Card
 * Uses direct CSS custom properties on mousemove without triggering React re-renders.
 * Butter-smooth 120 FPS performance.
 */
export const SpotlightCard = React.memo(({ 
  children, 
  className = "", 
  style = {}, 
  spotlightColor = "rgba(245, 158, 11, 0.18)",
  borderColor = "#f59e0b",
  onClick,
  ...props 
}) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--spotlight-x", `${x}px`);
    cardRef.current.style.setProperty("--spotlight-y", `${y}px`);
    cardRef.current.style.setProperty("--spotlight-opacity", "1");
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--spotlight-opacity", "0");
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ y: -3, transition: { duration: 0.15, ease: "easeOut" } }}
      className={`spotlight-card ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        background: "rgba(21, 18, 13, 0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.5)",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
        ...style
      }}
      {...props}
    >
      {/* Hardware-Accelerated Radial Spotlight (Zero React Re-renders) */}
      <div
        className="card-spotlight-layer"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          opacity: "var(--spotlight-opacity, 0)",
          transition: "opacity 0.2s ease",
          background: `radial-gradient(400px circle at var(--spotlight-x, -500px) var(--spotlight-y, -500px), ${spotlightColor}, transparent 65%)`
        }}
      />

      {/* Card Contents */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
});
