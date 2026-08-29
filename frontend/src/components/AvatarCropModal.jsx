import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { playClickSound, playSubmitSound, playPopSound } from "../utils/audioUtils";

export const AvatarCropModal = ({ isOpen, imageSrc, onClose, onApply }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset parameters whenever a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
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

  // Reset to default
  const handleReset = () => {
    playPopSound();
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
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
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const circleUiDiameter = 220;
      const baseScale = Math.max(circleUiDiameter / naturalWidth, circleUiDiameter / naturalHeight);
      const totalScale = (outputSize / circleUiDiameter) * baseScale * zoom;
      const panRatio = outputSize / circleUiDiameter;

      ctx.translate(pan.x * panRatio, pan.y * panRatio);

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

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
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
          width: "min(460px, 95vw)",
          background: "#16120d",
          border: "1px solid rgba(245, 158, 11, 0.5)",
          borderRadius: "16px",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.98), 0 0 35px rgba(245, 158, 11, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 100001
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
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "rgba(245, 158, 11, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ImageIcon size={16} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                Edit Avatar
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
                Drag to reposition • Use slider to zoom
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

        {/* Interactive Discord-Style Crop Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={{
            position: "relative",
            width: "100%",
            height: "290px",
            background: "#0a0806",
            overflow: "hidden",
            cursor: isDragging ? "grabbing" : "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none"
          }}
        >
          {/* Spinner while image is loading */}
          {!imageLoaded && (
            <div style={{ position: "absolute", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <Loader2 size={28} color="#f59e0b" className="animate-spin" />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Loading Image...</span>
            </div>
          )}

          {/* Movable & Zoomable Image */}
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.08s ease-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Avatar preview"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              style={{
                maxWidth: "260px",
                maxHeight: "260px",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
                opacity: imageLoaded ? 1 : 0.01,
                transition: "opacity 0.15s ease"
              }}
            />

          </div>

          {/* Dark Outer Mask with Circular Clear Viewport */}
          <div style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle 110px at center, transparent 110px, rgba(10, 8, 6, 0.78) 111px)"
          }} />

          {/* Glowing White/Amber Circular Guide */}
          <div style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.6), 0 0 25px rgba(245, 158, 11, 0.4)",
            pointerEvents: "none"
          }} />
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
              min="1"
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
    </div>
  );
};
