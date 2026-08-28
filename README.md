# DecisionOS: AI-Powered Personal Board of Directors

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00.svg)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Memory-purple.svg)](https://www.trychroma.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **DecisionOS** is an executive-grade strategic intelligence platform that empowers founders, engineering leaders, and ambitious professionals to make high-stakes career, business, and life decisions by simulating a personalized **AI Board of Directors**.

---

## 🏛️ Why DecisionOS?

Instead of relying on a single generic AI chatbot prompt, **DecisionOS** orchestrates 6 specialized, autonomous AI agents representing executive board personas. The agents formulate models, deliberate independently, engage in round-table dialectical debate, and synthesize a cohesive strategic verdict backed by long-term vector memory.

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
6. **Executive Glassmorphism UI**
   - Built with React, Vite, and Lucide icons featuring a real-time circular boardroom visualizer and active speaker spotlight.

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
