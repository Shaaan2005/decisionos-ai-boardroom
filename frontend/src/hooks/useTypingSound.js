 import { useEffect, useCallback } from "react";
import { playTypingSound } from "../utils/audioUtils";

/**
 * useTypingSound
 *
 * Attaches typing sound to keyboard input.
 *
 * Usage A — global (attach to window):
 *   useTypingSound();
 *
 * Usage B — scoped to an input ref:
 *   const ref = useRef();
 *   useTypingSound(ref);
 *   <textarea ref={ref} ... />
 */
export function useTypingSound(targetRef = null) {
  const handleKeyDown = useCallback((e) => {
    // Only fire for printable characters + space/backspace/enter
    const skip = ["Tab", "Escape", "CapsLock", "Shift", "Control", "Alt", "Meta", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"];
    if (!skip.includes(e.key)) {
      playTypingSound();
    }
  }, []);

  useEffect(() => {
    const target = targetRef ? targetRef.current : window;
    if (!target) return;
    target.addEventListener("keydown", handleKeyDown);
    return () => target.removeEventListener("keydown", handleKeyDown);
  }, [targetRef, handleKeyDown]);
}
