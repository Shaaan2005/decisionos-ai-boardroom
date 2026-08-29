import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, Loader2, Image as ImageIcon, Move } from "lucide-react";
import { playClickSound, playSubmitSound, playPopSound } from "../utils/audioUtils";

export const AvatarCropModal = ({ isOpen, imageSrc, onClose, onApply }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Performance-optimized Ref-based coordinates for 120 FPS zero-lag dragging
  const panRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // DOM Refs
  const viewportRef = useRef(null);
  const lensRef = useRef(null);
  const maskRef = useRef(null);
  const imageRef = useRef(null);

  // Reset when a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      panRef.current = { x: 0, y: 0 };
      setImageLoaded(false);
      updateLensDom(0, 0);
    }
  }, [isOpen, imageSrc]);

  // Direct DOM update for zero lag
  const updateLensDom = (x, y) => {
    if (lensRef.current) {
      lensRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
    if (maskRef.current) {
      // Update the transparent radial mask center
      maskRef.current.style.background = `radial-gradient(circle 90px at calc(50% + ${x}px) calc(50% + ${y}px), transparent 89px, rgba(10, 8, 6, 0.78) 90px)`;
    }
  };

  // Drag start handler (Pointer / Mouse / Touch)
  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragStartRef.current = {
      x: clientX - panRef.current.x,
      y: clientY - panRef.current.y
    };
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    let newX = clientX - dragStartRef.current.x;
    let newY = clientY - dragStartRef.current.y;

    // Bounds limit lens inside viewport (max ±120px horizontally and ±90px vertically)
    newX = Math.max(-130, Math.min(130, newX));
    newY = Math.max(-95, Math.min(95, newY));

    panRef.current = { x: newX, y: newY };
    updateLensDom(newX, newY);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    playClickSound();
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset to center
  const handleReset = () => {
    playPopSound();
    setZoom(1);
    setRotation(0);
    panRef.current = { x: 0, y: 0 };
    updateLensDom(0, 0);
  };

  // Crop & Export to 256x256 circular JPEG
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
      const naturalWidth = img.naturalWidth || img.width || 300;
      const naturalHeight = img.naturalHeight || img.height || 300;

      // Circle Clip Mask
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.save();
      // Center canvas
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Lens diameter in UI is 180px
      const lensUiDiameter = 180;
      const baseScale = Math.max(lensUiDiameter / naturalWidth, lensUiDiameter / naturalHeight);
      const totalScale = (outputSize / lensUiDiameter) * baseScale * zoom;

      // Invert pan so moving lens right shifts crop region correctly
      const panRatio = outputSize / lensUiDiameter;
      ctx.translate(-panRef.current.x * panRatio, -panRef.current.y * panRatio);

      ctx.drawImage(
        img,
        (-naturalWidth / 2) * totalScale,
        (-naturalHeight / 2) * totalScale,
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

  if (!isOpen || !imageSrc || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(480px, 95vw)",
          background: "#16120d",
          border: "1px solid rgba(245, 158, 11, 0.5)",
          borderRadius: "16px",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.98), 0 0 35px rgba(245, 158, 11, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000000,
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1c1710"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ImageIcon size={16} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Moveable Crop Circle
              </h3>
              <p style={{ fontSize: "0.72rem", color: "#f59e0b", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                <Move size={12} /> Drag the circle anywhere over the image
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Interactive Workspace */}
        <div
          ref={viewportRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={{
            position: "relative",
            width: "100%",
            height: "310px",
            background: "#080604",
            overflow: "hidden",
            cursor: "crosshair",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            touchAction: "none"
          }}
        >
          {/* Spinner while image is loading */}
          {!imageLoaded && (
            <div style={{ position: "absolute", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <Loader2 size={28} color="#f59e0b" className="animate-spin" />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Loading Image...</span>
            </div>
          )}

          {/* Scaled & Rotated Base Image */}
          <div style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.12s ease-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Avatar preview"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              style={{
                maxWidth: "280px",
                maxHeight: "280px",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
                opacity: imageLoaded ? 1 : 0.01,
                transition: "opacity 0.15s ease"
              }}
            />
          </div>

          {/* Dynamic Dark Mask with Moveable Circular Cutout */}
          <div
            ref={maskRef}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle 90px at center, transparent 89px, rgba(8, 6, 4, 0.78) 90px)",
              transition: "background 0.01s linear"
            }}
          />

          {/* Moveable Glowing Circular Crop Lens */}
          <div
            ref={lensRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "180px",
              height: "180px",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: "2px solid #f59e0b",
              boxShadow: "0 0 0 1px #ffffff, 0 0 25px rgba(245, 158, 11, 0.6), inset 0 0 15px rgba(245, 158, 11, 0.2)",
              cursor: "move",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "none"
            }}
          >
            {/* Center Reticle / Crosshair Indicator */}
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.4)",
              border: "1px solid #ffffff",
              pointerEvents: "none"
            }} />
          </div>
        </div>

        {/* Controls: Zoom Slider + Rotate */}
        <div style={{
          padding: "16px 20px",
          background: "#19140f",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          {/* Zoom Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <ZoomOut size={16} color="var(--text-muted)" />
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.02"
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

          {/* Rotate 90° Clockwise */}
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90° Clockwise"
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
              transition: "all 0.15s ease"
            }}
          >
            <RotateCw size={16} color="#f59e0b" />
          </button>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "14px 20px",
          background: "#130f0a",
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
              style={{ padding: "8px 22px", fontSize: "0.85rem" }}
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
      </div>
    </div>,
    document.body
  );
};
