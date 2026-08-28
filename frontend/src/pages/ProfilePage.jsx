import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../api/client";
import { 
  User, 
  Briefcase, 
  Target, 
  Shield, 
  Heart, 
  Save, 
  Sparkles, 
  Plus, 
  X,
  CheckCircle,
  Loader2,
  FileText,
  Upload,
  ClipboardList,
  Zap,
  Check,
  Award
} from "lucide-react";
import { 
  playSubmitSound, 
  playPopSound, 
  playRemoveSound, 
  playClickSound, 
  playErrorSound 
} from "../utils/audioUtils";
import { getCustomLlmKey } from "../utils/llmKeyStore";
import { useLanguage } from "../context/LanguageContext";

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  // Profile state
  const [currentRole, setCurrentRole] = useState("");
  const [careerGoals, setCareerGoals] = useState("");
  const [financialRunway, setFinancialRunway] = useState("6-12 months");
  const [defaultRisk, setDefaultRisk] = useState("moderate");
  const [coreValues, setCoreValues] = useState([]);
  const [newValInput, setNewValInput] = useState("");
  const [personalContext, setPersonalContext] = useState("");
  
  // Resume extraction state
  const [resumeMode, setResumeMode] = useState("upload"); // "upload" | "paste"
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // General save state
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.profile) {
      setCurrentRole(user.profile.current_role || "");
      setCareerGoals(user.profile.career_goals || "");
      setFinancialRunway(user.profile.financial_runway_months || "6-12 months");
      setDefaultRisk(user.profile.default_risk_tolerance || "moderate");
      setCoreValues(user.profile.core_values || ["Velocity & Execution", "Systems Architecture", "Ownership Mindset", "High Agency"]);
      setPersonalContext(user.profile.personal_context || "");
    }
  }, [user]);

  const handleAddValue = () => {
    if (newValInput.trim() && !coreValues.includes(newValInput.trim())) {
      playPopSound();
      setCoreValues([...coreValues, newValInput.trim()]);
      setNewValInput("");
    }
  };

  const handleRemoveValue = (val) => {
    playRemoveSound();
    setCoreValues(coreValues.filter((v) => v !== val));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      playClickSound();
      setSelectedFile(file);
    }
  };

  const handleExtractResume = async () => {
    setExtracting(true);
    setError("");
    setExtractSuccess(null);

    try {
      const customKey = getCustomLlmKey() || null;
      let parsed = null;

      if (resumeMode === "upload") {
        if (!selectedFile) {
          playErrorSound();
          setError("Please select a resume file (.pdf, .docx, .txt, .md) to upload.");
          setExtracting(false);
          return;
        }
        parsed = await api.uploadResumeFile(selectedFile, customKey);
      } else {
        if (!resumeText.trim()) {
          playErrorSound();
          setError("Please paste your resume or LinkedIn profile text.");
          setExtracting(false);
          return;
        }
        parsed = await api.parseResumeText(resumeText, customKey);
      }

      // Auto-populate fields
      if (parsed.current_role) setCurrentRole(parsed.current_role);
      if (parsed.career_goals) setCareerGoals(parsed.career_goals);
      if (parsed.financial_runway_months) setFinancialRunway(parsed.financial_runway_months);
      if (parsed.default_risk_tolerance) setDefaultRisk(parsed.default_risk_tolerance);
      if (parsed.core_values && Array.isArray(parsed.core_values) && parsed.core_values.length > 0) {
        setCoreValues(parsed.core_values);
      }
      if (parsed.personal_context) setPersonalContext(parsed.personal_context);

      playSubmitSound();
      setExtractSuccess({
        role: parsed.current_role,
        valuesCount: parsed.core_values?.length || 0,
        skillsCount: parsed.extracted_skills?.length || 0,
        summary: parsed.summary || "Resume parameters extracted successfully."
      });

      // Scroll smoothly to form
      setTimeout(() => {
        document.getElementById("manual-profile-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to extract parameters from resume");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setSavedSuccess(false);

    try {
      await api.updateProfile({
        current_role: currentRole,
        career_goals: careerGoals,
        financial_runway_months: financialRunway,
        default_risk_tolerance: defaultRisk,
        core_values: coreValues,
        personal_context: personalContext,
      });
      await refreshProfile();
      playSubmitSound();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      playErrorSound();
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <User size={20} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>
            {t("profile.heading", "Executive Profile & Core Values")}
          </h1>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: "720px", lineHeight: "1.5" }}>
          {t("profile.heading_desc", "These baseline parameters guide your Personal Board of Directors (CEO, CFO, CTO, Risk Analyst, Mentor) across every strategic deliberation.")}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(244, 63, 94, 0.15)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "#fda4af",
          fontSize: "0.9rem",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {savedSuccess && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          fontSize: "0.9rem",
          fontWeight: 600,
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle size={18} />
          <span>{t("profile.save_success", "Strategic Profile & Core Values saved successfully.")}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          SECTION 1: AI RESUME & BIO AUTO-EXTRACTION CARD
      ───────────────────────────────────────────── */}
      <div className="rzp-card" style={{ padding: "28px", marginBottom: "28px", border: "1px solid var(--border-amber)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Zap size={18} color="#0b0907" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }}>
                {t("profile.resume_extractor", "AI Resume & Bio Auto-Extractor")}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {t("profile.resume_extractor_desc", "Upload your resume or paste your career bio to automatically extract your role, 3-5 year goals, risk profile, and core values.")}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", background: "#18140f", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setResumeMode("upload");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: resumeMode === "upload" ? "#f59e0b" : "transparent",
                color: resumeMode === "upload" ? "#0b0907" : "var(--text-secondary)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.12s ease"
              }}
            >
              <Upload size={14} />
              <span>{t("profile.upload_file", "Upload File")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setResumeMode("paste");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: resumeMode === "paste" ? "#f59e0b" : "transparent",
                color: resumeMode === "paste" ? "#0b0907" : "var(--text-secondary)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.12s ease"
              }}
            >
              <ClipboardList size={14} />
              <span>{t("profile.paste_text", "Paste Text")}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Upload File */}
        {resumeMode === "upload" && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.md"
              style={{ display: "none" }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed rgba(245, 158, 11, 0.4)",
                borderRadius: "10px",
                padding: "28px 20px",
                textAlign: "center",
                background: "rgba(245, 158, 11, 0.03)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                marginBottom: "16px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f59e0b";
                e.currentTarget.style.background = "rgba(245, 158, 11, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
                e.currentTarget.style.background = "rgba(245, 158, 11, 0.03)";
              }}
            >
              <FileText size={32} color="#f59e0b" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                {selectedFile ? selectedFile.name : t("profile.drag_drop", "Click to select or drag & drop your Resume")}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready to extract`
                  : t("profile.file_formats", "Supports PDF, DOCX, TXT, MD")
                }
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Raw Text */}
        {resumeMode === "paste" && (
          <div style={{ marginBottom: "16px" }}>
            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text, CV summary, or LinkedIn 'About & Experience' section here..."
              className="input-field"
              style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
            />
          </div>
        )}

        {/* Extraction Button & Info */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            ⚡ Extracted parameters populate the form below and can be manually edited at any time.
          </div>

          <button
            type="button"
            onClick={handleExtractResume}
            disabled={extracting}
            className="btn-primary"
            style={{ padding: "10px 22px", fontSize: "0.88rem" }}
          >
            {extracting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t("profile.extracting_params", "Extracting Parameters...")}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{t("profile.auto_extract", "Auto-Extract & Populate Profile")}</span>
              </>
            )}
          </button>
        </div>

        {/* Extraction Success Card */}
        {extractSuccess && (
          <div style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "8px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <CheckCircle size={20} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#34d399", marginBottom: "4px" }}>
                Profile Ingestion Complete!
              </div>
              <p style={{ fontSize: "0.8rem", color: "#e2e8f0", lineHeight: "1.45" }}>
                Extracted: <strong>{extractSuccess.role}</strong> with <strong>{extractSuccess.valuesCount} Core Values</strong>.
                You can review, tweak, and edit all parameters manually below before saving.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
          SECTION 2: MANUAL PROFILE & STRATEGIC PARAMETERS FORM
      ───────────────────────────────────────────── */}
      <form 
        id="manual-profile-form"
        onSubmit={handleSave} 
        className="glass-card" 
        style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              {t("profile.params_title", "Strategic Parameters & Manual Controls")}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {t("profile.params_desc", "Customize and fine-tune your parameters manually.")}
            </p>
          </div>

          <div style={{
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#f59e0b",
            fontSize: "0.74rem",
            fontWeight: 800,
            fontFamily: "var(--font-mono)"
          }}>
            MANUAL EDITING ACTIVE
          </div>
        </div>

        {/* Account Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "1.25rem",
            color: "#0b0907"
          }}>
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{user?.full_name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{user?.email}</p>
          </div>
        </div>

        {/* Current Role */}
        <div>
          <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, marginBottom: "6px" }}>
            {t("profile.current_role", "Current Professional Role & Domain Focus")}
          </label>
          <input
            type="text"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="e.g. Staff Software Engineer - Distributed Systems & AI Platforms"
            className="input-field"
          />
        </div>

        {/* Career Goals */}
        <div>
          <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, marginBottom: "6px" }}>
            {t("profile.career_goals_label", "Long-Term Career & Executive Vision (3-5 Year Horizon)")}
          </label>
          <textarea
            rows={3}
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            placeholder="e.g. Build and scale a B2B SaaS startup as technical co-founder, targeting $5M+ ARR and full life autonomy."
            className="input-field"
          />
        </div>

        {/* Financial Runway & Risk Baseline */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, marginBottom: "6px" }}>
              {t("profile.financial_runway_label", "Financial Emergency Runway")}
            </label>
            <select
              value={financialRunway}
              onChange={(e) => {
                playClickSound();
                setFinancialRunway(e.target.value);
              }}
              className="input-field"
            >
              <option value="3-6 months">3-6 months (Lean)</option>
              <option value="6-12 months">6-12 months (Standard)</option>
              <option value="12-18 months">12-18 months (Strong buffer)</option>
              <option value="18-24 months">18-24 months (High resilience)</option>
              <option value="24+ months">24+ months (Complete autonomy)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, marginBottom: "6px" }}>
              {t("profile.risk_tolerance_label", "Baseline Strategic Risk Tolerance")}
            </label>
            <select
              value={defaultRisk}
              onChange={(e) => {
                playClickSound();
                setDefaultRisk(e.target.value);
              }}
              className="input-field"
            >
              <option value="conservative">Conservative (Preserve capital & stability)</option>
              <option value="moderate">Moderate (Calculated bets with safety buffers)</option>
              <option value="aggressive">Aggressive (High upside, venture-scale risk)</option>
              <option value="highly_aggressive">Highly Aggressive (All-in founder velocity)</option>
            </select>
          </div>
        </div>

        {/* Core Values Tag Manager */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <label style={{ fontSize: "0.88rem", fontWeight: 700 }}>
              {t("profile.core_values_label", "Authentic Core Values & Operating Principles")}
            </label>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {coreValues.length} VALUES DEFINED
            </span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            The Mentor & CEO Advisors reference these values to evaluate trade-offs and prevent burnout or prestige traps.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {coreValues.map((val, idx) => (
              <span
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#fef08a",
                  fontSize: "0.85rem",
                  fontWeight: 700
                }}
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveValue(val)}
                  title="Remove Value"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f59e0b",
                    cursor: "pointer",
                    padding: "0",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={newValInput}
              onChange={(e) => setNewValInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === "Enter") { 
                  e.preventDefault(); 
                  handleAddValue(); 
                } 
              }}
              placeholder="Add core value (e.g. 'Velocity & Execution', 'First-Principles', 'High Agency', 'Work-Life Moat')..."
              className="input-field"
            />
            <button
              type="button"
              onClick={handleAddValue}
              className="btn-secondary"
              style={{ flexShrink: 0, padding: "0 18px" }}
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Personal Context & Superpowers */}
        <div>
          <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, marginBottom: "6px" }}>
            {t("profile.personal_context_label", "Executive Superpowers, Moats & Contextual Constraints")}
          </label>
          <textarea
            rows={3}
            value={personalContext}
            onChange={(e) => setPersonalContext(e.target.value)}
            placeholder="e.g. 8+ years building distributed AI platforms, high network leverage in B2B enterprise, remote preference, seeking equity-heavy inflection point..."
            className="input-field"
          />
        </div>

        {/* Save CTA */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: "12px 28px" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t("profile.saving", "Saving Strategic Profile...")}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Strategic Profile</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ─────────────────────────────────────────────
          SECTION 3: CUSTOM BOARD SEAT & PERSONA ADVISOR CREATOR
      ───────────────────────────────────────────── */}
      <CustomBoardAdvisorSection />
    </div>
  );
};

const CustomBoardAdvisorSection = () => {
  const [customAdvisors, setCustomAdvisors] = useState(() => {
    const saved = localStorage.getItem("decisionos_custom_advisors");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: "cmo-growth",
        name: "CMO / Growth Advisor",
        title: "Chief Marketing & Growth Officer",
        role: "User Acquisition, Virality & CAC/LTV",
        color: "#ec4899",
        active: true,
        directive: "Evaluates distribution moats, go-to-market channels, virality hooks, and conversion economics."
      },
      {
        id: "general-counsel",
        name: "General Counsel",
        title: "Chief Legal & IP Officer",
        role: "Contracts, Cap Table & Regulatory Risk",
        color: "#3b82f6",
        active: true,
        directive: "Audits intellectual property ownership, non-competes, legal liabilities, and regulatory hurdles."
      }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDirective, setNewDirective] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6");

  const saveAdvisors = (updated) => {
    setCustomAdvisors(updated);
    localStorage.setItem("decisionos_custom_advisors", JSON.stringify(updated));
  };

  const handleToggle = (id) => {
    playClickSound();
    const updated = customAdvisors.map(a => a.id === id ? { ...a, active: !a.active } : a);
    saveAdvisors(updated);
  };

  const handleDelete = (id) => {
    playRemoveSound();
    const updated = customAdvisors.filter(a => a.id !== id);
    saveAdvisors(updated);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDirective.trim()) return;
    playPopSound();

    const newAdvisor = {
      id: "custom-" + Date.now(),
      name: newName.trim(),
      title: newTitle.trim() || newName.trim(),
      role: newRole.trim() || "Strategic Advisor",
      color: newColor,
      active: true,
      directive: newDirective.trim()
    };

    saveAdvisors([...customAdvisors, newAdvisor]);
    setNewName("");
    setNewTitle("");
    setNewRole("");
    setNewDirective("");
    setIsAdding(false);
  };

  const addPreset = (preset) => {
    playPopSound();
    if (customAdvisors.some(a => a.name.toLowerCase() === preset.name.toLowerCase())) return;
    saveAdvisors([...customAdvisors, { ...preset, id: "preset-" + Date.now(), active: true }]);
  };

  return (
    <div className="rzp-card" style={{ marginTop: "32px", padding: "32px", border: "1px solid var(--border-amber)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={20} color="#f59e0b" />
            <span>Custom Board Seats & Persona Advisors</span>
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Expand your Personal Board of Directors with specialized advisors or iconic mentors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsAdding(!isAdding);
          }}
          className="btn-primary"
          style={{ padding: "8px 18px", fontSize: "0.85rem" }}
        >
          <Plus size={16} />
          <span>{isAdding ? "Cancel" : "Add Custom Board Seat"}</span>
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>
          ⚡ 1-Click Iconic Advisor Presets
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            {
              name: "Charlie Munger",
              title: "Mental Models & Inversion Architect",
              role: "Inversion Principle & Multi-Disciplinary Checklists",
              color: "#d97706",
              directive: "Invert, always invert. Points out where you are fooling yourself and applies cognitive bias checklists."
            },
            {
              name: "Steve Jobs",
              title: "Product Visionary & Taste Arbiter",
              role: "Insane Product Craft & Radical Simplicity",
              color: "#64748b",
              directive: "Demands uncompromising focus, cuts feature bloat, and insists on magical user experience."
            },
            {
              name: "Sam Altman",
              title: "Hyper-Scale & Compound Leverage Mentor",
              role: "Exponential Growth & Extreme Ambition",
              color: "#10b981",
              directive: "Pushes for 100x leverage, compounding momentum, and high-agency relentless execution."
            }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addPreset(preset)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#e2e8f0",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#f59e0b"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"}
            >
              <Plus size={13} color="#f59e0b" />
              <span>+ {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Advisor Form */}
      {isAdding && (
        <form onSubmit={handleAddCustom} style={{ padding: "20px", borderRadius: "12px", background: "rgba(10, 16, 30, 0.8)", border: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "14px", color: "#ffffff" }}>
            Configure New Board Seat
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>Advisor Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Chief Product Officer"
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>Title & Domain</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. VP of Product Strategy"
                className="input-field"
              />
            </div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>Directive Prompt / Persona Mindset</label>
            <textarea
              rows={2}
              value={newDirective}
              onChange={(e) => setNewDirective(e.target.value)}
              placeholder="e.g. Focus exclusively on product retention, user friction, and long-term differentiation."
              className="input-field"
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary" style={{ padding: "6px 14px" }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: "6px 18px" }}>
              Save Board Seat
            </button>
          </div>
        </form>
      )}

      {/* Active Custom Board Seats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
        {customAdvisors.map((advisor) => (
          <div
            key={advisor.id}
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: advisor.active ? "rgba(22, 33, 58, 0.7)" : "rgba(13, 20, 36, 0.4)",
              border: `1px solid ${advisor.active ? advisor.color : "rgba(255, 255, 255, 0.08)"}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.2s ease"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: advisor.color }} />
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
                    {advisor.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(advisor.id)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  title="Remove Seat"
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                {advisor.title}
              </p>
              <p style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                {advisor.directive}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: advisor.active ? "#10b981" : "var(--text-muted)" }}>
                {advisor.active ? "● SEAT ACTIVE IN DEBATES" : "○ MUTED"}
              </span>
              <button
                type="button"
                onClick={() => handleToggle(advisor.id)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: advisor.active ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                  color: advisor.active ? "#34d399" : "var(--text-secondary)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {advisor.active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

