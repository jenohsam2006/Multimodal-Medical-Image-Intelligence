import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base, SessionLocal
from backend.models import AnalysisRecord
from backend.demo_cases import DEMO_CASES, get_demo_case_image
from backend.quality_engine import assess_image_quality, decode_base64_image
from backend.vision_engine import detect_visual_findings
from backend.reasoning_engine import synthesize_multimodal_reasoning
from backend.validation_engine import validate_evidence_and_suppress_hallucinations
from backend.schemas import ClinicalNotesInput, PatientInfo

def test_pipeline():
    print("Testing MedVision AI Pipeline...")
    Base.metadata.create_all(bind=engine)
    
    # 1. Test Demo Case 1 (Pneumonia)
    case = DEMO_CASES[0]
    print(f"Loading Case 1: {case['title']}")
    img_b64 = get_demo_case_image(case["id"])
    assert img_b64.startswith("data:image/png;base64,"), "Invalid image format"
    
    img = decode_base64_image(img_b64)
    assert img.size == (512, 512), f"Unexpected size {img.size}"
    
    # Quality check
    iq = assess_image_quality(img)
    print(f"Quality Score: {iq.score}, Status: {iq.status}, Sharpness: {iq.sharpness}")
    assert iq.score >= 70, "Case 1 should be diagnostic quality"
    
    # Vision
    c_notes = ClinicalNotesInput(**case["clinical_notes"])
    p_info = PatientInfo(**case["patient"])
    findings, heatmap_b64 = detect_visual_findings(
        img, demo_case_id=case["id"],
        clinical_keywords=c_notes.symptoms
    )
    print(f"Detected {len(findings)} visual findings. Heatmap generated: {bool(heatmap_b64)}")
    assert len(findings) > 0, "Should detect at least 1 finding"
    assert findings[0].box is not None, "Finding should have bounding box"
    
    # Validation
    val_findings, ev_val = validate_evidence_and_suppress_hallucinations(findings, iq, c_notes)
    print(f"Validated findings: {len(val_findings)}, Suppressed: {ev_val.suppressed_findings_count}")
    assert len(val_findings) > 0, "Should validate primary finding"
    
    # Reasoning
    reasoning = synthesize_multimodal_reasoning(p_info, c_notes, val_findings)
    print(f"Multimodal Reasoning Steps: {len(reasoning.steps)}")
    print(f"Summary: {reasoning.summary[:80]}...")
    assert len(reasoning.steps) >= 2, "Reasoning steps should be generated"
    
    # 2. Test Demo Case 6 (Poor quality / motion blur)
    case_poor = DEMO_CASES[5]
    print(f"\nLoading Poor Quality Case: {case_poor['title']}")
    img_poor_b64 = get_demo_case_image(case_poor["id"])
    img_poor = decode_base64_image(img_poor_b64)
    iq_poor = assess_image_quality(img_poor)
    print(f"Poor Quality Score: {iq_poor.score}, Status: {iq_poor.status}, Warnings: {iq_poor.warnings}")
    assert iq_poor.is_poor_quality or iq_poor.score < 50, "Should detect degraded quality"
    
    print("\nALL BACKEND PIPELINE TESTS PASSED!")

if __name__ == "__main__":
    test_pipeline()
