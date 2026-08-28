import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_decision_lifecycle(async_client: AsyncClient):
    # 1. Register user
    reg = await async_client.post("/api/auth/register", json={
        "email": "director@decisionos.ai",
        "password": "Password123!",
        "full_name": "Sarah Connor",
        "current_role": "Director of Product",
        "career_goals": "Build a category-defining company"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Decision
    decision_payload = {
        "title": "Should I accept the Chief AI Officer role at a HealthTech Series B?",
        "description": "Leading product & AI strategy with $220k base + 2.0% equity grant vs staying VP Product.",
        "category": "Career & Business",
        "urgency": "High",
        "timeline": "Within 14 days",
        "risk_tolerance": "moderate",
        "constraints": {"location": "San Francisco / Hybrid", "min_runway": "9 months"},
        "primary_goal": "Maximize long-term equity and technical leadership",
        "options": [
            {
                "label": "Option A: Accept Chief AI Officer Offer",
                "description": "Assume full product & AI tech leadership at Series B startup.",
                "pros": ["Direct board exposure", "Significant equity upside"],
                "cons": ["Healthcare regulatory hurdles", "Intense velocity demands"]
            },
            {
                "label": "Option B: Decline and Remain VP Product",
                "description": "Continue steady enterprise leadership track.",
                "pros": ["Predictable compensation", "Established team"],
                "cons": ["Slower decision speed", "Limited upside"]
            }
        ]
    }
    create_res = await async_client.post("/api/decisions", json=decision_payload, headers=headers)
    assert create_res.status_code == 201
    decision_id = create_res.json()["id"]

    # 3. Trigger AI Board Meeting Deliberation (LangGraph execution)
    delib_res = await async_client.post(f"/api/decisions/{decision_id}/deliberate", headers=headers)
    assert delib_res.status_code == 200
    report = delib_res.json()
    assert "recommended_option" in report
    assert "confidence_score" in report
    assert len(report["deliberations"]) == 5  # CEO, CFO, CTO, Risk Analyst, Mentor
    assert len(report["debate_turns"]) > 0    # Multi-agent debate transcript

    # 4. Interactive explainability Q&A ("Ask the CFO")
    qa_res = await async_client.post(
        f"/api/boardroom/{decision_id}/ask",
        json={"agent_name": "CFO", "question": "Why should I trust the equity valuation given market volatility?"},
        headers=headers
    )
    assert qa_res.status_code == 200
    assert "response" in qa_res.json()

    # 5. Record Retrospective Outcome & Index into Vector Store
    outcome_payload = {
        "actual_choice": "Option A: Accept Chief AI Officer Offer",
        "follow_up_period": "3_months",
        "satisfaction_score": 9,
        "actual_outcome_description": "Onboarded successfully, closed first enterprise pilot, and accelerated team shipping cadence by 2x.",
        "lessons_learned": "Betting on high-agency roles with clear equity upside creates unprecedented energy and focus."
    }
    outcome_res = await async_client.post(f"/api/decisions/{decision_id}/outcome", json=outcome_payload, headers=headers)
    assert outcome_res.status_code == 200
    assert outcome_res.json()["satisfaction_score"] == 9
