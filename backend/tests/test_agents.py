import pytest
from app.agents.analyzer_agent import DecisionAnalyzerAgent
from app.agents.ceo_agent import CEOAgent
from app.agents.cfo_agent import CFOAgent
from app.agents.cto_agent import CTOAgent
from app.agents.risk_agent import RiskAnalystAgent
from app.agents.mentor_agent import MentorAgent
from app.agents.chairman_agent import ChairmanAgent

@pytest.mark.asyncio
async def test_all_board_agents_deliberation():
    sample_decision = {
        "title": "Should I leave Big Tech for a Series A AI Startup?",
        "description": "Offer from seed-funded AI lab with 1.5% equity vs senior engineer role at Big Tech.",
        "category": "Career & Business",
        "urgency": "High",
        "timeline": "2 weeks",
        "risk_tolerance": "moderate",
        "constraints": {"minimum_base_salary": "$180k", "runway": "12 months"},
        "options": [
            {
                "label": "Option A: Join Series A AI Startup",
                "description": "Lead AI platform engineering with 1.5% equity grant.",
                "pros": ["Massive learning velocity", "High equity upside"],
                "cons": ["Runway risk", "Higher working hours"]
            },
            {
                "label": "Option B: Stay at Big Tech",
                "description": "Maintain senior engineering role with predictable RSU vesting.",
                "pros": ["High stability", "Good work life balance"],
                "cons": ["Slower skill compounding", "Bureaucracy"]
            }
        ]
    }
    
    sample_profile = {
        "current_role": "Senior Software Engineer",
        "career_goals": "Become VP of AI Engineering or Founder",
        "financial_runway_months": "12 months",
        "core_values": ["Skill Compounding", "Autonomy", "High Agency"]
    }

    # 1. Analyzer
    analyzer = DecisionAnalyzerAgent()
    analysis = await analyzer.analyze(sample_decision, sample_profile)
    assert "core_dilemma" in analysis
    assert "evaluation_criteria" in analysis

    # 2. CEO
    ceo = CEOAgent()
    ceo_res = await ceo.analyze(sample_decision, sample_profile)
    assert "recommended_option" in ceo_res
    assert ceo_res["perspective_score"] > 0

    # 3. CFO
    cfo = CFOAgent()
    cfo_res = await cfo.analyze(sample_decision, sample_profile)
    assert "recommended_option" in cfo_res
    assert len(cfo_res["top_priorities"]) > 0

    # 4. CTO
    cto = CTOAgent()
    cto_res = await cto.analyze(sample_decision, sample_profile)
    assert "recommended_option" in cto_res
    assert "analysis" in cto_res

    # 5. Risk Analyst
    risk = RiskAnalystAgent()
    risk_res = await risk.analyze(sample_decision, sample_profile)
    assert "risk_matrix" in risk_res or "concerns" in risk_res

    # 6. Mentor
    mentor = MentorAgent()
    mentor_res = await mentor.analyze(sample_decision, sample_profile)
    assert "memory_reflection" in mentor_res or "analysis" in mentor_res

    # 7. Chairman Synthesis
    opinions = {
        "CEO": ceo_res,
        "CFO": cfo_res,
        "CTO": cto_res,
        "Risk Analyst": risk_res,
        "Mentor": mentor_res
    }
    chairman = ChairmanAgent()
    chairman_res = await chairman.analyze(sample_decision, sample_profile, other_opinions=opinions)
    assert "recommended_option" in chairman_res
    assert "confidence_score" in chairman_res
    assert "action_plan_steps" in chairman_res
