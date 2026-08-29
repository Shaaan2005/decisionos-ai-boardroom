import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, Loader2, Image as ImageIcon, Maximize2, Move } from "lucide-react";
import { playClickSound, playSubmitSound, playPopSound } from "../utils/audioUtils";

export const AvatarCropModal = ({ isOpen, imageSrc, onClose, onApply }) => {
  // Scale slider (0.3 to 1.0 represents fraction of max possible image diameter)
  const [circleFraction, setCircleFraction] = useState(0.85); // 0.3 (small close-up) to 1.0 (full image capture)
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Image layout dimensions in viewport
  const [imgLayout, setImgLayout] = useState({ width: 280, height: 280 });

  // Pan coordinates in pixels relative to image center
  const panRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // DOM Refs
  const viewportRef = useRef(null);
  const lensRef = useRef(null);
  const maskRef = useRef(null);
  const imageRef = useRef(null);

  // Compute current circle diameter in pixels
  const maxPossibleDiameter = Math.min(imgLayout.width, imgLayout.height);
  const minDiameter = Math.min(80, maxPossibleDiameter * 0.35);
  const circleDiameter = Math.round(minDiameter + circleFraction * (maxPossibleDiameter - minDiameter));
  const circleRadius = Math.round(circleDiameter / 2);

  // Clamp pan so circle never goes outside image
  const clampPan = (x, y, radius = circleRadius) => {
    const maxPanX = Math.max(0, imgLayout.width / 2 - radius);
    const maxPanY = Math.max(0, imgLayout.height / 2 - radius);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y))
    };
  };

  // Update lens and mask DOM in real-time (0 React re-renders during dragging)
  const updateLensDom = (x, y, diameter = circleDiameter) => {
    const radius = diameter / 2;
    if (lensRef.current) {
      lensRef.current.style.width = `${diameter}px`;
      lensRef.current.style.height = `${diameter}px`;
      lensRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
    if (maskRef.current) {
      maskRef.current.style.background = `radial-gradient(circle ${radius}px at calc(50% + ${x}px) calc(50% + ${y}px), transparent ${radius - 1}px, rgba(8, 6, 4, 0.78) ${radius}px)`;
    }
  };

  // On image load, calculate proper fitted layout
  const handleImageLoad = () => {
    setImageLoaded(true);
    if (!imageRef.current) return;
    const nw = imageRef.current.naturalWidth || 300;
    const nh = imageRef.current.naturalHeight || 300;

    const maxBox = 300; // max width & height inside 340px container
    let w = maxBox;
    let h = maxBox;
    if (nw > nh) {
      h = Math.round((nh / nw) * maxBox);
    } else {
      w = Math.round((nw / nh) * maxBox);
    }

    setImgLayout({ width: w, height: h });
    panRef.current = { x: 0, y: 0 };
    const maxDiam = Math.min(w, h);
    const initDiam = Math.round(minDiameter + circleFraction * (maxDiam - minDiameter));
    updateLensDom(0, 0, initDiam);
  };

  // Reset when a new image is loaded or opened
  useEffect(() => {
    if (isOpen && imageSrc) {
      setCircleFraction(0.85);
      setRotation(0);
      panRef.current = { x: 0, y: 0 };
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Update lens DOM when circle size changes
  useEffect(() => {
    const clamped = clampPan(panRef.current.x, panRef.current.y, circleRadius);
    panRef.current = clamped;
    updateLensDom(clamped.x, clamped.y, circleDiameter);
  }, [circleFraction, imgLayout]);

  // Pointer drag listeners for 120 FPS dragging
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

    const rawX = clientX - dragStartRef.current.x;
    const rawY = clientY - dragStartRef.current.y;

    // Strict clamping within the visible image boundary
    const clamped = clampPan(rawX, rawY, circleRadius);
    panRef.current = clamped;
    updateLensDom(clamped.x, clamped.y, circleDiameter);
  }, [circleRadius, imgLayout]);

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

  // Reset to default
  const handleReset = () => {
    playPopSound();
    setCircleFraction(0.85);
    setRotation(0);
    panRef.current = { x: 0, y: 0 };
    updateLensDom(0, 0, Math.round(minDiameter + 0.85 * (maxPossibleDiameter - minDiameter)));
  };

  // Crop & Export exact circular area to 256x256 JPEG
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
      const naturalWidth = img.naturalWidth || 300;
      const naturalHeight = img.naturalHeight || 300;

      // Circle Clip Mask
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.save();
      // Center canvas
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Ratio from displayed image to output
      const scaleToOutput = outputSize / circleDiameter;
      const panRatioX = (panRef.current.x / imgLayout.width) * naturalWidth;
      const panRatioY = (panRef.current.y / imgLayout.height) * naturalHeight;

      const drawWidth = (imgLayout.width / circleDiameter) * outputSize;
      const drawHeight = (imgLayout.height / circleDiameter) * outputSize;

      const drawX = -drawWidth / 2 - (panRef.current.x / circleDiameter) * outputSize;
      const drawY = -drawHeight / 2 - (panRef.current.y / circleDiameter) * outputSize;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
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
          width: "min(490px, 95vw)",
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
                Adjust Avatar Crop
              </h3>
              <p style={{ fontSize: "0.72rem", color: "#f59e0b", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                <Move size={12} /> Drag circle over image • Slide to expand size
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
            height: "330px",
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

          {/* Scaled & Rotated Base Image Frame */}
          <div style={{
            position: "relative",
            width: `${imgLayout.width}px`,
            height: `${imgLayout.height}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Avatar preview"
              onLoad={handleImageLoad}
              onError={handleImageLoad}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.15s ease",
                userSelect: "none",
                pointerEvents: "none",
                opacity: imageLoaded ? 1 : 0.01
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
              background: `radial-gradient(circle ${circleRadius}px at center, transparent ${circleRadius - 1}px, rgba(8, 6, 4, 0.78) ${circleRadius}px)`,
              transition: "background 0.01s linear"
            }}
          />

          {/* Moveable Glowing Circular Crop Lens bounded within image */}
          <div
            ref={lensRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${circleDiameter}px`,
              height: `${circleDiameter}px`,
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
            {/* Center Reticle */}
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

        {/* Controls: Circle Size / Expansion Slider + Rotate */}
        <div style={{
          padding: "16px 20px",
          background: "#19140f",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px"
        }}>
          {/* Circle Size Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Maximize2 size={13} color="#f59e0b" />
              <span>Circle Size:</span>
            </span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={circleFraction}
              onChange={(e) => setCircleFraction(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: "#f59e0b",
                height: "6px",
                borderRadius: "3px",
                cursor: "pointer"
              }}
            />
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#f59e0b", width: "38px", textAlign: "right" }}>
              {Math.round(circleFraction * 100)}%
            </span>
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
