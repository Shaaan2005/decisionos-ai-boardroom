<div align="center">
  <img src="frontend/public/decisionos-logo.png" width="100" height="100" alt="DecisionOS Logo" style="border-radius: 20px; box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);" />
  
  # DecisionOS: AI-Powered Personal Board of Directors
  
  <p><b>Autonomous Executive Strategic Intelligence Platform powered by Multi-Agent Consensus & Long-Term Vector Memory</b></p>

  [![Live Web App](https://img.shields.io/badge/Live_App-Vercel-black?logo=vercel&logoColor=white)](https://decisionos-ai-boardroom.vercel.app)
  [![Android APK](https://img.shields.io/badge/Android_App-Download_.APK-green?logo=android&logoColor=white)](https://decisionos-ai-boardroom.vercel.app/DecisionOS.apk)
  [![PWA](https://img.shields.io/badge/PWA-iOS_%26_Android_Ready-F59E0B.svg?logo=pwa&logoColor=white)](https://decisionos-ai-boardroom.vercel.app)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
  [![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00.svg)](https://github.com/langchain-ai/langgraph)
  [![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Memory-purple.svg)](https://www.trychroma.com/)
  [![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://reactjs.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  <br />

  [🌐 **Live Web Application**](https://decisionos-ai-boardroom.vercel.app) • [📲 **Download Android APK**](https://decisionos-ai-boardroom.vercel.app/DecisionOS.apk) • [📖 **API Documentation**](https://decisionos-ai-boardroom.onrender.com/docs)
</div>

<br />

> **DecisionOS** is an executive-grade strategic intelligence platform that empowers founders, engineering leaders, and ambitious professionals to navigate high-stakes career, business, and life decisions by simulating a personalized **AI Board of Directors**.

---



## 🏛️ Why DecisionOS?

When leaders face high-stakes dilemmas (fundraising, career pivots, architectural rewrites, personal investments), single-prompt generic AI chatbots fail due to **sycophancy** (they agree with whatever the user says) and a lack of adversarial tension.

**DecisionOS** solves the echo chamber of solo decision-making by orchestrating 6 specialized, autonomous AI agents representing executive board personas. The agents formulate models, deliberate independently, engage in round-table dialectical debate, and synthesize a cohesive strategic verdict backed by long-term vector memory.

### ⚔️ Generic AI Chatbots vs. DecisionOS

| Dimension | Generic AI Chatbots | **DecisionOS (AI Boardroom)** |
| :--- | :--- | :--- |
| **Perspective** | Single agreeable "yes-man" response. | **6 Adversarial Executive Personas** actively challenging each other. |
| **Memory** | Session-scoped; forgets context in new chats. | **ChromaDB Vector Vault:** Recalls user values, past choices & outcomes. |
| **Adversarial Testing** | Surface-level pros and cons. | **Round-Table Cross-Examination:** CFO challenges ROI, Risk installs tripwires. |
| **Deliverable** | Unstructured wall of chat text. | **Executive Deliverable:** Confidence score (0–100%), Tension Matrix & Roadmap. |
| **Modalities** | Text-only typing. | **Spoken Narration (TTS), Voice Dictation (STT), and Native Mobile App.** |

---

### 🎯 Who is DecisionOS Built For?

* **🚀 Solo Founders & Indie Hackers:** Access a 24/7 advisory board before burning capital, hiring, or pivoting product strategy.
* **🛠️ Engineering & Product Leaders:** Stress-test architectural trade-offs (e.g. *Monolith vs Microservices*, *Build vs Buy*).
* **📈 High-Stakes Career Navigators:** Evaluate salary vs equity packages, leadership promotions, and geographic relocations.
* **🎓 Ambitious Professionals & Students:** Unpack pivotal life crossroads with structured, multi-dimensional counsel.

---

### 🔄 Multi-Agent Deliberation Architecture
```
                                 [ User Strategic Dilemma ]
                                             │
                                             ▼
                             [ 🔍 Decision Analyzer Agent ]
                                             │
               ┌──────────────┬──────────────┼──────────────┬──────────────┐
               ▼              ▼              ▼              ▼              ▼
          [ CEO Agent ]  [ CFO Agent ]  [ CTO Agent ]  [ Risk Agent ] [ Mentor Agent ]
          (Vision/Upside)  (Runway/ROI)   (Tech Velocity) (Pre-Mortem)   (Core Values)
               │              │              │              │              │
               └──────────────┴──────────────┼──────────────┴──────────────┘
                                             │
                                             ▼
                          [ ⚔️ Cross-Agent Round-Table Debate ]
                                 (Dialectical Rebuttals)
                                             │
                                             ▼
                              [ ⚖️ Chairman of the Board ]
                                (Synthesis & Final Verdict)
                                             │
                                             ▼
                           [ 📊 Executive Deliverable & Plan ]
```

---


## 👥 The Autonomous Board Members

| Advisor | Role & Mandate | Strategic Lens |
| :--- | :--- | :--- |
| **CEO Agent** | *Chief Executive Officer* | Long-term compounding growth, market leverage, asymmetric upside, brand equity. |
| **CFO Agent** | *Chief Financial Officer* | Financial runway modeling, risk-adjusted ROI, liquid cash preservation, equity discounting. |
| **CTO Agent** | *Chief Technology Officer* | Skill velocity, technical mastery, architecture ownership, avoiding skill obsolescence. |
| **Risk Analyst** | *Chief Risk Officer* | Pre-mortem auditing, worst-case scenario analysis, 90-day tripwires, downside hedging. |
| **Mentor Agent** | *Life Strategy Guardian* | Alignment with authentic personal values, work-life balance, retrospective memory retrieval. |
| **Chairman Agent** | *Board Moderator & Arbiter* | Synthesizes opposing viewpoints, calculates consensus score, delivers binding verdict. |

---

## 🚀 Key Features

1. **Multi-Agent Dialectical Debate (LangGraph)**
   - Autonomous cross-examination where advisors challenge each other's assumptions (e.g. CFO questions equity liquidity; CEO defends upside asymmetry; Risk Analyst installs 90-day tripwires).
2. **Semantic Memory Vault (ChromaDB)**
   - Embeds past user decisions, chosen alternatives, and retrospective outcomes.
   - Automatically retrieves historical learnings during new deliberations (e.g. *"Reflecting on your choice in 2024, you prioritized learning velocity over comfort..."*).
3. **Comprehensive Executive Deliverables**
   - Official Recommendation & Verdict
   - Confidence Score Gauge (0–100%)
   - Unanimous Agreements vs. Debated Tensions Matrix
   - Pre-Mortem Risk Audit & Tactical Safeguards
   - Step-by-Step Action Roadmap
4. **Explainability & Interactive Board Debrief ("Ask the Board")**
   - Directly query individual board members (e.g. *"CFO, why did you advise against Option B?"*) or the entire board with grounded responses.
5. **Retrospective Outcome Tracking**
   - Log actual real-world outcomes 3/6/12 months later to benchmark predictions and continuously improve board accuracy.
6. **Synchronized Voice Narration (TTS) & On-Demand Speech**
   - Real-time spoken debate narration where advisor turn progressions wait synchronously for speech synthesis before advancing.
   - Interactive on-demand speaker playback while paused.
7. **Hands-Free Speech-to-Text Dictation**
   - Pre-flight microphone permission handshake for high-accuracy voice dictation when submitting dilemmas or chatting with copilot.
8. **Progressive Web App (PWA) & Direct Android APK**
   - 100% store-ready PWA with offline caching (`/sw.js`), Apple touch home-screen engine, and direct `.apk` binary distribution.
9. **Global Multi-Language Support (12+ Languages)**
   - Dynamic localization (English, Hindi, Spanish, French, German, Japanese, Chinese, Arabic, Russian, Portuguese, etc.) with localized voice audio synthesis.
10. **Interactive Avatar Studio**
    - Zero-lag 120 FPS draggable & expandable circular lens cropper with client-side canvas processing.
11. **Executive Glassmorphism Cockpit UI**
    - Dynamic radial boardroom visualizer, consensus metrics, and command palette (`Ctrl + K`).

---


## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy (Async), SQLite / PostgreSQL, Pydantic v2.
- **Orchestration**: LangGraph, LangChain Core.
- **Vector Database**: ChromaDB.
- **Security**: JWT Authentication (python-jose, bcrypt).
- **Frontend**: React 18, Vite, Lucide React, Custom Dark Glassmorphism CSS Design System.
- **LLM Support**: Ollama (Llama 3, Mistral), OpenAI API, and High-Fidelity Simulation Engine.

---

## ⚡ Quick Start

### 1. Clone & Setup Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
FastAPI documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

```bash
cd backend
pytest tests -v
```

---

## 🐳 Docker Deployment

Set these secrets before starting the stack:

```bash
# PowerShell
$env:SECRET_KEY = "replace-with-a-long-random-secret"
$env:POSTGRES_PASSWORD = "replace-with-a-strong-database-password"
```

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## ☁️ Render Deployment

The repository includes `render.yaml` for a Render Blueprint deployment.

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository.
3. Set `BACKEND_CORS_ORIGINS` on `decisionos-api` to the deployed frontend URL.
4. Set `VITE_API_URL` on `decisionos-web` to the backend URL plus `/api`, such as `https://decisionos-api.onrender.com/api`.
5. Redeploy `decisionos-web` after setting `VITE_API_URL`.

The API enforces PostgreSQL and a strong `SECRET_KEY` when `ENVIRONMENT=production`.

Render creates the backend, frontend, and PostgreSQL services from `render.yaml`.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
