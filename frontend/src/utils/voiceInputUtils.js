/**
 * Speech Recognition (Speech-to-Text) Utility for DecisionOS
 * Provides seamless voice dictation into form fields and debrief chat.
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
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
  return map[langCode] || langCode || "en-US";
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
    let message = "Speech recognition error.";
    if (err.error === "not-allowed" || err.error === "permission-denied") {
      message = "Microphone access was denied. Please click the camera/mic icon in your browser URL bar to allow microphone permissions.";
    } else if (err.error === "no-speech") {
      message = "No speech detected. Please speak clearly into your microphone.";
    } else if (err.error === "network") {
      message = "Speech network connection error. Please check your internet connection.";
    } else if (err.error === "audio-capture") {
      message = "No microphone hardware found or microphone is in use by another app.";
    }
    onError({ error: err.error, message, original: err });
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
