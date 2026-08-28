import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { 
  Bot, 
  X, 
  Send, 
  Briefcase, 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  HeartHandshake, 
  Gavel, 
  Loader2, 
  Sparkles, 
  Key, 
  Settings, 
  Check, 
  RotateCcw,
  Move,
  GripHorizontal,
  ChevronUp,
  ChevronDown,
  Minus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileCode,
  UploadCloud,
  File
} from "lucide-react";
import { 
  playChatOpenSound, 
  playChatCloseSound, 
  playSendSound, 
  playReceiveSound, 
  playClickSound, 
  playErrorSound 
} from "../utils/audioUtils";
import { getCustomLlmKey, setCustomLlmKey } from "../utils/llmKeyStore";

export const SmartAIChatBot = () => {
  const MAX_ATTACHMENT_BYTES = 3_700_000;
  const MAX_ATTACHMENTS = 5;
  const [isOpen, setIsOpen] = useState(false);
  const [activeAdvisor, setActiveAdvisor] = useState("Chairman");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "Chairman of the Board",
      role: "assistant",
      advisor: "Chairman",
      text: "Hello! I am the chairman of your AI advisor team. Ask me about any important decision, upload a file or image, or choose an advisor above for a focused point of view."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(getCustomLlmKey());
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const advisors = [
    { id: "Chairman", name: "Chairman", icon: Gavel, color: "#f59e0b" },
    { id: "CEO", name: "CEO", icon: Briefcase, color: "#f59e0b" },
    { id: "CFO", name: "CFO", icon: DollarSign, color: "#10b981" },
    { id: "CTO", name: "CTO", icon: Cpu, color: "#06b6d4" },
    { id: "Risk Analyst", name: "Risk Officer", icon: ShieldAlert, color: "#f43f5e" },
    { id: "Mentor", name: "Mentor", icon: HeartHandshake, color: "#a855f7" },
  ];

  const quickPrompts = [
    "How should I evaluate unvested startup equity vs base cash?",
    "What 90-day tripwires should I install before quitting my job?",
    "How do I determine if a new role will compound my career moat?",
    "What's the best strategy to negotiate a founder equity split?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Global event listener so Navbar, Hero, and shortcuts can trigger opening
  useEffect(() => {
    const handleOpen = () => {
      playChatOpenSound();
      setIsOpen(true);
    };
    window.addEventListener("decisionos_open_chatbot", handleOpen);
    return () => window.removeEventListener("decisionos_open_chatbot", handleOpen);
  }, []);

  const handleSaveKey = () => {
    playClickSound();
    setCustomLlmKey(apiKey);
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setShowSettings(false);
    }, 800);
  };

  const handleResetChat = () => {
    playClickSound();
    setAttachments([]);
    setMessages([
      {
        id: Date.now().toString(),
        sender: `${activeAdvisor} Advisor`,
        role: "assistant",
        advisor: activeAdvisor,
        text: `Conversation reset. I am ready to advise you or extract data from any uploaded files.`
      }
    ]);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    const fileList = Array.from(files).slice(0, Math.max(0, remainingSlots));

    fileList.forEach((file) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        window.alert(`${file.name} is too large. Attachments must be 3.7 MB or smaller.`);
        return;
      }
      const isImg = file.type.startsWith("image/");
      const isText = file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv") || file.name.endsWith(".json") || file.name.endsWith(".py") || file.name.endsWith(".js");
      
      const reader = new FileReader();
      if (isImg || file.type === "application/pdf") {
        reader.readAsDataURL(file);
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random().toString(),
              filename: file.name,
              file_type: file.type || "application/octet-stream",
              size: file.size,
              data: reader.result,
              previewUrl: isImg ? reader.result : null,
              isImage: isImg
            }
          ]);
        };
      } else {
        reader.readAsText(file);
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random().toString(),
              filename: file.name,
              file_type: file.type || "text/plain",
              size: file.size,
              data: reader.result,
              previewUrl: null,
              isImage: false
            }
          ]);
        };
      }
    });
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = null; // reset input
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSend = async (textToSend = null) => {
    const queryText = textToSend || input;
    const currentAttachments = [...attachments];

    if (!queryText.trim() && currentAttachments.length === 0) return;
    if (loading) return;

    playSendSound();
    const userMsg = {
      id: Date.now().toString(),
      sender: "You",
      role: "user",
      text: queryText.trim() || (currentAttachments.length > 0 ? "Uploaded document(s) for analysis:" : ""),
      attachments: currentAttachments
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      // Build conversation history for multi-turn memory
      const historyPayload = newMessages.map(m => ({
        role: m.role,
        content: m.text,
        advisor: m.advisor || null
      }));

      // Format attachments payload
      const attachmentsPayload = currentAttachments.map(a => ({
        filename: a.filename,
        file_type: a.file_type,
        data: a.data,
        size: a.size
      }));

      const customKey = getCustomLlmKey() || null;
      const res = await api.request("/boardroom/copilot", {
        method: "POST",
        body: {
          query: queryText.trim() || "Please extract and analyze the information from this attached document/image.",
          advisor_persona: activeAdvisor,
          history: historyPayload,
          attachments: attachmentsPayload,
          api_key: customKey
        }
      });

      playReceiveSound();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: res.responder || `${activeAdvisor} Advisor`,
        role: "assistant",
        advisor: activeAdvisor,
        text: res.response
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      playErrorSound();
      console.error("Board Copilot Error:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: `${activeAdvisor} Advisor`,
        role: "assistant",
        advisor: activeAdvisor,
        text: `⚠️ Error reaching advisor: ${err.message || "Please verify your server is running or check your API key."}`
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentAdvisorConfig = advisors.find((a) => a.id === activeAdvisor) || advisors[0];
  const CurrentIcon = currentAdvisorConfig.icon;
  const isCustomKeyActive = !!getCustomLlmKey();

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      right: isMobile ? 0 : "24px",
      left: isMobile && isOpen ? 0 : "auto",
      top: isMobile && isOpen ? 0 : "auto",
      zIndex: 99999
    }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.txt,.csv,.json,.md,.py,.js,.html,.css"
        style={{ display: "none" }}
      />

      <AnimatePresence>
        {/* =========================================================================
           1. COLLAPSED DOCKED BAR (LinkedIn-style) - Visible only on Desktop
           ========================================================================= */}
        {!isOpen && !isMobile && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => {
              playChatOpenSound();
              setIsOpen(true);
            }}
            title="Open AI Board Copilot (Supports text, files & image extraction)"
            style={{
              height: "46px",
              width: "300px",
              background: "#16120c",
              border: "1px solid rgba(245, 158, 11, 0.5)",
              borderBottom: "none",
              borderRadius: "12px 12px 0 0",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 -8px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.25)",
              outline: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(245, 158, 11, 0.4)"
                }}>
                  <Bot size={16} color="#0b0907" />
                </div>
                <span style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  border: "2px solid #16120c"
                }} />
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Board Copilot</span>
                  <span style={{
                    fontSize: "0.62rem",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#fef08a",
                    fontWeight: 700
                  }}>
                    Vision & Files
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
              <ChevronUp size={18} color="#f59e0b" />
            </div>
          </motion.button>
        )}

        {/* =========================================================================
           2. EXPANDED CHAT DRAWER (Full-screen sheet on mobile, docked on desktop)
           ========================================================================= */}
        {isOpen && (
          <motion.div
            drag={!isMobile}
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ y: 400, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 400, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              width: isMobile ? "100vw" : "min(460px, calc(100vw - 32px))",
              height: isMobile ? "100dvh" : "620px",
              maxHeight: isMobile ? "100dvh" : "calc(100vh - 32px)",
              background: "#120f0b",
              border: isMobile ? "none" : (isDragging ? "2px dashed #f59e0b" : "1px solid var(--border-amber)"),
              borderRadius: isMobile ? "0px" : "14px 14px 0 0",
              boxShadow: "0 -15px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: isMobile ? "fixed" : "relative",
              inset: isMobile ? 0 : "auto",
              touchAction: isMobile ? "auto" : "none"
            }}
          >

            {/* Drag overlay notice */}
            {isDragging && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(18, 15, 11, 0.92)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "#f59e0b"
              }}>
                <UploadCloud size={48} className="animate-bounce" />
                <span style={{ fontWeight: 800, fontSize: "1rem" }}>Drop images or documents here</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Supports Images, PDFs, CSV, Code, Text</span>
              </div>
            )}

            {/* Draggable Chat Header */}
            <div style={{
              padding: "12px 18px",
              background: "#18140f",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "grab",
              userSelect: "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-muted)",
                  cursor: "grab"
                }} title="Drag to reposition anywhere">
                  <GripHorizontal size={16} color="#f59e0b" />
                </div>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: `${currentAdvisorConfig.color}22`,
                  border: `1px solid ${currentAdvisorConfig.color}66`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <CurrentIcon size={15} color={currentAdvisorConfig.color} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ffffff" }}>
                      {currentAdvisorConfig.name} Advisor
                    </h4>
                    <span style={{
                      fontSize: "0.6rem",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: "rgba(245, 158, 11, 0.15)",
                      color: "#f59e0b",
                      fontWeight: 700
                    }}>
                      VISION READY
                    </span>
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    Personal AI Board of Directors
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowSettings(!showSettings);
                  }}
                  title="LLM Settings / API Key"
                  style={{
                    background: showSettings ? "rgba(245, 158, 11, 0.2)" : "transparent",
                    border: "none",
                    color: showSettings ? "#f59e0b" : "var(--text-muted)",
                    cursor: "pointer",
                    padding: "5px",
                    borderRadius: "4px"
                  }}
                >
                  <Settings size={15} />
                </button>

                <button
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "5px"
                  }}
                >
                  <RotateCcw size={14} />
                </button>

                {/* Minimize / Dock Button */}
                <button
                  onClick={() => {
                    playChatCloseSound();
                    setIsOpen(false);
                  }}
                  title="Minimize Drawer"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "5px"
                  }}
                >
                  <ChevronDown size={17} color="#f59e0b" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    playChatCloseSound();
                    setIsOpen(false);
                  }}
                  title="Close"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "5px"
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Settings Drawer / API Key Popover */}
          {showSettings && (
            <div style={{
              padding: "12px 16px",
              background: "#1c1710",
              borderBottom: "1px solid var(--border-amber)",
              fontSize: "0.82rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Key size={14} color="#f59e0b" />
                <span style={{ fontWeight: 800, color: "#ffffff" }}>Custom LLM API Key (Optional)</span>
              </div>
              <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Paste your Google Gemini (<code>AIzaSy...</code>), Groq (<code>gsk_...</code>), or OpenAI key for cloud multimodal analysis.
              </p>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... or gsk_... or sk-..."
                  style={{
                    flexGrow: 1,
                    background: "#0c0a07",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    color: "#ffffff",
                    fontSize: "0.78rem"
                  }}
                />
                <button
                  onClick={handleSaveKey}
                  style={{
                    background: "#f59e0b",
                    color: "#0b0907",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {savedKeySuccess ? <Check size={14} /> : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Clean Persona Switcher Row */}
          <div style={{
            padding: "8px 12px",
            background: "#0c0a07",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}>
            {advisors.map((adv) => {
              const isSelected = activeAdvisor === adv.id;
              const AdvIcon = adv.icon;
              return (
                <button
                  key={adv.id}
                  onClick={() => {
                    playClickSound();
                    setActiveAdvisor(adv.id);
                  }}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "6px",
                    border: isSelected ? `1px solid ${adv.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                    background: isSelected ? `${adv.color}22` : "rgba(255, 255, 255, 0.02)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    fontSize: "0.72rem",
                    fontWeight: isSelected ? 800 : 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                    transition: "all 0.12s ease"
                  }}
                >
                  <AdvIcon size={12} color={adv.color} />
                  <span>{adv.name}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flexGrow: 1,
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start"
                  }}
                >
                  <span style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginBottom: "3px", padding: "0 4px" }}>
                    {m.sender}
                  </span>
                  
                  {/* Render attached files/images if present */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "6px",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      maxWidth: "88%"
                    }}>
                      {m.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "6px",
                            padding: att.isImage ? "3px" : "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.72rem",
                            color: "#fdfdfd"
                          }}
                        >
                          {att.isImage && att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.filename}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "4px"
                              }}
                            />
                          ) : (
                            <>
                              <FileText size={14} color="#f59e0b" />
                              <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {att.filename}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    maxWidth: "88%",
                    padding: "10px 14px",
                    borderRadius: isUser ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                    background: isUser ? "#f59e0b" : "#18140f",
                    color: isUser ? "#0b0907" : "#fdfdfd",
                    border: isUser ? "none" : "1px solid var(--border-subtle)",
                    fontSize: "0.85rem",
                    lineHeight: "1.55",
                    fontWeight: isUser ? 700 : 400,
                    whiteSpace: "pre-wrap"
                  }}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.78rem", padding: "6px" }}>
                <Loader2 size={14} className="animate-spin" color="#f59e0b" />
                <span>{activeAdvisor} Advisor is extracting data and synthesizing counsel...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          {messages.length <= 2 && attachments.length === 0 && (
            <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-subtle)", background: "#0b0907" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: 700 }}>
                SUGGESTED STRATEGIC QUESTIONS:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {quickPrompts.slice(0, 2).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    style={{
                      textAlign: "left",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      color: "var(--text-secondary)",
                      fontSize: "0.72rem",
                      cursor: "pointer"
                    }}
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Staged Attachments Preview Bar */}
          {attachments.length > 0 && (
            <div style={{
              padding: "6px 12px",
              background: "#16130e",
              borderTop: "1px solid var(--border-amber)",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "0.68rem", color: "#f59e0b", fontWeight: 700, whiteSpace: "nowrap" }}>
                Attached ({attachments.length}):
              </span>
              {attachments.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "0.72rem",
                    color: "#ffffff",
                    whiteSpace: "nowrap"
                  }}
                >
                  {att.isImage ? <ImageIcon size={12} color="#f59e0b" /> : <FileText size={12} color="#f59e0b" />}
                  <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {att.filename}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "1px",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px 12px",
              background: "#15120d",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file or image (PNG, JPG, PDF, CSV, Text, Code)"
              style={{
                background: attachments.length > 0 ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.05)",
                color: attachments.length > 0 ? "#f59e0b" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }}
            >
              <Paperclip size={14} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={attachments.length > 0 ? "Add instructions for attached file..." : `Ask ${activeAdvisor} or upload files...`}
              style={{
                flexGrow: 1,
                background: "#0c0a07",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#ffffff",
                fontSize: "0.82rem",
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && attachments.length === 0)}
              style={{
                background: (input.trim() || attachments.length > 0) ? "#f59e0b" : "rgba(255, 255, 255, 0.05)",
                color: (input.trim() || attachments.length > 0) ? "#0b0907" : "var(--text-muted)",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                cursor: (input.trim() || attachments.length > 0) ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};
