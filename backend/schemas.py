from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ImageQualityResult(BaseModel):
    score: int = Field(..., description="Quality score 0-100")
    status: str = Field(..., description="Diagnostic Quality, Borderline / Degraded, Non-Diagnostic")
    sharpness: float = Field(..., description="Laplacian variance sharpness metric")
    contrast: float = Field(..., description="Contrast dynamic range score")
    brightness_mean: float = Field(..., description="Mean pixel luminance 0-255")
    resolution: str = Field(..., description="e.g. 1024x1024")
    warnings: List[str] = Field(default_factory=list)
    is_poor_quality: bool = False
    recommendation: str = ""

class BoundingBox(BaseModel):
    ymin: float = Field(..., description="Normalized 0 to 1")
    xmin: float = Field(..., description="Normalized 0 to 1")
    ymax: float = Field(..., description="Normalized 0 to 1")
    xmax: float = Field(..., description="Normalized 0 to 1")

class SegmentationPolygon(BaseModel):
    points: List[List[float]] = Field(default_factory=list, description="Array of [x, y] coordinates in 0-1 space")

class Finding(BaseModel):
    id: str
    finding_name: str
    location: str
    confidence: float
    severity: str = "Moderate"  # Mild, Moderate, Severe, Normal
    box: Optional[BoundingBox] = None
    mask: Optional[SegmentationPolygon] = None
    visual_evidence: str
    clinical_evidence: str
    status: str = "Validated"  # Validated, Flagged for Review, Suppressed
    color: str = "#ef4444"

class MultimodalStep(BaseModel):
    step_number: int
    title: str
    description: str
    visual_cues: List[str] = Field(default_factory=list)
    clinical_cues: List[str] = Field(default_factory=list)
    confidence_impact: str

class MultimodalReasoning(BaseModel):
    summary: str
    steps: List[MultimodalStep] = Field(default_factory=list)
    differential_diagnosis: List[Dict[str, Any]] = Field(default_factory=list)
    cross_modal_alignment_score: float

class ValidationCheck(BaseModel):
    finding_name: str
    status: str  # VALIDATED, FLAGGED, SUPPRESSED
    visual_score: float
    clinical_score: float
    verdict_reason: str
    mitigation: Optional[str] = None

class EvidenceValidation(BaseModel):
    overall_trust_score: float
    validated_findings_count: int
    suppressed_findings_count: int
    checks: List[ValidationCheck] = Field(default_factory=list)
    hallucination_risk_level: str = "Low"  # Low, Medium, High

class DoctorReviewData(BaseModel):
    status: str = "Pending Review"  # Pending Review, Approved, Modified, Rejected
    doctor_name: Optional[str] = None
    doctor_title: Optional[str] = None
    reviewed_at: Optional[str] = None
    agreed_findings: List[str] = Field(default_factory=list)
    disagreed_findings: List[str] = Field(default_factory=list)
    clinical_impression: Optional[str] = None
    recommendations: Optional[str] = None
    doctor_signature: Optional[str] = None

class PatientInfo(BaseModel):
    patient_id: str = "PT-UNKNOWN"
    name: str = "Anonymous Patient"
    age: Optional[int] = 0
    gender: str = "Unspecified"
    modality: str = "Chest X-Ray (PA View)"

class ClinicalNotesInput(BaseModel):
    history: str = ""
    symptoms: List[str] = Field(default_factory=list)
    vitals: Dict[str, Any] = Field(default_factory=dict)
    labs: Dict[str, Any] = Field(default_factory=dict)

class AnalyzeRequest(BaseModel):
    image_base64: str
    patient: PatientInfo
    clinical_notes: ClinicalNotesInput
    demo_case_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    created_at: str
    patient: PatientInfo
    clinical_notes: ClinicalNotesInput
    image_quality: ImageQualityResult
    findings: List[Finding]
    multimodal_reasoning: MultimodalReasoning
    evidence_validation: EvidenceValidation
    doctor_review: DoctorReviewData
    image_data: str
    heatmap_data: str
    is_simulated: bool = True
    clinical_disclaimer: str

class SaveReviewRequest(BaseModel):
    analysis_id: str
    doctor_review: DoctorReviewData
