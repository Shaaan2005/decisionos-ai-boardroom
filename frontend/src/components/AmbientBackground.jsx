import React from "react";

/**
 * Ultra-Lightweight Ambient Glow
 * Uses static GPU radial gradients to ensure 144 FPS butter-smooth scrolling.
 */
export const AmbientBackground = React.memo(() => {
  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
        transform: "translateZ(0)",
        contain: "strict"
      }}
    >
      {/* Top Amber Ambient Aura */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "25%",
          width: "550px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      {/* Bottom Indigo Aura */}
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "500px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99, 102, 241, 0.09) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />
    </div>
  );
});
