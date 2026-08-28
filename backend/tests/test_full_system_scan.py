import httpx
import uuid
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_system_scan():
    print("=" * 60)
    print("DECISIONOS COMPREHENSIVE END-TO-END SYSTEM SCAN")
    print("=" * 60)

    client = httpx.Client(base_url=BASE_URL, timeout=30.0)
    results = []

    def record(name: str, passed: bool, details: str = ""):
        icon = "[PASS]" if passed else "[FAIL]"
        print(f"{icon} {name} {f'-> {details}' if details else ''}")
        results.append((name, passed, details))


    # 1. Health Check
    try:
        r = client.get("/health")
        record("System Health Check", r.status_code == 200, f"Status: {r.status_code}")
    except Exception as e:
        record("System Health Check", False, str(e))

    # 2. Authentication & User Creation
    test_user_email = f"audit_{uuid.uuid4().hex[:8]}@decisionos.ai"
    test_user_pass = "SecurePass123!"
    auth_token = None

    try:
        reg_r = client.post("/auth/register", json={
            "email": test_user_email,
            "password": test_user_pass,
            "full_name": "Utkarsh Rai"
        })
        passed = reg_r.status_code in [200, 201]
        auth_token = reg_r.json().get("access_token")
        record("User Registration", passed, f"Token: {auth_token[:15]}...")
    except Exception as e:
        record("User Registration", False, str(e))

    headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else {}

    # 3. Auth Me & Profile
    try:
        me_r = client.get("/auth/me", headers=headers)
        record("Get Auth User (/auth/me)", me_r.status_code == 200, f"User: {me_r.json().get('full_name')}")
    except Exception as e:
        record("Get Auth User (/auth/me)", False, str(e))

    try:
        prof_r = client.get("/users/profile", headers=headers)
        record("Get User Profile (/users/profile)", prof_r.status_code == 200)
    except Exception as e:
        record("Get User Profile (/users/profile)", False, str(e))

    # 4. Create Decision
    decision_id = None
    try:
        dec_r = client.post("/decisions", headers=headers, json={
            "title": "Accept Seed Funding vs Bootstrap SaaS",
            "description": "We have an offer for $500k at $4M post-money from an angel syndicate versus continuing to bootstrap at $8k MRR with 40% monthly growth.",
            "category": "Startup",
            "urgency": "Medium",
            "risk_tolerance": "moderate",
            "constraints": {"runway": "12 months"},
            "options": [
                {"label": "Accept seed funding", "description": "Raise $500k from the angel syndicate."},
                {"label": "Continue bootstrapping", "description": "Keep growing from current revenue."}
            ]
        })
        passed = dec_r.status_code in [200, 201]
        decision_id = dec_r.json().get("id")
        record("Create Strategic Decision", passed, f"Decision ID: {decision_id}")
    except Exception as e:
        record("Create Strategic Decision", False, str(e))

    # 5. Deliberate Decision (Multi-Agent Debate)
    if decision_id:
        try:
            delib_r = client.post(f"/decisions/{decision_id}/deliberate", headers=headers)
            passed = delib_r.status_code == 200
            data = delib_r.json()
            record("Multi-Agent Deliberation (/deliberate)", passed, f"Status: {data.get('status')}")
        except Exception as e:
            record("Multi-Agent Deliberation (/deliberate)", False, str(e))

    # 6. Retrieve Decision Report
    if decision_id:
        try:
            rep_r = client.get(f"/decisions/{decision_id}/report", headers=headers)
            passed = rep_r.status_code == 200
            data = rep_r.json()
            verdict = data.get("strategic_verdict", "")[:80]
            record("Get Synthesis Report (/report)", passed, f"Verdict: {verdict}...")
        except Exception as e:
            record("Get Synthesis Report (/report)", False, str(e))

    # 7. Interactive Decision Ask
    if decision_id:
        try:
            ask_r = client.post(f"/boardroom/{decision_id}/ask", headers=headers, json={
                "agent_name": "CFO",
                "question": "What is our dilution from taking this $500k check?"
            })
            passed = ask_r.status_code == 200
            record("Boardroom Interactive Ask (/boardroom/{id}/ask)", passed)
        except Exception as e:
            record("Boardroom Interactive Ask (/boardroom/{id}/ask)", False, str(e))

    # 8. Record Decision Outcome
    if decision_id:
        try:
            out_r = client.post(f"/decisions/{decision_id}/outcome", headers=headers, json={
                "actual_choice": "Accept seed funding",
                "follow_up_period": "3_months",
                "satisfaction_score": 9,
                "actual_outcome_description": "Accepted terms at $4.5M valuation; closed within 30 days.",
                "lessons_learned": "Negotiating valuation cap early gave 15% better founder retention."
            })
            passed = out_r.status_code in [200, 201]
            record("Record Decision Outcome (/outcome)", passed)
        except Exception as e:
            record("Record Decision Outcome (/outcome)", False, str(e))

    # 9. Memory Vault & Semantic Search
    try:
        vault_r = client.get("/memory/vault", headers=headers)
        passed = vault_r.status_code == 200
        items = len(vault_r.json()) if vault_r.status_code == 200 else 0
        record("Memory Vault Index (/memory/vault)", passed, f"Indexed Items: {items}")
    except Exception as e:
        record("Memory Vault Index (/memory/vault)", False, str(e))

    try:
        search_r = client.post("/memory/search", headers=headers, json={"query": "fundraising equity"})
        passed = search_r.status_code == 200
        record("Memory Semantic Search (/memory/search)", passed)
    except Exception as e:
        record("Memory Semantic Search (/memory/search)", False, str(e))

    # 10. Global Copilot (Math, Geography, Persona, Attachments)
    copilot_tests = [
        ("Math Calculation", "what is 100 * 25", "Chairman", lambda r: "2,500" in r or "2500" in r),
        ("World Geography", "what is the capital of india?", "Chairman", lambda r: "New Delhi" in r),
        ("Science Fact", "what is the speed of light?", "CTO", lambda r: "299,792,458" in r),
        ("Cognitive Bias Diagnostic", "i spent 3 years on this project and invested 20k, should i quit?", "CFO", lambda r: "sunk" in r.lower() or "return" in r.lower()),
        ("Gibberish Filter", "asdfghjkl12345", "CEO", lambda r: "rephrase" in r.lower() or "sense" in r.lower() or "understand" in r.lower())
    ]

    for label, query, advisor, validator in copilot_tests:
        try:
            c_r = client.post("/boardroom/copilot", headers=headers, json={
                "query": query,
                "advisor_persona": advisor
            })
            passed = c_r.status_code == 200 and validator(c_r.json().get("response", ""))
            record(f"Copilot: {label}", passed, f"Resp: {c_r.json().get('response', '')[:70].replace(chr(10), ' ')}")
        except Exception as e:
            record(f"Copilot: {label}", False, str(e))

    print("\n" + "=" * 60)
    passed_cnt = sum(1 for _, p, _ in results if p)
    print(f"SCAN COMPLETE: {passed_cnt}/{len(results)} TESTS PASSED ({passed_cnt/len(results)*100:.1f}%)")
    print("=" * 60)

if __name__ == "__main__":
    run_system_scan()
