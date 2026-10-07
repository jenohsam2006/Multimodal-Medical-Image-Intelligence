from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from .database import Base

class AnalysisRecord(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    patient_id = Column(String, index=True)
    patient_name = Column(String)
    patient_age = Column(Integer)
    patient_gender = Column(String)
    modality = Column(String, default="Chest X-Ray (PA View)")
    clinical_notes = Column(Text, default="")
    vitals_json = Column(Text, default="{}")
    labs_json = Column(Text, default="{}")
    image_quality_json = Column(Text, default="{}")
    findings_json = Column(Text, default="[]")
    multimodal_reasoning_json = Column(Text, default="{}")
    evidence_validation_json = Column(Text, default="{}")
    doctor_review_json = Column(Text, default="{}")
    status = Column(String, default="Pending Review", index=True)
    image_data = Column(Text, default="")
    heatmap_data = Column(Text, default="")
