import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { 
  Database, 
  Search, 
  Sparkles, 
  Award, 
  BookOpen, 
  ArrowRight, 
  CheckCircle,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { VaultAnalyticsDashboard } from "../components/VaultAnalyticsDashboard";

export const MemoryVaultPage = () => {
  const { t } = useLanguage();
  const [memories, setMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const fetchVault = async () => {
    try {
      setLoading(true);
      const data = await api.getMemoryVault();
      setMemories(data || []);
    } catch (err) {
      setError(err.message || "Failed to load memory vault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchVault();
      return;
    }
    setSearching(true);
    try {
      const results = await api.searchMemory(searchQuery);
      setMemories(results || []);
    } catch (err) {
      setError("Semantic search error: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(6, 182, 212, 0.15)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Database size={20} color="#06b6d4" />
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800 }}>
            {t("vault.title", "Long-Term Memory Vault")}
          </h1>
        </div>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: "700px" }}>
          {t("vault.desc", "DecisionOS stores vectorized embeddings of your past decisions, choices, and retrospective lessons. When new dilemmas arise, your Personal Board extracts semantic wisdom to ensure you never repeat past blindspots.")}
        </p>
      </div>

      {/* Longitudinal Analytics & Calibration Stats */}
      <VaultAnalyticsDashboard memories={memories} />

      {/* Semantic Search Box */}
      <div className="glass-card" style={{ padding: "20px", marginBottom: "28px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flexGrow: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("vault.search_placeholder", "Search memory vault by dilemma, lesson, or career theme...")}
              className="input-field"
              style={{ paddingLeft: "42px" }}
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="btn-primary"
            style={{ padding: "0 24px" }}
          >
            {searching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <BrainCircuit size={18} />
                <span>{t("vault.search_btn", "Semantic Query")}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "10px", color: "var(--text-muted)" }}>
          <Loader2 size={24} className="animate-spin" />
          <span>{t("vault.scanning", "Scanning ChromaDB vector vault...")}</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 24px", textAlign: "center" }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
            {t("vault.empty_title", "No Historical Memories Indexed Yet")}
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
            {t("vault.empty_desc", "Once you log retrospective outcomes on completed decisions, your reflections will automatically be embedded here for future boardroom sessions.")}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {memories.map((mem, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover"
              style={{ padding: "24px", borderLeft: "4px solid #06b6d4" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", background: "rgba(6, 182, 212, 0.15)", color: "#7dd3fc" }}>
                    {mem.category || "Career & Strategy"}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "6px" }}>
                    {mem.title}
                  </h3>
                </div>

                {mem.satisfaction_score && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: "8px" }}>
                    <Award size={16} color="#f59e0b" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fde68a" }}>
                      {mem.satisfaction_score}/10 Satisfaction
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "14px" }}>
                <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "14px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    {t("vault.choice_label", "Choice Executed")}
                  </span>
                  <p style={{ fontSize: "0.9rem", color: "#e2e8f0", fontWeight: 600 }}>
                    {mem.choice}
                  </p>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "14px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    {t("vault.outcome_label", "Realized Outcome")}
                  </span>
                  <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: "1.5" }}>
                    {mem.outcome}
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: "16px",
                padding: "14px 18px",
                borderRadius: "8px",
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a5b4fc" }}>
                    {t("vault.lesson_label", "Core Strategic Lesson Injected to Board")}
                  </span>
                </div>
                <p style={{ fontSize: "0.92rem", color: "#ffffff", fontStyle: "italic", lineHeight: "1.5" }}>
                  "{mem.lesson}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
