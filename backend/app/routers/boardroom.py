from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
import re
import ast
import operator
import logging

from app.config import settings
from app.llm.factory import LLMFactory
from app.database.session import get_db
from app.models.user import User
from app.models.decision import Decision
from app.models.report import DecisionReport
from app.schemas.report import InteractiveChatRequest, InteractiveChatResponse, ChatAttachment
from app.core.dependencies import get_current_user
from app.core.rate_limit import enforce_user_rate_limit

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/boardroom", tags=["Boardroom Interactive"])
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.Mod: operator.mod,
}

def _eval_safe_math(expr_str: str) -> Optional[float]:
    """Safely evaluate simple arithmetic expressions like 2 + 2, (50 * 4) / 2."""
    clean = re.sub(r'^(what\s+is\s+|calculate\s+|solve\s+|evaluate\s+|how\s+much\s+is\s+)', '', expr_str.lower().strip()).rstrip('?').strip()
    if not re.match(r'^[0-9\.\s\+\-\*\/\(\)\%]+$', clean) or not any(c.isdigit() for c in clean):
        return None
    try:
        def _eval(node):
            if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                return node.value
            elif isinstance(node, ast.BinOp) and type(node.op) in SAFE_OPERATORS:
                return SAFE_OPERATORS[type(node.op)](_eval(node.left), _eval(node.right))
            elif isinstance(node, ast.UnaryOp) and type(node.op) in SAFE_OPERATORS:
                return SAFE_OPERATORS[type(node.op)](_eval(node.operand))
            raise ValueError('unsupported')
        parsed = ast.parse(clean, mode='eval')
        return _eval(parsed.body)
    except Exception:
        return None


CAPITALS_DICT = {
    'india': 'New Delhi', 'france': 'Paris', 'usa': 'Washington, D.C.', 'united states': 'Washington, D.C.', 'america': 'Washington, D.C.',
    'japan': 'Tokyo', 'germany': 'Berlin', 'uk': 'London', 'united kingdom': 'London', 'england': 'London', 'britain': 'London',
    'canada': 'Ottawa', 'australia': 'Canberra', 'china': 'Beijing', 'russia': 'Moscow', 'italy': 'Rome', 'spain': 'Madrid',
    'brazil': 'Brasília', 'uae': 'Abu Dhabi', 'dubai': 'Abu Dhabi (Dubai is the largest city, Abu Dhabi is the capital)',
    'pakistan': 'Islamabad', 'bangladesh': 'Dhaka', 'nepal': 'Kathmandu', 'sri lanka': 'Sri Jayawardenepura Kotte',
    'singapore': 'Singapore', 'south korea': 'Seoul', 'switzerland': 'Bern', 'netherlands': 'Amsterdam',
    'egypt': 'Cairo', 'south africa': 'Pretoria (Administrative)', 'saudi arabia': 'Riyadh', 'indonesia': 'Jakarta / Nusantara',
    'turkey': 'Ankara', 'mexico': 'Mexico City', 'argentina': 'Buenos Aires', 'thailand': 'Bangkok', 'vietnam': 'Hanoi',
    'malaysia': 'Kuala Lumpur', 'sweden': 'Stockholm', 'norway': 'Oslo', 'finland': 'Helsinki', 'poland': 'Warsaw',
    'ireland': 'Dublin', 'portugal': 'Lisbon', 'greece': 'Athens', 'austria': 'Vienna', 'belgium': 'Brussels',
    'new zealand': 'Wellington', 'philippines': 'Manila', 'denmark': 'Copenhagen', 'israel': 'Jerusalem', 'iran': 'Tehran'
}

FACTS_DICT = {
    "speed of light": "The speed of light in a vacuum is **299,792,458 meters per second** (~300,000 km/s or 186,282 miles/s).",
    "largest planet": "The largest planet in our solar system is **Jupiter**, with a mass 2.5 times that of all other planets combined.",
    "smallest planet": "The smallest planet in our solar system is **Mercury**.",
    "closest star": "The closest star to Earth is the **Sun**. The next closest star is **Proxima Centauri** (~4.24 light-years away).",
    "boiling point of water": "Water boils at **100°C (212°F)** at standard atmospheric pressure.",
    "freezing point of water": "Water freezes at **0°C (32°F)** at standard atmospheric pressure.",
    "bones in human body": "An adult human body has **206 bones**.",
    "largest organ": "The largest organ of the human body is the **skin**.",
    "powerhouse of the cell": "The **mitochondria** are known as the powerhouse of the cell because they generate ATP energy.",
    "who discovered gravity": "Sir **Isaac Newton** formulated the classical law of universal gravitation in 1687.",
    "father of computer": "**Charles Babbage** is considered the father of the computer for conceptualizing the Analytical Engine.",
    "father of ai": "**John McCarthy** and **Alan Turing** are widely regarded as the founding fathers of Artificial Intelligence.",
    "what is dna": "**DNA (Deoxyribonucleic Acid)** is the biological molecule carrying the genetic blueprint of all known living organisms.",
    "what is html": "**HTML (HyperText Markup Language)** is the foundational standard markup language for creating web pages.",
    "what is python": "**Python** is a versatile, high-level programming language widely used in AI, data science, and web backends.",
    "what is react": "**React** is a declarative JavaScript library created by Meta for building dynamic user interfaces.",
    "what is faststream": "**FastAPI** is a high-performance Python framework for building REST APIs with automatic OpenAPI docs."
}

def _resolve_general_knowledge(query: str) -> Optional[str]:
    """Directly resolve world facts, geography, and general knowledge questions."""
    q = query.lower().strip().rstrip("?.!")
    
    # Capital of X check
    m = re.search(r'capital\s+(?:city\s+)?of\s+([a-zA-Z\s]+)', q)
    if m:
        c = m.group(1).strip().lower()
        if c in CAPITALS_DICT:
            return f"The capital of {c.title()} is **{CAPITALS_DICT[c]}**."
            
    # Facts check
    for key, fact in FACTS_DICT.items():
        if key in q:
            return fact
            
    return None




