/**
 * DecisionOS Audio Engine
 * Synthesized sound effects using the Web Audio API.
 * No external files required — all sounds are generated procedurally.
 */

let _audioCtx = null;

/** Lazily initialize a shared AudioContext (requires prior user gesture). */
export function getCtx() {
  if (!_audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      _audioCtx = new AudioCtx();
    }
  }
  if (_audioCtx && _audioCtx.state === "suspended") {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

/** Explicitly unlock and resume audio context on user gesture. */
export function unlockAudio() {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

// Global unlock on any early interaction
if (typeof window !== "undefined") {
  const unlockEvents = ["click", "touchstart", "keydown", "mousedown", "pointerdown"];
  const handleEarlyUnlock = () => {
    unlockAudio();
  };
  unlockEvents.forEach((ev) => {
    window.addEventListener(ev, handleEarlyUnlock, { passive: true });
  });
}

// ─────────────────────────────────────────────
// 1. CRISP MECHANICAL TYPING CLICK
// ─────────────────────────────────────────────
let _lastTypeSoundTime = 0;

/**
 * Play a single crisp mechanical keyboard click.
 * Throttled to 30ms so rapid keystrokes don't stack.
 */
export function playTypingSound() {
  const now = Date.now();
  if (now - _lastTypeSoundTime < 30) return;
  _lastTypeSoundTime = now;

  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.025);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 3200;

    const shelf = ctx.createBiquadFilter();
    shelf.type = "lowshelf";
    shelf.frequency.value = 800;
    shelf.gain.value = 4;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0, t);
    gainNode.gain.linearRampToValueAtTime(0.35, t + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

    noiseSource.connect(hpf);
    hpf.connect(shelf);
    shelf.connect(gainNode);
    gainNode.connect(ctx.destination);
    noiseSource.start(t);
    noiseSource.stop(t + 0.03);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 1B. ASCENDING PROGRESS / DOWNLOAD TICK (0 -> 100%)
// ─────────────────────────────────────────────
let _lastProgressVal = -1;
let _lastProgressTime = 0;

/**
 * Play an ascending futuristic data-loading / calibration pulse.
 * Frequency rises from 0% (440Hz) to 100% (2400Hz) as the loader fills up.
 */
export function playProgressTick(percent) {
  const now = Date.now();
  if (now - _lastProgressTime < 30) return;
  if (percent === _lastProgressVal) return;
  _lastProgressVal = percent;
  _lastProgressTime = now;

  try {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;

    const normalized = Math.max(0, Math.min(100, percent)) / 100;
    // Ascending frequency: 440Hz -> 2400Hz
    const freq = 440 * Math.pow(2, normalized * 2.45);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t + 0.02);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, t);

    // Mechanical click transient
    const click = ctx.createOscillator();
    click.type = "sine";
    click.frequency.setValueAtTime(4500, t);
    click.frequency.exponentialRampToValueAtTime(1200, t + 0.008);

    const gain = ctx.createGain();
    const vol = 0.16 + normalized * 0.14;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

    osc.connect(gain);
    osc2.connect(gain);
    click.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc2.start(t);
    click.start(t);
    osc.stop(t + 0.03);
    osc2.stop(t + 0.03);
    click.stop(t + 0.012);
  } catch (_) {}
}

/**
 * Play a crisp ready chime when bootloader reaches 100%.
 */
export function playProgressCompleteSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const freqs = [1760, 2637];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t + i * 0.04);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, t + i * 0.04 + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.35);
    });
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 2. ULTRA-CRISP MINIMALIST BOOT CHIME
// ─────────────────────────────────────────────

/**
 * Play an ultra-crisp, refined luxury glass chime:
 * Clean audible presence, zero heavy bass, crisp transient tap + pure crystal resonance.
 */
export function playBootSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Master volume — boosted to clean audible level
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, t);
    masterGain.gain.linearRampToValueAtTime(0.38, t + 0.005);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    masterGain.connect(ctx.destination);

    // 1. Crisp Glass Snap Transient (12ms highpass click)
    const snapLen = Math.floor(ctx.sampleRate * 0.012);
    const snapBuffer = ctx.createBuffer(1, snapLen, ctx.sampleRate);
    const snapData = snapBuffer.getChannelData(0);
    for (let i = 0; i < snapLen; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / snapLen, 3);
    }
    const snapSource = ctx.createBufferSource();
    snapSource.buffer = snapBuffer;

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = "bandpass";
    snapFilter.frequency.setValueAtTime(5200, t);
    snapFilter.Q.setValueAtTime(3.0, t);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.28, t);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);

    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(masterGain);
    snapSource.start(t);
    snapSource.stop(t + 0.025);

    // 2. Dual Pure Crystal Pings (E6: 1318Hz, B6: 1975Hz, E7: 2637Hz)
    const crystalHarmonics = [
      { freq: 1318.51, delay: 0.000, dur: 0.45, gain: 0.24 },
      { freq: 1975.53, delay: 0.025, dur: 0.50, gain: 0.20 },
      { freq: 2637.02, delay: 0.055, dur: 0.55, gain: 0.15 }
    ];

    crystalHarmonics.forEach(({ freq, delay, dur, gain }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + delay);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t + delay);
      env.gain.linearRampToValueAtTime(gain, t + delay + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);

      osc.connect(env);
      env.connect(masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + dur + 0.06);
    });
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 3. SOFT UI CLICK
// ─────────────────────────────────────────────

