import React, { useState, useRef } from "react";
import { api } from "../api/client";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  Gavel,
  Loader2,
  Mic,
  MicOff
} from "lucide-react";
import { playSendSound, playReceiveSound, playClickSound, playErrorSound, playPopSound } from "../utils/audioUtils";
import { isSpeechRecognitionSupported, createSpeechRecognizer } from "../utils/voiceInputUtils";

export const InteractiveChat = ({ decisionId }) => {
  const [selectedAgent, setSelectedAgent] = useState("Chairman");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);

  const toggleVoiceInput = () => {
    playPopSound();
    if (!isSpeechRecognitionSupported()) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognizer = createSpeechRecognizer({
        onResult: ({ combined }) => {
          if (combined) {
            setQuestion(combined);
          }
        },
        onError: (err) => {
          console.log("Voice input error:", err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    }
  };
  const [messages, setMessages] = useState([
    {
      responder: "Chairman of the Board",
      text: "The Board is at your disposal. Ask any advisor for clarification on our strategic verdict or specific tactical advice.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const agents = [
    { id: "Chairman", label: "Whole Board (Chairman)", icon: Gavel, color: "#f59e0b" },
    { id: "CEO", label: "CEO (Vision & Growth)", icon: Briefcase, color: "#6366f1" },
    { id: "CFO", label: "CFO (Financials & ROI)", icon: DollarSign, color: "#10b981" },
    { id: "CTO", label: "CTO (Skills & Tech)", icon: Cpu, color: "#06b6d4" },
    { id: "Risk Analyst", label: "Risk Analyst (Pre-Mortem)", icon: ShieldAlert, color: "#f43f5e" },
    { id: "Mentor", label: "Mentor (Values & Life)", icon: HeartHandshake, color: "#a855f7" },
  ];

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    const userQ = question;
    const currentAgent = selectedAgent;
    setQuestion("");
    playSendSound();
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        isUser: true,
        text: userQ,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setLoading(true);

    try {
      const res = await api.askBoard(decisionId, currentAgent, userQ);
      playReceiveSound();
      setMessages((prev) => [
        ...prev,
        {
          responder: res.responder,
          text: res.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      playErrorSound();
      setMessages((prev) => [
        ...prev,
        {
          responder: `${currentAgent} Advisor`,
          text: `Deliberation note: ${err.message || "Failed to contact board member."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", height: "600px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Bot size={22} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Debrief the Board of Directors
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Ask follow-up questions, drill into specific analyses, or request customized tactical scripts.
            </p>
          </div>
        </div>
      </div>

      {/* Advisor Selector Pills */}
      <div style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "12px",
        marginBottom: "16px",
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        {agents.map((ag) => {
          const isSelected = selectedAgent === ag.id;
          const AgIcon = ag.icon;
          return (
            <button
              key={ag.id}
              onClick={() => {
                playClickSound();
                setSelectedAgent(ag.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: isSelected ? `1px solid ${ag.color}` : "1px solid var(--border-subtle)",
                background: isSelected ? `${ag.color}20` : "rgba(255, 255, 255, 0.03)",
                color: isSelected ? "#ffffff" : "var(--text-secondary)",
                fontSize: "0.82rem",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
            >
              <AgIcon size={14} color={isSelected ? ag.color : "var(--text-muted)"} />
              {ag.label}
            </button>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div style={{
        flexGrow: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingRight: "8px",
        marginBottom: "16px"
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.isUser ? "flex-end" : "flex-start",
              maxWidth: "85%",
              alignSelf: msg.isUser ? "flex-end" : "flex-start"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: msg.isUser ? "#a5b4fc" : "#cbd5e1" }}>
                {msg.isUser ? "You" : msg.responder}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {msg.timestamp}
              </span>
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: msg.isUser 
                  ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" 
                  : "rgba(30, 41, 59, 0.8)",
                border: msg.isUser ? "none" : "1px solid var(--border-subtle)",
                color: "#ffffff",
                fontSize: "0.9rem",
                lineHeight: "1.6"
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            <Loader2 size={16} className="animate-spin" />
            <span>{selectedAgent} is formulating response...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isListening ? "🎙️ Listening... speak now..." : `Ask the ${selectedAgent} (e.g. "What is our contingency plan if market conditions worsen?")...`}
          className="input-field"
          style={{ 
            flexGrow: 1,
            borderColor: isListening ? "#f43f5e" : undefined,
            boxShadow: isListening ? "0 0 15px rgba(244, 63, 94, 0.4)" : undefined
          }}
        />

        {/* Microphone Speech-To-Text Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className="btn-secondary"
          title={isListening ? "Stop Voice Recording" : "Voice Dictate Query"}
          style={{
            padding: "0 16px",
            background: isListening ? "rgba(244, 63, 94, 0.25)" : "rgba(255, 255, 255, 0.05)",
            border: `1px solid ${isListening ? "#f43f5e" : "var(--border-subtle)"}`,
            color: isListening ? "#fda4af" : "var(--text-secondary)"
          }}
        >
          {isListening ? <MicOff size={18} className="animate-pulse" color="#f43f5e" /> : <Mic size={18} />}
        </button>

        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="btn-primary"
          style={{ padding: "0 20px" }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
