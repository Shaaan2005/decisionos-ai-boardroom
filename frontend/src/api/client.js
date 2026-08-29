const API_BASE = import.meta.env.VITE_API_URL || "/api";

class ApiClient {
  constructor() {
    // One-time migration for sessions created before cookie authentication.
    // The token is removed from persistent storage immediately and retained
    // only long enough for /auth/me to exchange it for an HttpOnly cookie.
    this.token = localStorage.getItem("decisionos_token") || null;
    localStorage.removeItem("decisionos_token");
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: "include",
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        this.setToken(null);
        window.dispatchEvent(new Event("auth_unauthorized"));
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = data.detail || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error("DecisionOS API is unavailable. Start the backend service and try again.");
      }
      if (error.message?.includes("Authentication credentials were not provided")) {
        throw error;
      }
      console.error(`API Error on [${options.method || "GET"}] ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication
  async register(data) {
    const res = await this.request("/auth/register", { method: "POST", body: data });
    // Memory-only fallback for browsers that do not accept the auth cookie.
    // A page refresh still relies on the HttpOnly cookie, never localStorage.
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async login(data) {
    const res = await this.request("/auth/login", { method: "POST", body: data });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async getMe() {
    return this.request("/auth/me");
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" });
    this.setToken(null);
  }

  // Profile
  async getProfile() {
    return this.request("/users/profile");
  }

  async updateProfile(data) {
    return this.request("/users/profile", { method: "PUT", body: data });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE}/users/avatar`;
    const headers = {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || "Failed to upload avatar image");
    }
    return data;
  }


  async parseResumeText(text, apiKey = null) {
    return this.request("/users/parse-resume", {
      method: "POST",
      body: { text, api_key: apiKey },
    });
  }

  async uploadResumeFile(file, apiKey = null) {
    const formData = new FormData();
    formData.append("file", file);
    if (apiKey) formData.append("api_key", apiKey);

    const url = `${API_BASE}/users/upload-resume`;
    const headers = {
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || "Failed to parse resume file");
    }
    return data;
  }


  // Decisions
  async createDecision(data) {
    return this.request("/decisions", { method: "POST", body: data });
  }

  async listDecisions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/decisions${query ? `?${query}` : ""}`);
  }

  async getDecision(id) {
    return this.request(`/decisions/${id}`);
  }

  async deleteDecision(id) {
    return this.request(`/decisions/${id}`, { method: "DELETE" });
  }

  async deliberateDecision(id, language = null) {
    const lang = language || localStorage.getItem("decisionos_lang") || "en";
    const query = lang ? `?language=${encodeURIComponent(lang)}` : "";
    return this.request(`/decisions/${id}/deliberate${query}`, { method: "POST" });
  }

  async getDecisionReport(id) {
    return this.request(`/decisions/${id}/report`);
  }

  async recordOutcome(id, data) {
    return this.request(`/decisions/${id}/outcome`, { method: "POST", body: data });
  }

  // Boardroom Interactive Chat
  async askBoard(id, agentName, question) {
    return this.request(`/boardroom/${id}/ask`, {
      method: "POST",
      body: { agent_name: agentName, question },
    });
  }

  // Global Strategic Copilot Chat
  async askGlobalCopilot(query, advisorPersona = "Chairman", decisionId = null) {
    return this.request("/boardroom/copilot", {
      method: "POST",
      body: {
        query,
        advisor_persona: advisorPersona,
        decision_id: decisionId,
      },
    });
  }

  // Memory Vault
  async getMemoryVault() {
    return this.request("/memory/vault");
  }

  async searchMemory(query) {
    return this.request("/memory/search", { method: "POST", body: { query } });
  }
}

export const api = new ApiClient();
