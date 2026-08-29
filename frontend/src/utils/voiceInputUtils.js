/**
 * Speech Recognition (Speech-to-Text) Utility for DecisionOS
 * Provides seamless voice dictation into form fields and debrief chat.
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export async function requestMicPermission() {
  if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return { granted: true };
    } catch (err) {
      console.warn("Microphone permission check:", err);
      return { granted: false, error: err.name || err.message };
    }
  }
  return { granted: true };
}

export function getLanguageSpeechCode(langCode = "en") {
  const map = {
    en: "en-US",
    hi: "hi-IN",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    ja: "ja-JP",
    zh: "zh-CN",
    pt: "pt-BR",
    ar: "ar-SA",
    ru: "ru-RU"
  };
  return map[langCode] || langCode || (typeof navigator !== "undefined" ? navigator.language : "en-US");
}

export function createSpeechRecognizer({
  onResult = () => {},
  onError = () => {},
  onEnd = () => {},
  onStart = () => {},
  lang = "en-US",
  continuous = true
} = {}) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let accumulatedFinal = "";

  recognition.onstart = () => {
    onStart();
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0]?.transcript || "";
      if (event.results[i].isFinal) {
        accumulatedFinal += (accumulatedFinal ? " " : "") + transcript.trim();
      } else {
        interimTranscript += transcript;
      }
    }

    const currentCombined = accumulatedFinal + (interimTranscript ? (accumulatedFinal ? " " : "") + interimTranscript : "");

    onResult({
      finalTranscript: accumulatedFinal,
      interimTranscript,
      combined: currentCombined
    });
  };

  recognition.onerror = (err) => {
    let message = "Speech recognition encountered an issue.";
    if (err.error === "not-allowed" || err.error === "permission-denied") {
      message = "Microphone access was denied. Please click the lock or camera/mic icon in your browser URL bar and set Microphone to 'Allow'.";
    } else if (err.error === "no-speech") {
      // Don't treat silence as fatal error
      return;
    } else if (err.error === "network") {
      message = "Speech network service unavailable. If you are using Brave browser, please enable 'Use Google Services for Speech Recognition' in brave://settings/privacy or use Chrome / Edge.";
    } else if (err.error === "audio-capture") {
      message = "No microphone hardware found. Please verify your microphone is plugged in.";
    }
    onError({ error: err.error, message, original: err });
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