/** Short confirm tick — for button clicks and submit actions. */
export function playClickSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.06);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 4. BOARDROOM VERDICT GONG
// ─────────────────────────────────────────────

/** Deep metallic gong — played when the board delivers its final verdict. */
export function playVerdictSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(110, t);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(277.5, t);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.0, t);
    gain1.gain.linearRampToValueAtTime(0.5, t + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 3.5);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.0, t);
    gain2.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    const delay = ctx.createDelay(0.5);
    delay.delayTime.value = 0.18;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.25;

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);
    gain1.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(ctx.destination);

    osc1.start(t);
    osc1.stop(t + 3.6);
    osc2.start(t);
    osc2.stop(t + 2.3);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 5. NAV TAB SWITCH
// ─────────────────────────────────────────────

/** Soft whoosh for nav tab/page transitions. */
export function playNavSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Sine sweep up — feels like sliding to a new panel
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 6. MESSAGE SENT — chat whoosh
// ─────────────────────────────────────────────

/** Short upward "send" swoosh — fires when user submits a chat message. */
export function playSendSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 7. MESSAGE RECEIVED — board speaks
// ─────────────────────────────────────────────

/** Two-note soft chime — fires when an AI board response arrives. */
export function playReceiveSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const freqs = [660, 880];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.09);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, t + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.13, t + i * 0.09 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.16);
    });
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 8. ADD/REMOVE ITEM — pro/con, option
// ─────────────────────────────────────────────

/** Quick "pop" — for adding a new option, pro, or con item. */
export function playPopSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.04);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.065);
  } catch (_) {}
}

/** Low soft "thud" — for removing/deleting an item. */
export function playRemoveSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    source.connect(lpf);
    lpf.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
    source.stop(t + 0.05);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 9. FORM SUBMIT / CONVENE BOARD
// ─────────────────────────────────────────────

/** Rising three-note fanfare — fires when a decision is submitted to the board. */
export function playSubmitSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5 — A major triad
    const delays = [0, 0.1, 0.2];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, t);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    masterGain.connect(ctx.destination);

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + delays[i]);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0, t + delays[i]);
      env.gain.linearRampToValueAtTime(0.4, t + delays[i] + 0.03);
      env.gain.exponentialRampToValueAtTime(0.001, t + delays[i] + 0.4);

      osc.connect(env);
      env.connect(masterGain);
      osc.start(t + delays[i]);
      osc.stop(t + delays[i] + 0.45);
    });
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 10. CHATBOT OPEN / CLOSE
// ─────────────────────────────────────────────

/** Subtle "drawer open" sound — chatbot panel slides in. */
export function playChatOpenSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch (_) {}
}

/** Subtle "drawer close" sound — chatbot panel slides out. */
export function playChatCloseSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 11. LOGIN SUCCESS
// ─────────────────────────────────────────────

/** Warm ascending two-tone — board session authenticated. */
export function playLoginSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const notes = [523.25, 783.99]; // C5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.14);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, t + i * 0.14);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.14 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.14);
      osc.stop(t + i * 0.14 + 0.32);
    });
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 12. ERROR / ALERT
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 13. DISTINCT ADVISOR SPEECH SIGNATURES
// ─────────────────────────────────────────────

/**
 * Play a distinctive crisp audio signature when an advisor starts their dialogue.
 */
export function playAgentTurnSound(agentName = "") {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const norm = (agentName || "").toLowerCase();

    if (norm.includes("cfo")) {
      // CFO: Crisp metallic coin chime
      [880, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, t + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.24);
      });
    } else if (norm.includes("cto")) {
      // CTO: High-tech dual square/sine blip
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, t + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.15, t + idx * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.2);
      });
    } else if (norm.includes("risk")) {
      // Risk Analyst: Alert double pulse
      [466.16, 369.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.18);
      });
    } else if (norm.includes("mentor")) {
      // Mentor: Warm melodic marimba chord
      [392.00, 493.88, 587.33].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, t + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.16, t + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.38);
      });
    } else if (norm.includes("chairman")) {
      // Chairman: Deep authoritative gavel chime
      [220.00, 440.00].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.45);
      });
    } else {
      // CEO / Default: Clear executive synth triad
      [440.00, 554.37, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, t + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.3);
      });
    }
  } catch (_) {}
}

// ─────────────────────────────────────────────
// 14. ERROR / ALERT SOUND
// ─────────────────────────────────────────────

/** Low descending tone — validation error or network failure. */
export function playErrorSound() {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch (_) {}
}


