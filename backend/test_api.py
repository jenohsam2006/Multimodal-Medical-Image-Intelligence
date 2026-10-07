import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing API endpoints...")
    # Health
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("GET /api/health OK")

    # Demo cases
    r = client.get("/api/demo-cases")
    assert r.status_code == 200, f"Demo cases failed: {r.text}"
    cases = r.json()["demo_cases"]
    print(f"GET /api/demo-cases OK ({len(cases)} cases)")

    # Model info
    r = client.get("/api/model-info")
    assert r.status_code == 200
    print("GET /api/model-info OK")

    # Statistics
    r = client.get("/api/statistics")
    assert r.status_code == 200
    print(f"GET /api/statistics OK (total_cases: {r.json()['total_cases']})")

    # Analyses list
    r = client.get("/api/analyses")
    assert r.status_code == 200
    print(f"GET /api/analyses OK (found {r.json()['total']} records)")

    # Test Analyze endpoint with Case 2
    case_2 = cases[1]
    payload = {
        "image_base64": case_2["image_data"],
        "patient": case_2["patient"],
        "clinical_notes": case_2["clinical_notes"],
        "demo_case_id": case_2["id"]
    }
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 200, f"Analyze failed: {r.text}"
    analysis = r.json()
    print(f"POST /api/analyze OK (id: {analysis['id']}, findings: {len(analysis['findings'])})")

    # Save doctor review
    review_payload = {
        "analysis_id": analysis["id"],
        "doctor_review": {
            "status": "Approved",
            "doctor_name": "Dr. Sarah Lin, MD",
            "doctor_title": "Radiology Fellow",
            "reviewed_at": "2026-10-07 11:45:00 UTC",
            "agreed_findings": [f["finding_name"] for f in analysis["findings"]],
            "disagreed_findings": [],
            "clinical_impression": "Approved automated findings.",
            "recommendations": "Follow up in 4 weeks.",
            "doctor_signature": "S. Lin, MD"
        }
    }
    r = client.post("/api/save-review", json=review_payload)
    assert r.status_code == 200, f"Save review failed: {r.text}"
    print("POST /api/save-review OK")

    print("\nALL API ENDPOINTS TESTED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
