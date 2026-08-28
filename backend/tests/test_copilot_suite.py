import httpx
import json

def run_tests():
    base_url = "http://127.0.0.1:8000/api/boardroom/copilot"

    test_cases = [
        ("Chairman", "hello there!"),
        ("CEO", "asdfghjkl12345"),
        ("Mentor", "i dont feel well today, feeling burned out"),
        ("Chairman", "why are you not able to understand me?"),
        ("CFO", "i spent 3 years on this project and invested 20k, should i quit?"),
        ("CEO", "i am overthinking and paralyzed by too many choices"),
        ("CTO", "how do i prepare for SDE internship in 60 days?"),
        ("CTO", "PostgreSQL vs MongoDB for high write scale"),
        ("CFO", "calculate 120k cash vs 90k + 0.5% equity with 5M valuation"),
        ("Risk Analyst", "i want to quit my job tomorrow and do crypto trading"),
        ("Chairman", "what do you think about my resume?"),
        ("Mentor", "what if I fail and everyone laughs at me?"),
        ("CEO", "how to validate a B2B SaaS without coding?"),
        ("CTO", "tell me how to install 90-day tripwires"),
        ("Chairman", "give me a decisive verdict on startup vs big tech")
    ]

    results = []
    for advisor, q in test_cases:
        try:
            r = httpx.post(base_url, json={"query": q, "advisor_persona": advisor}, timeout=10.0)
            if r.status_code == 200:
                data = r.json()
                resp = data.get("response", "")
                responder = data.get("responder", "")
                is_valid = len(resp.strip()) > 20 and not resp.startswith("The Board is ready to engage fully on")
                results.append({
                    "advisor": advisor,
                    "query": q,
                    "status": r.status_code,
                    "responder": responder,
                    "valid": is_valid,
                    "sample": resp[:120].replace("\n", " ")
                })
            else:
                results.append({"advisor": advisor, "query": q, "status": r.status_code, "valid": False, "error": r.text})
        except Exception as e:
            results.append({"advisor": advisor, "query": q, "status": "ERR", "valid": False, "error": str(e)})

    print(f"\n==========================================")
    print(f"TOTAL TESTS: {len(results)}")
    passed = sum(1 for res in results if res.get("valid"))
    print(f"PASSED: {passed}/{len(results)}")
    print(f"==========================================\n")
    for idx, res in enumerate(results, 1):
        status_icon = "PASS" if res["valid"] else "FAIL"
        print(f"[{idx}] {status_icon} | {res['advisor']} | '{res['query']}'")
        if res.get("valid"):
            print(f"    Responder: {res.get('responder')}")
            print(f"    Sample: {res.get('sample')}\n")
        else:
            print(f"    ERROR: {res.get('error')}\n")

if __name__ == "__main__":
    run_tests()
