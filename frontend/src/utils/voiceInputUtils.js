/**
 * Speech Recognition (Speech-to-Text) Utility for DecisionOS
 * Provides seamless voice dictation into form fields and debrief chat.
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer({
  onResult = () => {},
  onError = () => {},
  onEnd = () => {},
  lang = "en-US",
  continuous = false
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

  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    onResult({
      finalTranscript,
      interimTranscript,
      combined: finalTranscript || interimTranscript
    });
  };

  recognition.onerror = (err) => {
    onError(err);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