class ChatMessageItem(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(max_length=5_000)
    advisor: Optional[str] = Field(default=None, max_length=100)
    attachments: Optional[List[ChatAttachment]] = Field(default_factory=list, max_length=5)


class GlobalCopilotRequest(BaseModel):
    query: str = Field(max_length=5_000)
    advisor_persona: Optional[str] = Field(default="Chairman", max_length=100)
    decision_id: Optional[str] = None
    history: Optional[List[ChatMessageItem]] = Field(default_factory=list, max_length=10)
    attachments: Optional[List[ChatAttachment]] = Field(default_factory=list, max_length=5)
    api_key: Optional[str] = Field(default=None, max_length=512)

    @model_validator(mode="after")
    def limit_attachment_payload(self):
        attachments = [*(self.attachments or [])]
        for message in self.history or []:
            attachments.extend(message.attachments or [])
        if sum(len(item.data or "") for item in attachments) > 5_000_000:
            raise ValueError("Combined attachment payload must be 5 MB or smaller")
        return self



class GlobalCopilotResponse(BaseModel):
    responder: str
    response: str


# ---------------------------------------------------------------------------
# DEEP INTELLIGENCE ENGINE
# ---------------------------------------------------------------------------

def _keywords(q: str, *words: str) -> bool:
    return any(w in q for w in words)


def _pick(advisor: str, mapping: dict, default: str = "") -> str:
    if not mapping:
        return default
    if advisor in mapping:
        return mapping[advisor]
    if "Chairman" in mapping:
        return mapping["Chairman"]
    return next(iter(mapping.values()))



def _extract_pdf_text(data_str: str) -> str:
    """Extract text from base64 encoded PDF string."""
    try:
        import base64, io, pypdf
        clean = data_str
        if "," in clean:
            clean = clean.split(",", 1)[1]
        pdf_bytes = base64.b64decode(clean)
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted = []
        for i, page in enumerate(reader.pages):
            txt = page.extract_text()
            if txt:
                extracted.append(f"--- Page {i+1} ---\n{txt.strip()}")
        return "\n\n".join(extracted)
    except Exception as e:
        logger.warning(f"PDF extraction error: {e}")
        return ""



def _is_gibberish(text: str) -> bool:
    """Detects keyboard smashing, random character runs, and non-sensical strings."""
    t = text.strip()
    if not t:
        return True
    
    cleaned = re.sub(r'[^a-zA-Z\s]', '', t).strip()
    if not cleaned and len(t) >= 3:
        return True
    
    words = cleaned.split()
    if not words:
        return True
    
    for w in words:
        w_lower = w.lower()
        if len(w_lower) >= 4:
            vowels = sum(1 for c in w_lower if c in "aeiouy")
            if vowels == 0 or re.search(r'[bcdfghjklmnpqrstvwxyz]{6,}', w_lower):
                return True
            if re.search(r'(.)\1{3,}', w_lower):
                return True
            if any(smash in w_lower for smash in ["asdf", "qwerty", "zxcv", "hjkl", "dfgh", "jklm", "12345"]):
                return True
    
    if len(words) <= 2:
        for w in words:
            if len(w) >= 4 and sum(1 for c in w.lower() if c in "aeiouy") <= 0:
                return True
                
    return False


def answer(agent: str, query: str, name: str, history: List[ChatMessageItem]) -> str:  # noqa: C901
    """Return a rich, human-level answer for any query from the given advisor persona."""
    q = query.lower().strip()

    # ──────────────────────────────────────────────────────────────────────
    # 0.0 DIRECT ARITHMETIC / MATH / QUICK CALCULATIONS
    # ──────────────────────────────────────────────────────────────────────
    math_val = _eval_safe_math(query)
    if math_val is not None:
        clean_expr = re.sub(r'^(what\s+is\s+|calculate\s+|solve\s+|evaluate\s+|how\s+much\s+is\s+)', '', query.strip()).rstrip('?').strip()
        val_str = f"{int(math_val):,}" if isinstance(math_val, (int, float)) and math_val == int(math_val) else f"{math_val:,.4f}"
        return (
            f"**{clean_expr} = {val_str}**\n\n"
            f"Let me know if you need to run financial projections, runway calculations, or quantitative models, {name}!"
        )

    # ──────────────────────────────────────────────────────────────────────
    # 0.05 GENERAL KNOWLEDGE, CAPITALS & WORLD FACTS
    # ──────────────────────────────────────────────────────────────────────
    gk_ans = _resolve_general_knowledge(query)
    if gk_ans is not None:
        return f"{gk_ans}\n\nAsk me anything else — whether science, facts, history, or strategic advice, {name}!"

    # ──────────────────────────────────────────────────────────────────────
    # 0.1 GIBBERISH & RANDOM NOISE HANDLING
    # ──────────────────────────────────────────────────────────────────────
    if _is_gibberish(query):
        return _pick(agent, {
            "Chairman": f"I didn't quite catch or understand that, {name} (it looks like a typo or jumbled text!). Lay out your dilemma or question in a full sentence and the Board will break it down.",
            "CEO": f"I couldn't make sense of that input, {name}. Rephrase what's on your mind or what venture/career move you're thinking through, and let's attack it.",
            "CFO": f"That didn't register as a clear query, {name}. Give me the concrete numbers, financial trade-off, or scenario you want to analyze.",
            "CTO": f"Syntax error on that message, {name} (looks like accidental typing!). Tell me what technical or engineering challenge you're solving and we'll engineer a solution.",
            "Risk Analyst": f"That message was garbled, {name}. Frame your dilemma clearly so I can run a proper pre-mortem and risk audit for you.",
            "Mentor": f"I didn't quite understand what you wrote there, {name}. Take a breath, write out what you're thinking or feeling, and we'll walk through it together."
        })

    # ──────────────────────────────────────────────────────────────────────
    # 0.2 CONVERSATIONAL META & COMMUNICATION REPAIRS
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "why are you not able to understand", "you don't understand", "dont understand me", "not understanding", "not able to understand", "why don't you understand", "listen to me", "stop repeating", "are you dumb", "you are confused"):
        return _pick(agent, {
            "Chairman": f"I hear you loud and clear, {name}. I apologize for sounding formulaic — I'm resetting and listening directly. Tell me plainly in your own words what's happening or what you need help with right now.",
            "Mentor": f"I'm really sorry for that, {name}. I want to truly listen to you, human to human. Let's drop any rigid frameworks. What is going on, and how can I help you right now?",
            "CEO": f"Got it, {name}. Let's cut the fluff. Talk to me straight — what's the core issue or move you want to discuss?",
            "CFO": f"Understood, {name}. My apologies. Let's start fresh: what is on your table today?",
            "CTO": f"Message received, {name}. Let's reboot the conversation. Tell me what's on your mind.",
            "Risk Analyst": f"Understood, {name}. I'm paying full attention now. Tell me what situation you're dealing with."
        })

    # ──────────────────────────────────────────────────────────────────────
    # 0.3 HEALTH, WELLNESS & EMOTIONAL WELL-BEING
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "dont feel well", "not feeling well", "feel sick", "feeling sick", "have a fever", "have headache", "headache", "stomach pain", "body pain", "exhausted", "burned out", "burnout", "too stressed", "feeling depressed", "feeling low", "sad", "unwell", "ill"):
        return _pick(agent, {
            "Mentor": (
                f"I'm really sorry to hear you're not feeling well, {name}.\n\n"
                "When your body or mind signals distress, **everything else must take a backseat**:\n\n"
                "1. **Step away from screens & work**: Give yourself permission to pause. High performance requires proactive recovery.\n"
                "2. **Hydrate & Rest**: Drink water, rest in a calm space, and don't force productivity today.\n"
                "3. **Check in with a doctor**: If you're experiencing persistent physical symptoms or fever, please consult a medical professional.\n\n"
                "Is it physical fatigue, illness, or mental/emotional overwhelm that you're feeling right now?"
            ),
            "Chairman": (
                f"Your health and well-being come first, {name}. No strategic plan or career move matters if your physical and mental foundation is compromised.\n\n"
                "- Please take time to rest, hydrate, and step away from demanding tasks.\n"
                "- If this is a medical issue, seek professional healthcare advice.\n\n"
                "Take it easy today. We can tackle your goals whenever you're fully recovered."
            ),
            "CEO": (
                f"Take care of yourself first, {name}. Energy management is the #1 asset of top leaders. Log off, get real rest, and come back when you're 100%."
            )
        })

    # Clarification regarding 'heart' / physical vs metaphorical:
    if _keywords(q, "problem in heart", "issue in heart", "not heart", "no heart problem"):
        return _pick(agent, {
            "Mentor": f"Understood, {name}! When I mentioned 'heart of the situation', I meant the core dilemma or main topic on your mind — not physical heart health! Take your time, what would you like to talk about?",
            "Chairman": f"Understood, {name}! By 'at the heart of this', I meant the core central issue or main question you want to solve. What's on your mind today?"
        })

    # ──────────────────────────────────────────────────────────────────────
    # 0.5 HUMAN COGNITIVE ERRORS & BIAS DIAGNOSTICS
    # ──────────────────────────────────────────────────────────────────────
    # Sunk Cost Fallacy:
    if _keywords(q, "sunk cost", "spent 3 years", "spent 2 years", "spent 4 years", "spent so much", "already invested", "wasted so much", "put in so much time", "should i quit after putting"):
        return _pick(agent, {
            "Chairman": (
                f"**Cognitive Trap Detected: Sunk Cost Fallacy.**\n\n"
                f"{name}, past time, capital, and emotional energy already spent are **zero-return assets**. They are gone regardless of what you choose today.\n\n"
                "**The Board's Clean-Slate Test**:\n"
                "If you woke up today with amnesia and zero attachment to this path, with your current knowledge and resources — **would you choose to start this exact same path today?**\n\n"
                "- If **NO**: Every single additional month you stay is compounding your losses.\n"
                "- If **YES**: Then continue, but re-engineer your strategy.\n\n"
                "What is the exact opportunity you'd pursue if past investment didn't hold you back?"
            ),
            "CFO": (
                f"{name}, in financial calculus, past sunk costs have an expected future return of exactly **$0.00**.\n\n"
                "Continuing a suboptimal path just because you've invested time into it is like holding a tanking stock hoping it breaks even. You're incurring **massive opportunity cost** on your highest-earning years.\n\n"
                "Cut the underperforming position and reallocate your energy to positive-ROI opportunities."
            ),
            "Mentor": (
                f"{name}, you're not 'wasting' those years if you leave — you're liberating the lessons you learned from them.\n\n"
                "The biggest psychological mistake humans make is mistaking **quitting a bad strategy** with **failing**. Quitting the wrong room is the only way you enter the right room.\n\n"
                "What is your intuition telling you to do if fear of 'wasted time' was removed?"
            )
        })

    # Analysis Paralysis & Overthinking:
    if _keywords(q, "overthinking", "analysis paralysis", "stuck in my head", "can't decide", "cant decide", "too many options", "paralyzed by choice"):
        return _pick(agent, {
            "CEO": (
                f"**Cognitive Trap Detected: Analysis Paralysis.**\n\n"
                f"{name}, speed of execution beats perfection every single time. In high-velocity leadership, decisions are divided into two categories:\n\n"
                "1. **Type 1 (Two-Way Doors)**: Reversible decisions. Make these in **10 minutes** with 70% information. If it doesn't work, revert.\n"
                "2. **Type 2 (One-Way Doors)**: Irreversible decisions. Install 90-day tripwires and stress-test rigorously.\n\n"
                "95% of what you're overthinking is a Type 1 reversible door. Pick Option A for 14 days. Bias towards action."
            ),
            "Chairman": (
                f"{name}, more data will not resolve your uncertainty — only **reality feedback** will.\n\n"
                "**The Board's 48-Hour Forcing Function**:\n"
                "1. Eliminate all options except the top 2.\n"
                "2. Assign each a 30-day micro-experiment.\n"
                "3. Which path generates faster direct market signal? Commit to that one by tomorrow."
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # GREETINGS & SMALL TALK
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "hello", "hi", "hey", "hola", "namaste", "sup", "yo") and len(query.split()) <= 5:
        return _pick(agent, {
            "Chairman": f"Hello, {name}! I'm the Chairman of your AI Board of Directors. I synthesize all five advisor perspectives into decisive, actionable verdicts. Whether it's a career fork, startup dilemma, or life decision — lay it on the table.",
            "CEO": f"Hey {name}! I'm your CEO Advisor. My job is to find the asymmetric upside in everything you're facing. I push ambition over fear, compounding over comfort. What opportunity or dilemma are we attacking today?",
            "CFO": f"Welcome, {name}. I'm your CFO Advisor. I keep the numbers honest — cash runway, compensation math, equity discounts, ROI on your time and capital. What financial decision do you need to stress-test?",
            "CTO": f"Hey {name}! I'm your CTO Advisor. I help you build technical mastery, navigate career paths in tech, evaluate engineering opportunities, and avoid skill obsolescence. What's on your mind?",
            "Risk Analyst": f"Good to see you, {name}. I'm your Chief Risk Officer. I run pre-mortems, identify hidden failure modes, and install guardrails before you commit to irreversible decisions. What needs a risk audit?",
            "Mentor": f"Hello {name}! I'm your Life & Career Mentor. I help you cut through noise, find clarity, and make decisions that align with who you actually are — not just who the world expects you to be. What's weighing on you?"
        })


    # ──────────────────────────────────────────────────────────────────────
    # GENERAL QUESTIONS: what can you do / help
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "what can you do", "what do you do", "help me", "how do you help", "who are you", "what is this"):
        return (
            f"I'm your {agent} Advisor inside **DecisionOS**, a Personal AI Board of Directors.\n\n"
            f"You can ask me **anything**: career advice, startup decisions, salary negotiations, technical roadmaps, investment thinking, relationship dilemmas, mental health strategies, coding help, life philosophy — literally anything.\n\n"
            f"I'll respond through my **{agent} lens**: applying structured, expert-level thinking to your specific situation.\n\n"
            f"Go ahead. What's on your mind, {name}?"
        )

    # ──────────────────────────────────────────────────────────────────────
    # SDE / SOFTWARE ENGINEER CAREER
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "sde", "software engineer", "software developer", "coding job", "tech job", "developer job"):
        if _keywords(q, "intern", "internship"):
            return _pick(agent, {
                "CTO": (
                    f"Here's your no-fluff SDE internship battle plan, {name}:\n\n"
                    "**Phase 1 – DSA (6–8 weeks)**\n"
                    "- Master the 75 core NeetCode patterns: Arrays, Sliding Window, Two Pointers, Linked Lists, Trees, Graphs, Heaps, DP.\n"
                    "- Do NOT grind 500 random problems. Understand 75 patterns deeply enough to explain the time/space trade-off out loud.\n"
                    "- Language recommendation: Python (fastest to write in interviews) or Java (required at many enterprise firms).\n\n"
                    "**Phase 2 – 1 Proof-of-Work Project (parallel)**\n"
                    "- Build a full-stack system with: user auth (JWT), REST API, real database (PostgreSQL preferred), rate limiting, and deployment (Railway/Render).\n"
                    "- Document it with a README containing architecture diagram, API endpoints, and setup instructions.\n\n"
                    "**Phase 3 – CS Fundamentals**\n"
                    "- OS: Threads vs Processes, context switching, deadlock, virtual memory.\n"
                    "- DBMS: Indexing, ACID, normalization (1NF/2NF/3NF), transactions.\n"
                    "- Networks: TCP/IP, HTTP vs HTTPS, DNS resolution, REST vs WebSocket.\n\n"
                    "**Phase 4 – Apply with leverage**\n"
                    "- Don't rely only on job portals. Get referrals by contributing to open-source repos used by your target companies.\n"
                    "- Apply 90 days before your target start date. Top companies close pipelines early.\n\n"
                    "Which phase feels furthest behind right now?"
                ),
                "CEO": (
                    f"Strategically, {name}, the SDE internship game has a brutal signal problem: 2,000+ students apply to the same 10 portals.\n\n"
                    "**Your Asymmetric Edge**:\n"
                    "1. **Open-Source Contributions**: Find a popular library in Python/Go/Node that has 'good first issue' GitHub labels. Merge 2–3 meaningful PRs. Engineering managers at top companies actively track contributors.\n"
                    "2. **Cold Outreach with Signal**: On LinkedIn, message Senior Engineers at your target company with: 'I noticed issue #X in your [repo/product] — I explored a fix. Would love feedback.' A solved problem is your foot in the door.\n"
                    "3. **Build in Public**: Tweet/post your project progress weekly. Recruiters and engineers discover candidates this way.\n\n"
                    "The standard path is linear. The above path is asymmetric. Which company or domain are you targeting?"
                ),
                "Mentor": (
                    f"{name}, here's the truth no one tells you: almost every top engineer felt exactly as confused as you do right now before their breakthrough.\n\n"
                    "The confusion usually comes from **information overload** — DSA, system design, projects, internships, CGPA, hackathons, open source... all screaming at once.\n\n"
                    "**Simplify to 3 things**:\n"
                    "1. Pick ONE primary focus (most likely: DSA + 1 project).\n"
                    "2. Do 2 focused hours every morning before anything else.\n"
                    "3. Apply to 5 companies every week — don't wait until you feel 'ready'.\n\n"
                    "Consistency for 60 days beats a 14-hour panic session every time.\n\nWhat year of college are you in and what's your timeline?"
                ),
                "Chairman": (
                    f"The Board's unified SDE internship verdict for {name}:\n\n"
                    "**CTO**: Master 75 DSA patterns + build 1 deployed project with real backend architecture.\n"
                    "**CEO**: Use open-source contributions and cold outreach to bypass the applicant flood.\n"
                    "**Risk Analyst**: Apply now (not when 'ready') — top intern pipelines close 4–5 months early.\n"
                    "**Mentor**: Two focused hours every morning. Eliminate distraction before inputs.\n"
                    "**CFO**: Target companies with a stipend + return offer conversion rate >40%.\n\n"
                    "Where do you stand today on DSA and project portfolio? Let's build a week-by-week plan."
                )
            })
        return _pick(agent, {
            "CTO": f"For a full-time SDE role, the preparation ladder is: DSA → System Design (Grokking/Gaurav Sen) → Behavioral storytelling (STAR format) → Company-specific prep. Which level are you at, {name}?",
            "Chairman": f"To land a full-time SDE role, {name}: master DSA patterns first, then system design for senior/FAANG interviews, and negotiate compensation using Levels.fyi as your baseline. What's your current level and target company tier?"
        })

    # ──────────────────────────────────────────────────────────────────────
    # CAREER CONFUSION / DIRECTION
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "confused", "don't know", "dont know", "no idea", "lost", "overwhelmed", "what to do", "where to start", "help me decide", "what should i", "not sure", "unsure"):
        return _pick(agent, {
            "Mentor": (
                f"Feeling lost, {name}? That's not a weakness — it's actually a signal that you're at a real decision inflection point.\n\n"
                "Here's the reframe: confusion doesn't mean you lack intelligence. It means you have too many competing inputs and no filtering framework yet.\n\n"
                "**The 3-Question Clarity Exercise:**\n"
                "1. What is the single outcome I want most in the next **90 days**?\n"
                "2. What have I been avoiding doing because it feels uncomfortable or risky?\n"
                "3. If I fast-forward 5 years: what decision made TODAY would I be most grateful for?\n\n"
                "Answer these honestly and your path will crystallize. Want to work through them together right now?"
            ),
            "Chairman": (
                f"{name}, the Board can help, but first let's establish clarity:\n\n"
                "**Tell me the situation:**\n"
                "- Are you choosing between two specific career paths or opportunities?\n"
                "- Are you unsure how to start building toward a goal?\n"
                "- Or are you at a deeper fork — unsure what you even *want*?\n\n"
                "Each of these needs a different kind of analysis. The more specific you are, the sharper my guidance. What's the exact decision or situation on the table?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # DSA / LEETCODE / ALGORITHMS
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "dsa", "leetcode", "algorithm", "data structure", "competitive programming", "coding interview", "dynamic programming", "dp problem"):
        return _pick(agent, {
            "CTO": (
                "**The proven DSA mastery system:**\n\n"
                "**Week 1–2**: Arrays, Strings, Two Pointers, Sliding Window.\n"
                "**Week 3–4**: Linked Lists, Stacks, Queues, Monotonic Stack.\n"
                "**Week 5–6**: Binary Search (on arrays + on answer), Recursion basics.\n"
                "**Week 7–8**: Trees (BFS/DFS), Binary Search Trees, Tries.\n"
                "**Week 9–10**: Graphs (BFS/DFS/Dijkstra/Union-Find), Backtracking.\n"
                "**Week 11–12**: Dynamic Programming (1D → 2D → Intervals → Knapsack).\n\n"
                "**Resources**: NeetCode 150 + NeetCode's YouTube explanations are the gold standard. After each pattern, solve 3 variations without looking at solutions.\n\n"
                "**Key mindset shift**: Don't aim to memorize solutions. Aim to recognize the *pattern trigger* — the problem cue that tells you which approach to use.\n\n"
                "Where are you in this sequence right now?"
            ),
            "Chairman": (
                "For DSA interview prep, the CTO recommends 12 weeks of pattern-based learning (NeetCode 150) over random problem grinding. The Risk Analyst adds: practice mock interviews out loud — most candidates who fail LeetCode interviews know the solutions but can't communicate them under pressure. What's your current weak area?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # SYSTEM DESIGN
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "system design", "design interview", "scalability", "distributed system", "microservices", "api design", "database design"):
        return _pick(agent, {
            "CTO": (
                "**System Design Interview Framework:**\n\n"
                "**Step 1 – Clarify Requirements (5 min)**\n"
                "- Functional: what does the system do?\n"
                "- Non-functional: scale (users, requests/sec), latency requirements, availability (99.9% vs 99.99%)?\n\n"
                "**Step 2 – High-Level Design (10 min)**\n"
                "- Start with: Client → Load Balancer → App Servers → DB/Cache → CDN.\n"
                "- Introduce each component with justification.\n\n"
                "**Step 3 – Deep Dive (15 min)**\n"
                "- DB schema and indexing strategy.\n"
                "- Caching layer (Redis/Memcached) for read-heavy paths.\n"
                "- Message queues (Kafka/SQS) for async processing.\n"
                "- Sharding strategy for horizontal DB scaling.\n\n"
                "**Step 4 – Bottleneck Discussion**\n"
                "- Where does the system break at 10x scale? How do you fix it?\n\n"
                "**Essential Resources**: Grokking System Design (educative.io), Gaurav Sen's YouTube, ByteByteGo by Alex Xu.\n\n"
                "Which system do you want to practice designing?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # STARTUP / ENTREPRENEURSHIP
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "startup", "entrepreneurship", "founder", "building a company", "my idea", "business idea", "product idea", "launch", "mvp"):
        return _pick(agent, {
            "CEO": (
                f"Let's pressure-test your startup, {name}.\n\n"
                "**The 4 questions every startup must answer before writing code:**\n\n"
                "1. **The Hair-on-Fire Problem**: Does your target customer lose sleep over this problem? Or is it a vitamin (nice-to-have) vs aspirin (must-have)?\n"
                "2. **Market Size**: Is the Total Addressable Market >$1B? (For VC-backed startups). For bootstrapped: is there a profitable niche with <5 dominant players?\n"
                "3. **Unfair Advantage**: What gives you a moat that's hard to replicate? (Proprietary data, network effects, regulatory access, deep domain expertise?)\n"
                "4. **First 10 Customers**: Can you name 10 specific people who would pay for this today without any advertising?\n\n"
                "Tell me the problem you're solving and who your exact customer is."
            ),
            "CFO": (
                "From a capital perspective, before building:\n\n"
                "1. **Validate before you build**: Can you pre-sell the product (even a mockup) before spending engineering hours? One paid LOI (Letter of Intent) is worth 100 user surveys.\n"
                "2. **Runway math**: How many months can you operate at zero revenue? Your burn rate × 12 = the minimum cash reserve you need in the bank at all times.\n"
                "3. **Revenue model clarity**: Will you charge subscriptions (predictable MRR), usage-based (high ceiling), or transactions (marketplaces, take-rate business)? Each has drastically different investor profiles and cash flow dynamics.\n\n"
                "What's your current funding situation and monthly burn rate?"
            ),
            "Chairman": (
                f"The Board's verdict on launching a startup, {name}:\n\n"
                "**Don't build yet.** First: validate that 10 humans in your exact ICP (Ideal Customer Profile) have this pain so acutely they'd pay today. Run 20 customer discovery interviews in 2 weeks.\n"
                "Then: build the smallest possible version that proves your core value hypothesis (not a feature-complete product).\n"
                "Finally: set 90-day tripwires (revenue milestone, user milestone, or learning milestone) — if not hit, pivot without emotional attachment.\n\n"
                "What's the problem you're solving and your customer hypothesis?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # COMPENSATION / SALARY / JOB OFFER
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "salary", "compensation", "ctc", "package", "offer letter", "negotiate", "pay", "stipend", "how much should i earn"):
        return _pick(agent, {
            "CFO": (
                "**Compensation Negotiation Framework:**\n\n"
                "**Rule 1 – Always negotiate.** Research shows 70% of employers have budget flexibility. The worst they say is 'no.'\n\n"
                "**Rule 2 – Use market data as your anchor.**\n"
                "- Levels.fyi (for FAANG/product companies)\n"
                "- Glassdoor / AmbitionBox (for Indian markets)\n"
                "- LinkedIn Salary insights\n"
                "Come in with the 75th percentile number for your role and location, not median.\n\n"
                "**Rule 3 – Look at Total Compensation (TC), not just base.**\n"
                "- Base salary + signing bonus + annual bonus + equity (vested over 4 years) = TC.\n"
                "- Discount illiquid equity: early-stage startup stock at 10–20% of face value.\n\n"
                "**Rule 4 – Counter with a reason.**\n"
                "Don't just say 'I want more.' Say: 'Based on my research of market compensation for this role at [company tier], and given my [specific experience/skill], I was expecting [X]. Is there flexibility?'\n\n"
                "What offer are you evaluating and what's the current number on the table?"
            ),
            "CEO": "From a career equity standpoint: optimize your first 3 years for **learning velocity and network access**, not pure cash. A 30% lower salary at a company where you'll work directly under exceptional senior engineers will compound into 2–3x earnings differential within 5 years.",
            "Chairman": "The Board recommends: use Levels.fyi to anchor your counter-offer at the 75th percentile, negotiate TC holistically (base + bonus + equity), and never accept an offer on the spot — always ask for 48–72 hours to review."
        })

    # ──────────────────────────────────────────────────────────────────────
    # EQUITY / VESTING / ESOP
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "equity", "esop", "vesting", "stock", "option", "cliff"):
        return _pick(agent, {
            "CFO": (
                "**Equity 101 — What Every Candidate Must Know:**\n\n"
                "**Vesting Schedule**: Standard is 4 years with a 1-year cliff. This means:\n"
                "- You earn 0% if you leave before 12 months.\n"
                "- You earn 25% at the 12-month mark (the 'cliff').\n"
                "- Then monthly/quarterly vesting for the remaining 3 years.\n\n"
                "**Key Questions Before Accepting Equity:**\n"
                "1. What is the current valuation and last round price per share?\n"
                "2. What is the strike price of my options (exercise price)?\n"
                "3. Are these ISOs (better tax treatment) or NSOs?\n"
                "4. What is the post-termination exercise window — 90 days or 10 years?\n"
                "5. What are the liquidation preferences? (1x non-participating is fair; 2x+ is concerning)\n\n"
                "**Discount Rule**: Discount early-stage startup equity by 80–90% in your mental accounting until secondary market liquidity is proven.\n\n"
                "What stage is the company and what are the terms being offered?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # MENTAL HEALTH / BURNOUT / STRESS
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "stress", "anxiety", "burnout", "overwhelmed", "mental health", "depressed", "pressure", "can't sleep", "panic", "exhausted"):
        return _pick(agent, {
            "Mentor": (
                f"{name}, I want to acknowledge this properly — what you're feeling is real and valid, and it's far more common in ambitious people than anyone admits publicly.\n\n"
                "**Immediate grounding steps:**\n"
                "1. **Name it**: Say out loud or write: 'I am feeling [X] because [Y].' Naming reduces the amygdala's emotional hijack.\n"
                "2. **Triage your inputs**: List every active stressor. Circle the top 1 that matters most. The rest are noise right now.\n"
                "3. **Protect your sleep at all costs**: No screens 45 minutes before bed. Poor sleep amplifies every stressor by 3x.\n\n"
                "**Bigger picture:**\n"
                "Burnout is usually a mismatch between effort and perceived progress. Are you putting in effort without visible results? That's a system problem, not a you problem.\n\n"
                "What specifically is driving the stress right now? Let's break it down together."
            ),
            "Chairman": (
                f"{name}, the Board takes this seriously. High performance requires recovery as much as output.\n\n"
                "**Immediate priorities:**\n"
                "1. Stop adding new commitments for the next 7 days.\n"
                "2. Sleep 7–8 hours minimum — non-negotiable for cognitive performance.\n"
                "3. Schedule one complete no-work afternoon this week.\n\n"
                "Then: identify the root source of the pressure. Is it external (deadline, someone else's expectations) or internal (perfectionism, comparison)? The intervention differs.\n\nWhat's the primary stressor right now?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # LEARNING / STUDYING / COURSES
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "how to learn", "where to learn", "best course", "resource", "roadmap", "tutorial", "study", "udemy", "coursera", "youtube"):
        return _pick(agent, {
            "CTO": (
                "**Best learning resources by category (hand-curated):**\n\n"
                "**DSA & Interview Prep:**\n"
                "- NeetCode.io (best free DSA curriculum + solutions)\n"
                "- AlgoExpert or LeetCode Premium (for mocks)\n\n"
                "**System Design:**\n"
                "- ByteByteGo by Alex Xu (book + newsletter)\n"
                "- Gaurav Sen on YouTube\n"
                "- Grokking the System Design Interview (Educative)\n\n"
                "**Backend Development:**\n"
                "- The Odin Project (full-stack, free)\n"
                "- FastAPI or Django docs (Python backend)\n"
                "- Hussein Nasser on YouTube (networking + backend)\n\n"
                "**CS Fundamentals:**\n"
                "- OS: 'Operating Systems: Three Easy Pieces' (free PDF)\n"
                "- DBMS: CMU Database Systems (YouTube, free)\n"
                "- Networks: Julia Evans' 'Networking Zig Zag' or 'Computer Networking: A Top-Down Approach'\n\n"
                "**AI/ML:**\n"
                "- fast.ai (practical deep learning, free)\n"
                "- Andrew Ng's ML Specialization (Coursera)\n\n"
                "What specific area are you trying to master?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # RESUME / CV / PORTFOLIO / LINKEDIN REVIEW
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "resume", "cv", "linkedin", "portfolio", "github"):
        return _pick(agent, {
            "Chairman": (
                f"**The Board's Executive Resume & Career Audit for {name}:**\n\n"
                "**1. High-Impact Formula**:\n"
                "Every single bullet point must follow the **X-Y-Z formula**: *Accomplished [X], as measured by [Y], by doing [Z].*\n"
                "- ❌ *'Worked on frontend UI and integrated APIs'*\n"
                "- ✅ *'Architected responsive React/Vite dashboard reducing page load latency by 45% for 1,200+ daily active users'*\n\n"
                "**2. The 6-Second Recruiter Screen Test**:\n"
                "- **1 Page Hard Limit**: Eliminate generic summaries or objective statements.\n"
                "- **Top Third Rule**: Your strongest project, tech stack, and deployed live demo links must be immediately visible without scrolling.\n"
                "- **Proof-of-Work**: Link your GitHub repo, live URL, or system architecture diagram.\n\n"
                "**3. Target Alignment**:\n"
                "Tailor keywords directly from the job description for ATS (Applicant Tracking Systems).\n\n"
                "Tell me which section or specific role you're targeting, and we'll refine the exact bullet points together."
            ),
            "CEO": (
                f"**Executive Resume Strategy for {name}:**\n\n"
                "**Brutal truth**: Most resumes read like a passive job description rather than an achievement record. Recruiters hire **builders who create leverage**.\n\n"
                "**Your Power Checklist**:\n"
                "1. **Lead with Ownership**: Use active verbs (*Engineered, Deployed, Automated, Scaled*) instead of passive verbs (*Assisted, Participated, Handled*).\n"
                "2. **Quantify Everything**: Add numbers ($ saved, % speedup, latency, user count, test coverage).\n"
                "3. **Proof-of-Work**: 1 production deployed full-stack project with real database and auth beats 10 tutorial clones.\n\n"
                "Which specific company or tier are you submitting this to?"
            ),
            "CTO": (
                f"**Technical Deep-Dive Resume Audit for {name}:**\n\n"
                "**What engineering hiring managers look for:**\n"
                "- **Depth over Breadth**: Group skills into *Languages (Python/JS/Go)*, *Frameworks (React, FastAPI)*, *Databases (PostgreSQL, Redis)*, and *DevOps/Cloud (Docker, CI/CD, AWS)*. Don't list 25 languages you barely know.\n"
                "- **System Architecture**: Mention constraints solved (concurrency, indexing, caching, rate limiting, data modeling).\n"
                "- **Clean GitHub**: Ensure target repos have a clear README with architecture diagrams and API docs.\n\n"
                "Which technical stack or engineering level are you focusing on?"
            ),
            "Mentor": (
                f"**Resume & Narrative Clarity for {name}:**\n\n"
                "Your resume is not just a list of tasks — it is the story of your trajectory and problem-solving mindset.\n\n"
                "**Key Pillars**:\n"
                "1. **Clarity**: Clean single-column layout, standard fonts (Inter, Roboto), zero rating bars or fluff graphics.\n"
                "2. **Confidence**: Own your achievements. Highlight the hardest challenge you solved.\n"
                "3. **Consistency**: Ensure dates, formatting, and bullet structures match across all sections.\n\n"
                "Take a breath — you've got real value to offer. How do you feel about your current draft?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # COLLEGE / ACADEMICS / CGPA
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "cgpa", "gpa", "college", "grade", "semester", "exam", "academic", "marks", "score"):
        return _pick(agent, {
            "Mentor": (
                "CGPA matters more than many people admit, and less than some make you believe. Here's the honest picture:\n\n"
                "**Where CGPA matters:**\n"
                "- Big-4 IT companies (TCS, Infosys, Wipro) often have hard cutoffs: 6.5–7.5.\n"
                "- Top product companies (Google, Microsoft, Amazon) don't have hard CGPA filters but use it as a signal.\n"
                "- MS/PhD admissions in the US/Europe care significantly.\n\n"
                "**Where CGPA can be overcome:**\n"
                "- Strong DSA (visible via LeetCode profile/GitHub)\n"
                "- A deployed project with real users or production metrics\n"
                "- A referral from someone inside the company\n\n"
                "**The smart play:**\n"
                "If your CGPA is below 7.5, invest extra energy into the above compensators. If it's above 8.5, don't over-optimize on academics at the expense of projects and skills.\n\n"
                "What's your current CGPA situation and which companies are you targeting?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # HIGHER EDUCATION / MS / MBA
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "ms", "masters", "mba", "higher education", "phd", "gre", "gmat", "study abroad", "graduate school"):
        return _pick(agent, {
            "CFO": (
                "**MS vs Work: A Financial Framework:**\n\n"
                "**MS in the US (Computer Science):**\n"
                "- Cost: $60,000–$120,000 total (tuition + living) over 1.5–2 years\n"
                "- OPT/H1-B timeline risk: ~2–3 years to green card stability\n"
                "- ROI: Average SWE salary at US companies post-MS: $140,000–$180,000/year TC\n"
                "- Break-even point vs skipping MS: ~3–4 years of differential earnings\n\n"
                "**The CFO's verdict:**\n"
                "MS is worth it if:\n"
                "1. You're targeting research/AI/ML roles where MS is the baseline.\n"
                "2. Your target companies in India have a hard BS-only senior ceiling you've hit.\n"
                "3. You have a merit scholarship that reduces cost by >50%.\n\n"
                "MS is NOT worth it if:\n"
                "1. You want to build a startup (go build it now instead).\n"
                "2. You can get into strong companies directly.\n\n"
                "What's your motivation for the MS — skills, salary, or visa?"
            ),
            "Chairman": (
                "The Board's MS framework: it's a **$100K bet** that should only make sense if: (1) your target role requires it, (2) you have scholarship offset, or (3) you're pivoting domains (e.g. CS to AI/ML). What's driving the consideration?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # INVESTING / FINANCE / MONEY
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "invest", "stock", "mutual fund", "sip", "nifty", "sensex", "crypto", "bitcoin", "money management", "personal finance", "savings"):
        return _pick(agent, {
            "CFO": (
                "**Personal Finance Foundation (before any investing):**\n\n"
                "1. **Emergency Fund First**: 6 months of expenses in a liquid savings account (FD or liquid mutual fund). This is non-negotiable before any market investment.\n\n"
                "2. **Eliminate high-interest debt**: Credit card debt at 36% APR destroys any 12% equity return. Clear it first.\n\n"
                "**For Indian investors — The Investing Stack:**\n\n"
                "**Tier 1 – Tax-advantaged (maximize first)**:\n"
                "- EPF (employer match is a 100% instant return)\n"
                "- PPF (₹1.5L/year, 7.1% tax-free, EEE status)\n"
                "- NPS (additional ₹50K deduction under 80CCD(1B))\n\n"
                "**Tier 2 – Equity (for 5+ year horizon)**:\n"
                "- Nifty 50 or Flexi-cap Index Fund via monthly SIP\n"
                "- Avoid individual stock picking unless you're spending 10+ hours/week on research\n\n"
                "**Tier 3 – Crypto (speculation, 5% max)**:\n"
                "- Bitcoin + Ethereum only (at 5% portfolio weight max)\n"
                "- Treat as lottery tickets, not investments\n\n"
                "What's your current savings rate and investment goal timeline?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # PRODUCTIVITY / TIME MANAGEMENT
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "productivity", "time management", "procrastination", "focus", "distraction", "discipline", "habit", "morning routine", "schedule"):
        return _pick(agent, {
            "Mentor": (
                "**The Productivity System That Actually Works:**\n\n"
                "**Morning Design:**\n"
                "- First 90 minutes: zero phone, zero email. Deep work on your single most important task.\n"
                "- This one habit alone separates the top 10% from everyone else.\n\n"
                "**The 3-Item Daily List:**\n"
                "- Every night, write exactly 3 things to accomplish tomorrow. Not 10. Three.\n"
                "- Complete all 3 before anything else. Everything after that is a bonus.\n\n"
                "**The Distraction Protocol:**\n"
                "- Work in 90-minute deep focus blocks (Pomodoro is 25 min — too short for real work).\n"
                "- Phone in another room. Airplane mode or Freedom app to block social media.\n\n"
                "**On Procrastination:**\n"
                "Procrastination is almost always fear of failure or fear of judgment wearing a mask. The fix isn't willpower — it's removing friction: 'I will work on [task] at [specific time] at [specific location] for [specific duration].'\n\n"
                "What specific area are you struggling with most — starting tasks, staying focused, or following through?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # RELATIONSHIPS / SOCIAL
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "relationship", "friend", "family", "girlfriend", "boyfriend", "dating", "breakup", "social", "lonely", "people", "networking", "introvert"):
        return _pick(agent, {
            "Mentor": (
                f"{name}, this is genuinely important, and I'm glad you brought it here.\n\n"
                "Relationships and social connection are the single highest-impact variable in long-term life satisfaction — research consistently ranks them above money, status, or achievement.\n\n"
                "**On Building Relationships:**\n"
                "- The foundation is consistent, low-stakes contact — not grand gestures. A 5-minute check-in message weekly beats a 4-hour catch-up once a year.\n"
                "- Be genuinely curious about people. Ask questions you actually want answered, not performative ones.\n"
                "- Give before you ask. Share a resource, make an introduction, offer help unprompted.\n\n"
                "**On Being Introverted:**\n"
                "Introversion isn't a disadvantage — it's a different kind of strength. Introverts build deeper, higher-trust relationships. The key is to structure social energy intentionally rather than forcing shallow extroversion.\n\n"
                "What specific situation would you like to think through?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # AI / ML / DATA SCIENCE
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "artificial intelligence", "machine learning", "deep learning", "nlp", "data science", "llm", "gpt", "neural network", "model training"):
        return _pick(agent, {
            "CTO": (
                "**Breaking into AI/ML — The Practical Roadmap:**\n\n"
                "**Foundation Layer:**\n"
                "1. Python proficiency (NumPy, Pandas, Matplotlib)\n"
                "2. Linear Algebra + Statistics (Khan Academy + 3Blue1Brown)\n"
                "3. Andrew Ng's ML Specialization on Coursera (free to audit)\n\n"
                "**Applied Layer:**\n"
                "1. Deep Learning: fast.ai (top-down practical approach), then PyTorch\n"
                "2. NLP: Hugging Face Transformers course (free)\n"
                "3. LLMs: Build a simple RAG pipeline using LangChain + OpenAI API\n\n"
                "**Portfolio Layer (most neglected):**\n"
                "- Kaggle: complete 3 competitions with published notebooks\n"
                "- Build one end-to-end ML project deployed as an API (FastAPI + HuggingFace Spaces)\n\n"
                "**Current Highest-Demand Skills (2025–2026):**\n"
                "- LLM fine-tuning and RAG pipelines\n"
                "- MLOps (model deployment, monitoring, A/B testing)\n"
                "- Multimodal models (text + image + voice)\n\n"
                "Are you targeting AI as a research direction or as a software engineering application?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # QUIT JOB / TRANSITION / RISK
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "quit", "resign", "leave job", "switch job", "change job", "transition", "should i quit"):
        return _pick(agent, {
            "Risk Analyst": (
                "**Pre-Resignation Checklist — Run This Before You Quit:**\n\n"
                "1. **Liquid Runway**: Cash in bank ÷ monthly expenses ≥ 6 months (minimum). If making a startup leap, target 12 months.\n"
                "2. **Exit Triggers Written Down**: Define 3 specific, measurable conditions that would make you reverse course. Write them now, before emotions cloud your judgment post-resignation.\n"
                "3. **References Secured**: Have 3 professional references ready before you give notice. Relationships change fast post-resignation.\n"
                "4. **Non-Compete Review**: Read your employment contract. What can't you work on for 6–12 months after leaving?\n"
                "5. **Benefits Cliff**: Health insurance, PF, and gratuity — understand what you lose and when.\n\n"
                "**The hardest truth**: Most people who fail after quitting failed because of a cash crisis, not a skills crisis. Don't let that be you.\n\n"
                "What's the reason you're considering leaving, and what's your current runway?"
            ),
            "Chairman": (
                "The Board's verdict on quitting: **don't decide under emotional heat.** Wait 72 hours after any triggering event before making the decision. If the feeling persists, run the CFO's runway math and the Risk Analyst's pre-resignation checklist. Then act with full conviction. What's driving the decision right now?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # GENERAL KNOWLEDGE / CONCEPTS / EXPLANATIONS
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "what is", "how does", "explain", "tell me about", "define", "difference between", "why is", "how to"):
        topic = query.strip()
        return _pick(agent, {
            "Chairman": (
                f"Here is the breakdown on **{topic}**:\n\n"
                f"To give you the most accurate and actionable answer, tell me if you'd like a conceptual deep-dive, practical application, or strategic perspective!"
            ),
            "CTO": (
                f"Let's break down **{topic}**:\n\n"
                f"Whether you need the technical mechanics, code implementation, or architectural trade-offs — tell me your exact focus area and we'll dive right in."
            ),
            "Mentor": (
                f"Great question! On **{topic}**:\n\n"
                f"I'm here to help you understand it deeply and clearly. Which specific part would you like to explore first?"
            )
        })

    # ──────────────────────────────────────────────────────────────────────
    # NAME RECOGNITION
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "my name is", "i am", "call me", "name's"):
        extracted = query
        return (
            f"Good to meet you! I already have your profile as **{name}**, but noted.\n\n"
            f"What strategic challenge or question should we dig into, {name}?"
        )

    # ──────────────────────────────────────────────────────────────────────
    # THANK YOU / APPRECIATION
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "thank", "thanks", "appreciate", "helpful", "great", "awesome", "perfect"):
        return (
            f"Happy to help, {name}. That's exactly what the Board is for.\n\n"
            "What's the next challenge we should tackle?"
        )

    # ──────────────────────────────────────────────────────────────────────
    # NUMBERS / MATH / QUICK CALCULATIONS
    # ──────────────────────────────────────────────────────────────────────
    if _keywords(q, "calculate", "how much", "percentage", "what is the", "equal") and any(c.isdigit() for c in query):
        return (
            f"I can work through the math with you, {name}. Give me the specific numbers and what you're trying to figure out — "
            f"financial projections, runway calculations, equity valuations, or any quantitative problem — and I'll break it down step by step."
        )

    # ──────────────────────────────────────────────────────────────────────
    # DEFAULT – NATURAL HUMAN ADVISOR ADVICE
    # ──────────────────────────────────────────────────────────────────────
    default_responses = {
        "CEO": (
            f"I hear you, {name}. As your CEO Advisor, my focus is helping you gain leverage, execute with high velocity, and maximize upside.\n\n"
            "Tell me more about what you're trying to achieve or the challenge in front of you, and let's structure an actionable move forward."
        ),
        "CFO": (
            f"Understood, {name}. As your CFO Advisor, I'm here to run the numbers, assess ROI, and evaluate financial trade-offs.\n\n"
            "Give me the context or numbers behind your situation, and I'll break down the financial logic."
        ),
        "CTO": (
            f"Got it, {name}. As your CTO Advisor, I look at everything through architecture, leverage, and technical excellence.\n\n"
            "What technical challenge, skill decision, or roadmap question are you navigating?"
        ),
        "Risk Analyst": (
            f"I'm on it, {name}. As your Risk Officer, my job is to protect your downside, spot blind spots, and install safety tripwires.\n\n"
            "Tell me what path or decision you're contemplating and I'll audit the risks for you."
        ),
        "Mentor": (
            f"I'm listening, {name}. As your Mentor, I'm here to support your growth, bring clarity when things feel overwhelming, and keep you grounded.\n\n"
            "Take your time and tell me what's on your mind. How can I best help you right now?"
        ),
        "Chairman": (
            f"I'm listening, {name}.\n\n"
            "Whether you're facing a career fork, an important dilemma, or just need structured guidance — lay out what's on your mind and the Board will break it down decisively."
        )
    }

    return default_responses.get(agent, default_responses["Chairman"])


# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------

@router.post("/copilot", response_model=GlobalCopilotResponse)
async def ask_global_copilot(
    payload: GlobalCopilotRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    enforce_user_rate_limit(current_user.id, "Copilot request")
    target_agent = payload.advisor_persona or "Chairman"
    raw_query = payload.query.strip()
    user_name = current_user.full_name or "there"


    # 1. Try real LLM generation if an API key is available (custom or environment)
    custom_key = payload.api_key or settings.OPENAI_API_KEY
    if custom_key:
        llm = LLMFactory.get_llm(api_key=custom_key)
        system_prompt = f"""You are the {target_agent} on the DecisionOS Personal Board of Directors advising {user_name}.
You are extremely smart, human-level, sharp, deeply empathetic, and completely immune to being confused by unusual sentence structures, typos, or colloquial speech.

CORE BEHAVIORAL PROTOCOLS:
1. UNIVERSAL KNOWLEDGE & GENERAL INTELLIGENCE: You can answer ANY question the user asks — including everyday facts, math, science, programming, history, logic puzzles, creative writing, health, life advice, and casual banter. Never deflect general questions or force business jargon if the user is asking a general question. Answer directly, accurately, and brilliantly.
2. GIBBERISH & NONSENSE: If the user inputs gibberish (e.g. keyboard mash like 'asdfghjk', random letters, nonsense strings), respond naturally and politely: "I didn't quite understand what you mean. Could you rephrase your question or dilemma in your own words? I'm ready to help."
3. HUMAN ERROR & COGNITIVE TRAP DIAGNOSTICS: You have deep mastery of human cognitive psychology. Whenever the user is stuck or exhibiting common biases, call them out with kindness and provide a structured framework:
   - Sunk Cost Fallacy (clinging to past time/money spent)
   - Loss Aversion & Fear of Missing Out (FOMO)
   - Analysis Paralysis & Overthinking (gathering endless info without committing)
   - Status Quo Bias & Imposter Syndrome (undervaluing self-worth or fearing change)
   - Planning Fallacy & Overoptimism (underestimating execution timeline and downsides)
4. ADVISOR ROLES & TONE:
   - Chairman: Decisive, synthetic, balances trade-offs, clear actionable verdict.
   - CEO: Visionary, focuses on asymmetric upside, 10x scale, high velocity.
   - CFO: Quantitative, runway, compensation math, ROI, capital efficiency.
   - CTO: Technical excellence, architecture, scalability, tech career roadmap.
   - Risk Analyst: Rigorous pre-mortems, hidden failure modes, downside protection.
   - Mentor: Deeply empathetic, grounding, cuts through noise, life fulfillment.

Format your response in clean Markdown with bold headers and bullet points.
Always return a valid JSON object with the single key "response": {{"response": "<your markdown formatted answer>"}}"""

        history_context = ""
        if payload.history:
            history_context = "\n\nRecent Conversation History:\n"
            for h in payload.history[-6:]:
                role = "User" if h.role == "user" else f"{h.advisor or target_agent} Advisor"
                history_context += f"{role}: {h.content}\n"

        attachment_text = ""
        images_payload: List[Dict[str, str]] = []

        if payload.attachments:
            for att in payload.attachments:
                if att.file_type.startswith("image/") and att.data:
                    # Clean data if it contains base64 prefix
                    clean_data = att.data
                    if "," in clean_data:
                        clean_data = clean_data.split(",", 1)[1]
                    images_payload.append({
                        "mime_type": att.file_type,
                        "data": clean_data
                    })
                    attachment_text += f"\n[Attached Image: {att.filename}]"
                elif "pdf" in att.file_type.lower() or att.filename.lower().endswith(".pdf"):
                    pdf_text = _extract_pdf_text(att.data or "")
                    if not pdf_text:
                        pdf_text = f"[PDF Document: {att.filename}]"
                    if len(pdf_text) > 15000:
                        pdf_text = pdf_text[:15000] + "\n...[Content truncated for length]..."
                    attachment_text += f"\n\n=== ATTACHED PDF DOCUMENT: {att.filename} ===\n{pdf_text}\n=== END DOCUMENT ==="
                else:
                    content_preview = att.data or ""
                    if len(content_preview) > 15000:
                        content_preview = content_preview[:15000] + "\n...[Content truncated for length]..."
                    attachment_text += f"\n\n=== ATTACHED FILE: {att.filename} ({att.file_type}) ===\n{content_preview}\n=== END FILE ==="

        user_prompt = f"{history_context}\nUser's latest message to {target_agent}: {raw_query}{attachment_text}"

        try:
            llm_result = await llm.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                custom_api_key=custom_key,
                images=images_payload if images_payload else None
            )
            if llm_result and "response" in llm_result and len(str(llm_result["response"]).strip()) > 5:
                return GlobalCopilotResponse(
                    responder=f"{target_agent} Advisor",
                    response=str(llm_result["response"]).strip()
                )
        except Exception as e:
            logger.warning(f"Copilot LLM generation error: {e}, using heuristic engine.")

    # 2. Fallback to our deep cognitive heuristic engine
    # Check if this query or previous turn had a resume or document
    resume_mentioned = _keywords(raw_query.lower(), "resume", "cv", "file", "document", "uploaded", "see my")
    has_current_att = bool(payload.attachments)
    
    if has_current_att and not raw_query:
        att_names = ", ".join(a.filename for a in payload.attachments)
        response_text = f"I've received your attached document: **{att_names}**.\n\nFrom the **{target_agent}** perspective: I am ready to review your experience, identify high-impact improvements, or evaluate specific sections. What role or career goal are you targeting?"
    elif has_current_att and resume_mentioned:
        att_names = ", ".join(a.filename for a in payload.attachments)
        base_ans = answer(target_agent, "resume", user_name, payload.history or [])
        response_text = f"**Document Received:** `{att_names}`\n\n{base_ans}"
    elif has_current_att:
        att_names = ", ".join(a.filename for a in payload.attachments)
        base_ans = answer(target_agent, raw_query, user_name, payload.history or [])
        response_text = f"**Document Received:** `{att_names}`\n\n{base_ans}"
    elif resume_mentioned:
        # User asking about previously uploaded resume or general resume review
        base_ans = answer(target_agent, "resume", user_name, payload.history or [])
        response_text = f"Yes, {user_name}! I can see and analyze your resume materials.\n\n{base_ans}"
    else:
        response_text = answer(target_agent, raw_query, user_name, payload.history or [])

    return GlobalCopilotResponse(
        responder=f"{target_agent} Advisor",
        response=response_text
    )



@router.post("/{decision_id}/ask", response_model=InteractiveChatResponse)
async def ask_board_member(
    decision_id: str,
    payload: InteractiveChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Decision)
        .options(
            selectinload(Decision.options),
            selectinload(Decision.report).selectinload(DecisionReport.deliberations)
        )
        .filter(Decision.id == decision_id, Decision.user_id == current_user.id)
    )
    decision = res.scalars().first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    target_agent = payload.agent_name or "Chairman"

    # Contextual decision-aware response
    context_prefix = (
        f"Regarding the decision '{decision.title}': "
    )
    combined_query = context_prefix + payload.question

    response_text = answer(
        target_agent,
        combined_query,
        current_user.full_name or "there",
        []
    )

    return InteractiveChatResponse(
        responder=f"{target_agent} ({'Whole Board' if target_agent == 'Chairman' else 'Advisor'})",
        response=response_text
    )
