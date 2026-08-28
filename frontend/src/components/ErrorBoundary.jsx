import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DecisionOS Error Boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <AlertTriangle size={28} color="#f43f5e" />
          </div>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
            Deliberation Chamber Recovery
          </h3>

          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "480px", marginBottom: "20px", lineHeight: "1.6" }}>
            An unexpected render issue occurred while assembling the boardroom data. Click below to reload the session.
          </p>

          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <RotateCcw size={16} />
            <span>Reload Boardroom Session</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
