/**
 * Speech Synthesis Utility for DecisionOS AI Personal Board of Directors
 * Provides distinct voice characteristics (pitch, rate, voice matching) for each advisor persona.
 */

// Persona voice profiles
const PERSONA_PROFILES = {
  CEO: {
    pitch: 1.05,
    rate: 1.05,
    voicePreference: ["en-US", "en-GB", "male", "confident"],
    genderHint: "male"
  },
  CFO: {
    pitch: 0.85,
    rate: 0.95,
    voicePreference: ["en-GB", "en-US", "male", "deep"],
    genderHint: "male"
  },
  CTO: {
    pitch: 1.15,
    rate: 1.08,
    voicePreference: ["en-US", "female", "crisp"],
    genderHint: "female"
  },
  "Risk Analyst": {
    pitch: 0.9,
    rate: 0.92,
    voicePreference: ["en-GB", "male", "stern"],
    genderHint: "male"
  },
  Mentor: {
    pitch: 1.0,
    rate: 0.92,
    voicePreference: ["en-US", "female", "warm"],
    genderHint: "female"
  },
  Chairman: {
    pitch: 0.78,
    rate: 0.9,
    voicePreference: ["en-GB", "en-US", "male", "authoritative"],
    genderHint: "male"
  }
};

let cachedVoices = [];

function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Pick the best matching voice for a given persona and locale
 */
export function getPersonaVoice(persona, langCode = "en") {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Try to find voice matching the language prefix (e.g. "hi", "es", "fr", "de", "ja", "en")
  const langVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
  const candidatePool = langVoices.length > 0 ? langVoices : voices;

  const profile = PERSONA_PROFILES[persona] || PERSONA_PROFILES.Chairman;
  const isFemaleExpected = profile.genderHint === "female";

  // Match by gender name heuristic in voice name if possible
  const matchingVoice = candidatePool.find(v => {
    const name = v.name.toLowerCase();
    if (isFemaleExpected) {
      return name.includes("female") || name.includes("zira") || name.includes("samantha") || name.includes("karen") || name.includes("victoria");
    } else {
      return name.includes("male") || name.includes("david") || name.includes("george") || name.includes("daniel") || name.includes("alex");
    }
  });

  return matchingVoice || candidatePool[0] || voices[0];
}

/**
 * Speak persona text with distinct voice settings
 */
export function speakPersonaText(text, persona, options = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve();
  }

  const {
    langCode = "en",
    speedMultiplier = 1,
    onStart = () => {},
    onEnd = () => {},
    onError = () => {}
  } = options;

  // Clean text of markdown asterisks/bullets for clean audio
  const cleanText = text
    .replace(/[*_#`~\[\]]/g, "")
    .replace(/\n+/g, ". ")
    .trim();

  if (!cleanText) {
    onEnd();
    return Promise.resolve();
  }

  // Cancel any currently playing speech to avoid overlapping
  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const profile = PERSONA_PROFILES[persona] || { pitch: 1.0, rate: 1.0 };
    const voice = getPersonaVoice(persona, langCode);

    if (voice) {
      utterance.voice = voice;
    }
    
    // Scale rate by speedMultiplier
    utterance.rate = Math.min(2, Math.max(0.5, profile.rate * speedMultiplier));
    utterance.pitch = profile.pitch;

    utterance.onstart = () => {
      onStart();
    };

    utterance.onend = () => {
      onEnd();
      resolve();
    };

    utterance.onerror = (e) => {
      onError(e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech immediately
 */
export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if Web Speech API is supported
 */
export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
