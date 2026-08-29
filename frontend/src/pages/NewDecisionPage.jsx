import React, { useState, useRef, useEffect } from "react";
import { api } from "../api/client";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  Compass, 
  Shield, 
  Target, 
  Clock, 
  Layers,
  Loader2,
  Check,
  Mic,
  MicOff
} from "lucide-react";
import { playPopSound, playRemoveSound, playSubmitSound, playClickSound, playErrorSound } from "../utils/audioUtils";
import { isSpeechRecognitionSupported, createSpeechRecognizer, getLanguageSpeechCode } from "../utils/voiceInputUtils";
import { useLanguage } from "../context/LanguageContext";

export const NewDecisionPage = ({ onCancel, onCreated }) => {
  const { t, language } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Career & Business");
  const [urgency, setUrgency] = useState("High");
  const [timeline, setTimeline] = useState("Within 30 days");
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [primaryGoal, setPrimaryGoal] = useState("Maximize compounding skill growth and long-term equity leverage.");
  const [minSalary, setMinSalary] = useState("$180,000");
  const [minRunway, setMinRunway] = useState("6-9 months");
  const [activeDictationField, setActiveDictationField] = useState(null); // "title" | "description" | null
  const recognizerRef = useRef(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  const toggleDictation = (field) => {
    playPopSound();
    if (!isSpeechRecognitionSupported()) {
      playErrorSound();
      setError("Voice dictation is not supported in this browser. Please use Chrome, Edge, Safari, or Brave.");
      return;
    }

    if (activeDictationField === field) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (_) {}
      }
      recognizerRef.current = null;
      setActiveDictationField(null);
    } else {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (_) {}
      }

      setError("");
      const initialText = field === "title" ? title : description;
      const speechLang = getLanguageSpeechCode(language || "en");

      const recognizer = createSpeechRecognizer({
        lang: speechLang,
        continuous: true,
        onStart: () => {
          setActiveDictationField(field);
        },
        onResult: ({ combined }) => {
          if (combined) {
            const separator = initialText && !initialText.endsWith(" ") ? " " : "";
            const newText = initialText ? `${initialText}${separator}${combined}` : combined;
            if (field === "title") {
              setTitle(newText);
            } else if (field === "description") {
              setDescription(newText);
            }
          }
        },
        onError: (err) => {
          console.warn("Dictation error:", err);
          if (err.error === "not-allowed" || err.error === "permission-denied") {
            setError(err.message || "Microphone access was denied. Please allow microphone permissions in your browser URL bar.");
            playErrorSound();
          }
          setActiveDictationField(null);
        },
        onEnd: () => {
          setActiveDictationField(null);
        }
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        try {
          recognizer.start();
          setActiveDictationField(field);
        } catch (startErr) {
          console.error("Failed to start speech recognition:", startErr);
          setError("Failed to start microphone. Please check your browser mic permissions.");
          setActiveDictationField(null);
        }
      }
    }
  };

  
  const [options, setOptions] = useState([
    {
      label: "Option A: Accept Series A AI Startup Role",
      description: "Join early-stage generative AI platform startup as Head of AI Systems with 1.5% equity grant.",
      pros: ["Direct executive agency", "Massive learning velocity in modern AI stack", "High asymmetric upside"],
      cons: ["Higher working hours", "Startup runway risk"]
    },
    {
      label: "Option B: Stay in Current Senior Role",
      description: "Maintain senior engineering role at established company with predictable annual RSU refreshers.",
      pros: ["High financial predictability", "Established team & work-life balance"],
      cons: ["Slower skill compounding", "Limited long-term upside"]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddOption = () => {
    playPopSound();
    const nextLetter = String.fromCharCode(65 + options.length);
    setOptions([
      ...options,
      {
        label: `Option ${nextLetter}: New Strategic Path`,
        description: "",
        pros: [""],
        cons: [""]
      }
    ]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      playErrorSound();
      alert("A strategic decision must have at least 2 alternative options to compare.");
      return;
    }
    playRemoveSound();
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const handleProConChange = (optIdx, type, itemIdx, value) => {
    const updated = [...options];
    updated[optIdx][type][itemIdx] = value;
    setOptions(updated);
  };

  const handleAddProCon = (optIdx, type) => {
    playPopSound();
    const updated = [...options];
    updated[optIdx][type].push("");
    setOptions(updated);
  };

  const handleRemoveProCon = (optIdx, type, itemIdx) => {
    playRemoveSound();
    const updated = [...options];
    updated[optIdx][type] = updated[optIdx][type].filter((_, i) => i !== itemIdx);
    setOptions(updated);
  };

  const loadTemplate = (templateType) => {
    playClickSound();
    if (templateType === "series_a_vs_bootstrap") {
      setTitle("Should we accept a $4M Series A Venture Term Sheet (at $22M post-money) or continue Bootstrapping profitably?");
      setDescription("Our B2B developer tool reached $75,000 monthly recurring revenue ($900k ARR) with 38% net profit margins and zero outside capital. Tier-1 VC offers $4M growth capital to scale sales and hire 12 engineers, but requires taking a board seat and targeting a $100M+ exit in 5 years.");
      setCategory("Startup & Venture");
      setUrgency("High");
      setTimeline("Term sheet expires in 10 days");
      setRiskTolerance("aggressive");
      setPrimaryGoal("Maximize market dominance and long-term equity enterprise value without unnecessary dilution.");
      setMinSalary("$160k founder salary");
      setMinRunway("18 months operating cash buffer");
      setOptions([
        {
          label: "Option A: Accept $4M Series A & Scale Aggressively",
          description: "Close $4M VC round, expand sales engineering team, and aggressively capture developer tool market share.",
          pros: ["Instant 24-month runway to hire top AI researchers", "Strong institutional credibility and enterprise sales network", "Potential 10x-50x enterprise equity outcome"],
          cons: ["20% equity dilution and loss of unilateral board control", "High burn rate puts company on the venture treadmill"]
        },
        {
          label: "Option B: Reject VC & Reinvest 100% Cash Flow",
          description: "Retain 100% founder ownership, grow organically at 80% YoY, and distribute dividends or raise later on better terms.",
          pros: ["Zero dilution and 100% executive independence", "Never vulnerable to down-rounds or venture market freezes", "High personal cash flow and lifestyle freedom"],
          cons: ["Competitors with venture backing may out-hire and out-market us", "Slower international enterprise expansion"]
        }
      ]);
    } else if (templateType === "ai_pivot") {
      setTitle("Should we pivot our existing SaaS product to a 100% Autonomous AI-Agent Architecture?");
      setDescription("Our traditional workflow management SaaS generates steady revenue, but customers are actively asking for autonomous agents that execute tasks rather than manual dashboards. A full pivot requires rewriting 60% of our core backend and adopting LLM orchestration frameworks.");
      setCategory("Tech & Architecture");
      setUrgency("High");
      setTimeline("Next Quarter Roadmap");
      setRiskTolerance("moderate");
      setPrimaryGoal("Future-proof our technology moat and establish market leadership in autonomous agentic workflows.");
      setMinSalary("N/A");
      setMinRunway("9 months engineering runway");
      setOptions([
        {
          label: "Option A: Full AI-Agent Native Pivot",
          description: "Rewrite backend with LangGraph/FastAPI multi-agent workflows, sunset legacy manual dashboards, and reposition as an autonomous intelligence platform.",
          pros: ["Massive product differentiation and 3x higher enterprise contract values", "Attracts top-tier AI engineering talent", "First-mover advantage in autonomous B2B workflows"],
          cons: ["Temporary disruption to existing feature delivery for legacy users", "Higher token inference API operational costs"]
        },
        {
          label: "Option B: Incremental AI Feature Layering",
          description: "Keep core architecture unchanged and add lightweight AI copilot sidebars and assistant prompts on top of existing dashboards.",
          pros: ["Zero risk to current customer retention", "Lower engineering burn rate"],
          cons: ["Competitors built AI-native from scratch may render our product obsolete", "Surface-level wrapper perception"]
        }
      ]);
    } else if (templateType === "vp_vs_stealth") {
      setTitle("Should I accept a $650k VP of AI role at a public tech titan or found my own stealth AI startup?");
      setDescription("Received an executive offer from a Fortune 50 company for VP of AI Systems ($350k base + $300k liquid stock refreshes). Alternatively, I have a working autonomous agent prototype with 3 signed enterprise LOIs and interest from angel investors for a $1.2M pre-seed round.");
      setCategory("Career & Business");
      setUrgency("Immediate");
      setTimeline("Decision needed in 7 days");
      setRiskTolerance("aggressive");
      setPrimaryGoal("Maximize long-term net worth, career agency, and historical impact in artificial intelligence.");
      setMinSalary("$180,000 baseline");
      setMinRunway("18 months personal savings");
      setOptions([
        {
          label: "Option A: Launch Stealth AI Startup",
          description: "Found the company full-time, close $1.2M pre-seed round, and convert enterprise LOIs into production contracts.",
          pros: ["100% founder agency and uncapped equity upside", "Fastest path to building generation-defining AI technology", "Direct hiring and culture creation"],
          cons: ["High stress and loss of predictable corporate wealth accumulation", "Founding risk and early-stage ambiguity"]
        },
        {
          label: "Option B: Accept VP of AI Titan Offer",
          description: "Join Fortune 50 enterprise leading 45 engineers with guaranteed $650k/yr liquid compensation and massive compute resources.",
          pros: ["Guaranteed $1.3M+ cash accumulation in 24 months", "Access to proprietary enterprise data and massive GPU compute clusters", "High prestige and executive pedigree"],
          cons: ["Corporate bureaucracy and slower release cycles", "Zero founder equity upside"]
        }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      playErrorSound();
      setError("Please provide a decision title and description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description,
        category,
        urgency,
        timeline,
        risk_tolerance: riskTolerance,
        primary_goal: primaryGoal,
        constraints: {
          minimum_salary: minSalary,
          emergency_runway: minRunway,
        },
        options: options.map((opt) => ({
          label: opt.label,
          description: opt.description,
          pros: opt.pros.filter((p) => p.trim()),
          cons: opt.cons.filter((c) => c.trim()),
        })),
      };

      playSubmitSound();
      const res = await api.createDecision(payload);
      onCreated(res.id);
    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to create decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.9rem",
            fontWeight: 600
          }}
        >
          <ArrowLeft size={18} />
          {t("new.back", "Back to Dashboard")}
        </button>

        {/* Quick Load High-Stakes Dilemma Presets */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
            ⚡ Quick Examples:
          </span>
          <button
            type="button"
            onClick={() => loadTemplate("series_a_vs_bootstrap")}
            className="hover-lift"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#fef08a",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🦄 $4M Series A vs Bootstrap
          </button>
          <button
            type="button"
            onClick={() => loadTemplate("ai_pivot")}
            className="hover-lift"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(6, 182, 212, 0.15)",
              border: "1px solid rgba(6, 182, 212, 0.4)",
              color: "#a5f3fc",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🤖 AI-Agent Native Pivot
          </button>
          <button
            type="button"
            onClick={() => loadTemplate("vp_vs_stealth")}
            className="hover-lift"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#c7d2fe",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            💼 $650k VP vs Stealth Founder
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "36px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            {t("new.heading", "Tell Us About Your Decision")}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {t("new.heading_desc", "Describe the decision and choices you are considering. Six AI advisors will review them and give you a clear recommendation.")}
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fda4af",
            fontSize: "0.85rem",
            marginBottom: "24px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                {t("new.field_title", "Decision or Question *")}
              </label>
              <button
                type="button"
                onClick={() => toggleDictation("title")}
                className="btn-secondary"
                title={activeDictationField === "title" ? "Stop Voice Dictation" : "Voice Dictate Dilemma"}
                style={{
                  padding: "3px 10px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: activeDictationField === "title" ? "rgba(244, 63, 94, 0.25)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${activeDictationField === "title" ? "#f43f5e" : "var(--border-subtle)"}`,
                  color: activeDictationField === "title" ? "#fda4af" : "var(--text-muted)"
                }}
              >
                {activeDictationField === "title" ? <MicOff size={13} className="animate-pulse" color="#f43f5e" /> : <Mic size={13} />}
                <span>{activeDictationField === "title" ? "Listening..." : "Dictate"}</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeDictationField === "title" ? "🎙️ Listening... speak your strategic question now..." : "e.g. Should I leave my current job and join a high-growth AI startup?"}
              className="input-field"
              style={{
                borderColor: activeDictationField === "title" ? "#f43f5e" : undefined,
                boxShadow: activeDictationField === "title" ? "0 0 15px rgba(244, 63, 94, 0.35)" : undefined
              }}
              required
            />
          </div>

          {/* Description / Context */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                {t("new.field_context", "Full Background & Context *")}
              </label>
              <button
                type="button"
                onClick={() => toggleDictation("description")}
                className="btn-secondary"
                title={activeDictationField === "description" ? "Stop Voice Dictation" : "Voice Dictate Context"}
                style={{
                  padding: "3px 10px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: activeDictationField === "description" ? "rgba(244, 63, 94, 0.25)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${activeDictationField === "description" ? "#f43f5e" : "var(--border-subtle)"}`,
                  color: activeDictationField === "description" ? "#fda4af" : "var(--text-muted)"
                }}
              >
                {activeDictationField === "description" ? <MicOff size={13} className="animate-pulse" color="#f43f5e" /> : <Mic size={13} />}
                <span>{activeDictationField === "description" ? "Listening..." : "Dictate"}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activeDictationField === "description" ? "🎙️ Listening... speak background context, runway, salary, constraints..." : "Provide background: current compensation, goals, timeline, runway, family situation, market timing..."}
              className="input-field"
              style={{
                borderColor: activeDictationField === "description" ? "#f43f5e" : undefined,
                boxShadow: activeDictationField === "description" ? "0 0 15px rgba(244, 63, 94, 0.35)" : undefined
              }}
              required
            />
          </div>

          {/* Parameters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                {t("new.field_category", "Decision Category")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="Career & Business">Career & Business</option>
                <option value="Startup & Venture">Startup & Venture</option>
                <option value="Financial & Investment">Financial & Investment</option>
                <option value="Relocation & Geography">Relocation & Geography</option>
                <option value="Personal & Life Transition">Personal & Life Transition</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                {t("new.field_urgency", "Urgency")}
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="input-field"
              >
                <option value="Immediate (Days)">Immediate (Days)</option>
                <option value="High (2-4 Weeks)">High (2-4 Weeks)</option>
                <option value="Medium (1-3 Months)">Medium (1-3 Months)</option>
                <option value="Low / Strategic">Low / Strategic</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                {t("new.field_risk", "Risk Tolerance")}
              </label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="input-field"
              >
                <option value="conservative">Conservative (Preserve Capital & Stability)</option>
                <option value="moderate">Moderate (Calculated Asymmetric Bets)</option>
                <option value="aggressive">Aggressive (High-Velocity Growth)</option>
                <option value="highly_aggressive">Maximum Asymmetry (High Upside)</option>
              </select>
            </div>
          </div>

          {/* Primary Goal & Constraints */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                {t("new.field_goal", "Primary Strategic Goal")}
              </label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="e.g. Maximize equity compounding and skill velocity"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                {t("new.field_runway", "Financial Baseline Runway")}
              </label>
              <input
                type="text"
                value={minRunway}
                onChange={(e) => setMinRunway(e.target.value)}
                placeholder="e.g. 6-12 months liquid reserve"
                className="input-field"
              />
            </div>
          </div>

          {/* Options Builder */}
          <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                  {t("new.options_heading", "Strategic Options & Alternatives")} ({options.length})
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {t("new.options_desc", "Define the alternative paths the Board of Directors will debate and compare.")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddOption}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "#a5b4fc",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <Plus size={16} />
                Add Alternative Option
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                      Alternative #{optIdx + 1}
                    </span>

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(optIdx)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#f43f5e",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.8rem"
                        }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => handleOptionChange(optIdx, "label", e.target.value)}
                      placeholder="Option Name (e.g. Option A: Accept Startup Offer)"
                      className="input-field"
                      required
                    />

                    <textarea
                      rows={2}
                      value={opt.description}
                      onChange={(e) => handleOptionChange(optIdx, "description", e.target.value)}
                      placeholder="Option description and key parameters..."
                      className="input-field"
                    />

                    {/* Pros & Cons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "6px" }}>
                      {/* Pros */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>
                            Pros / Upsides
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddProCon(optIdx, "pros")}
                            style={{ background: "transparent", border: "none", color: "#34d399", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            + Add Pro
                          </button>
                        </div>
                        {opt.pros.map((pro, pIdx) => (
                          <div key={pIdx} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                            <input
                              type="text"
                              value={pro}
                              onChange={(e) => handleProConChange(optIdx, "pros", pIdx, e.target.value)}
                              placeholder="e.g. Rapid skill compounding"
                              className="input-field"
                              style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                            />
                            {opt.pros.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProCon(optIdx, "pros", pIdx)}
                                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Cons */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase" }}>
                            Cons / Risks
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddProCon(optIdx, "cons")}
                            style={{ background: "transparent", border: "none", color: "#f87171", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            + Add Con
                          </button>
                        </div>
                        {opt.cons.map((con, cIdx) => (
                          <div key={cIdx} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                            <input
                              type="text"
                              value={con}
                              onChange={(e) => handleProConChange(optIdx, "cons", cIdx, e.target.value)}
                              placeholder="e.g. Runway vulnerability"
                              className="input-field"
                              style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                            />
                            {opt.cons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProCon(optIdx, "cons", cIdx)}
                                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: "12px 28px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Convening Board of Directors...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Submit to Board of Directors</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
