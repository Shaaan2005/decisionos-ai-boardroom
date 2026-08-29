import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { playClickSound, playSubmitSound, playPopSound } from "../utils/audioUtils";

export const AvatarCropModal = ({ isOpen, imageSrc, onClose, onApply }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset state when opening a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Pointer drag listeners for panning the image
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX !== undefined && clientY !== undefined) {
      setPan({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove, { passive: false });
      window.addEventListener("touchend", handlePointerUp);
    }
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    playClickSound();
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset to original center & 1.0x
  const handleReset = () => {
    playPopSound();
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Crop & Export on Apply
  const handleCropAndSave = async () => {
    if (!imageRef.current) return;
    setSaving(true);
    try {
      playClickSound();
      const outputSize = 256;
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");

      const img = imageRef.current;
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      // Circular crop clip
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.save();
      // Move to canvas center
      ctx.translate(outputSize / 2, outputSize / 2);
      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Sizing calculation relative to the 240px circle in UI
      const circleUiDiameter = 240;
      const baseScale = Math.max(circleUiDiameter / naturalWidth, circleUiDiameter / naturalHeight);
      const totalScale = (outputSize / circleUiDiameter) * baseScale * zoom;

      // Apply pan
      const panRatio = outputSize / circleUiDiameter;
      ctx.translate(pan.x * panRatio, pan.y * panRatio);

      // Draw image centered
      ctx.drawImage(
        img,
        -naturalWidth / 2 * totalScale,
        -naturalHeight / 2 * totalScale,
        naturalWidth * totalScale,
        naturalHeight * totalScale
      );
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.90);
      playSubmitSound();
      await onApply(dataUrl);
      onClose();
    } catch (err) {
      console.error("Failed to crop avatar:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          style={{
            width: "min(440px, 94vw)",
            background: "#14100b",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: "14px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.2)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#19140f"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ImageIcon size={18} color="#f59e0b" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                Edit Avatar
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Crop Viewport (Discord Style) */}
          <div
            ref={containerRef}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            style={{
              position: "relative",
              width: "100%",
              height: "300px",
              background: "#0a0806",
              overflow: "hidden",
              cursor: isDragging ? "grabbing" : "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none"
            }}
          >
            {/* Movable Image */}
            <div style={{
              transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                style={{
                  maxWidth: "280px",
                  maxHeight: "280px",
                  objectFit: "contain",
                  userSelect: "none",
                  pointerEvents: "none"
                }}
              />
            </div>

            {/* Dark Mask with Clear Circular Cutout */}
            <div style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle 120px at center, transparent 120px, rgba(9, 7, 5, 0.78) 121px)"
            }} />

            {/* Glowing Circular Viewport Boundary */}
            <div style={{
              position: "absolute",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              border: "2px solid #ffffff",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 0 20px rgba(245, 158, 11, 0.4)",
              pointerEvents: "none"
            }} />
          </div>

          {/* Controls Bar: Zoom Slider + Rotate */}
          <div style={{
            padding: "16px 20px",
            background: "#16120d",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}>
            {/* Zoom Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <ZoomOut size={16} color="var(--text-muted)" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "#f59e0b",
                  height: "6px",
                  borderRadius: "3px",
                  cursor: "pointer"
                }}
              />
              <ZoomIn size={16} color="var(--text-muted)" />
            </div>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90°"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-medium)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s ease"
              }}
            >
              <RotateCw size={16} color="#f59e0b" />
            </button>
          </div>

          {/* Footer: Reset, Cancel, Apply */}
          <div style={{
            padding: "14px 20px",
            background: "#110e0a",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleCropAndSave}
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Apply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
