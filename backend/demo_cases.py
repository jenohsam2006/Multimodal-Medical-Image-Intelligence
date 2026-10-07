import io
import base64
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from typing import Dict, Any, List

def create_synthetic_radiograph(
    pathology: str = "normal",
    blur_amount: float = 0.0,
    low_res: bool = False
) -> str:
    """
    Synthesizes a realistic 512x512 chest radiograph silhouette with anatomical
    landmarks (ribs, mediastinum, diaphragm, clavicles) and pathology-specific opacities.
    """
    width, height = (256, 256) if low_res else (512, 512)
    # Background: dark radiographic cassette
    img = Image.new("L", (width, height), color=18)
    draw = ImageDraw.Draw(img)

    # 1. Soft tissue thoracic cage exterior boundary (medium dark)
    draw.rounded_rectangle([25, 20, width - 25, height - 20], radius=40, fill=35)

    # 2. Bilateral Lung Fields (Radiolucent dark zones)
    # Left hemithorax (radiological right: screen left)
    draw.ellipse([50, 70, 230, 420], fill=12)
    # Right hemithorax (radiological left: screen right)
    draw.ellipse([width - 230, 70, width - 50, 420], fill=12)

    # 3. Mediastinum & Spine (Radiopaque light central zone)
    draw.rectangle([width // 2 - 40, 20, width // 2 + 40, height - 20], fill=140)
    # Trachea air column (dark vertical band in midline)
    draw.rectangle([width // 2 - 8, 40, width // 2 + 8, 170], fill=45)

    # 4. Cardiac Silhouette
    if pathology == "cardiomegaly":
        # Enlarged cardiac silhouette (CTR ~ 0.64)
        draw.ellipse([width // 2 - 110, 210, width // 2 + 150, 430], fill=165)
    else:
        # Normal cardiac silhouette (CTR ~ 0.44)
        draw.ellipse([width // 2 - 50, 240, width // 2 + 90, 420], fill=160)

    # Aortic knuckle (upper left mediastinum)
    draw.ellipse([width // 2 + 10, 160, width // 2 + 55, 215], fill=150)

    # 5. Diaphragmatic Hemidomes
    # Right dome (higher)
    draw.pieslice([40, 340, 250, 470], 180, 360, fill=135)
    # Left dome (lower)
    draw.pieslice([width - 250, 360, width - 40, 490], 180, 360, fill=135)

    # 6. Clavicles (horizontal bands across apices)
    draw.polygon([(40, 95), (200, 125), (200, 140), (40, 110)], fill=155)
    draw.polygon([(width - 40, 95), (width - 200, 125), (width - 200, 140), (width - 40, 110)], fill=155)

    # 7. Posterior & Anterior Ribs (arched subtle bone densities)
    for i in range(7):
        y_off = 110 + i * 42
        # Left ribs
        draw.arc([30, y_off - 35, 240, y_off + 35], start=190, end=350, fill=75, width=4)
        # Right ribs
        draw.arc([width - 240, y_off - 35, width - 30, y_off + 35], start=190, end=350, fill=75, width=4)

    # 8. Bronchovascular markings (normal hilar arborization)
    for i in range(5):
        draw.line([(width // 2 - 35, 210 + i * 15), (100 + i * 15, 260 + i * 20)], fill=45, width=2)
        draw.line([(width // 2 + 35, 210 + i * 15), (width - 100 - i * 15, 260 + i * 20)], fill=45, width=2)

    # 9. Pathology-specific Alterations
    if pathology == "pneumonia":
        # Dense alveolar consolidation in Right Lower Lobe (screen right basilar)
        # Positive silhouette sign obscuring hemidiaphragm
        cx, cy = int(width * 0.68), int(height * 0.66)
        draw.ellipse([cx - 70, cy - 60, cx + 70, cy + 65], fill=125)
        # Air bronchograms (dark linear streaks through dense opacity)
        draw.line([(cx - 15, cy - 40), (cx + 10, cy + 20)], fill=45, width=3)
        draw.line([(cx + 5, cy - 10), (cx + 25, cy + 30)], fill=45, width=2)

    elif pathology == "pneumothorax":
        # Right apical/lateral pneumothorax (screen right)
        # Visceral pleural line with complete avascular hyperlucency laterally
        px = int(width * 0.74)
        # Hyperlucent black pocket
        draw.polygon([(px, 90), (width - 55, 120), (width - 60, 360), (px + 10, 340)], fill=4)
        # Crisp pleural margin line
        draw.line([(px, 90), (px + 10, 340)], fill=180, width=2)

    elif pathology == "nodule":
        # Solitary 18mm dense nodule with subtle spiculation in Left Upper Lobe (screen left)
        nx, ny = int(width * 0.32), int(height * 0.36)
        draw.ellipse([nx - 18, ny - 18, nx + 18, ny + 18], fill=165)
        # Spiculations
        for angle in np.linspace(0, 2 * np.pi, 8, endpoint=False):
            ex = nx + int(24 * np.cos(angle))
            ey = ny + int(24 * np.sin(angle))
            draw.line([(nx, ny), (ex, ey)], fill=135, width=2)

    # 10. Subtle Gaussian smoothing to replicate anatomical tissue scattering
    img = img.filter(ImageFilter.GaussianBlur(radius=1.8))

    # 11. Add realistic radiographic quantum mottle (Poisson/Gaussian noise)
    arr = np.array(img, dtype=np.float32)
    noise = np.random.normal(0, 5.5, arr.shape)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)

    # Apply deliberate motion blur or low quality if requested
    if blur_amount > 0:
        # Severe horizontal motion blur simulating respiratory patient motion
        for _ in range(int(blur_amount)):
            img = img.filter(ImageFilter.BoxBlur(radius=8))

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

# Curated benchmark clinical cases
DEMO_CASES: List[Dict[str, Any]] = [
    {
        "id": "case_pneumonia",
        "title": "Case #1: Acute Lobar Pneumonia",
        "category": "Infectious Disease / Pulmonology",
        "difficulty": "Moderate",
        "modality": "Chest X-Ray (PA View)",
        "patient": {
            "patient_id": "PT-78219",
            "name": "Eleanor Vance",
            "age": 64,
            "gender": "Female",
            "modality": "Chest X-Ray (PA View)"
        },
        "clinical_notes": {
            "history": "64-year-old female presents with 4-day history of worsening productive cough with rusty sputum, acute right-sided pleuritic chest pain, rigors, and subjective breathlessness.",
            "symptoms": ["High-grade Fever", "Productive Cough", "Right Pleuritic Pain", "Dyspnea on exertion"],
            "vitals": {
                "temperature": "39.2°C",
                "blood_pressure": "112/68 mmHg",
                "heart_rate": "104 bpm",
                "respiratory_rate": "24 breaths/min",
                "spo2": "91% room air"
            },
            "labs": {
                "wbc": "15.4 x10^9/L (Neutrophils 86%)",
                "crp": "82 mg/L (High)",
                "procalcitonin": "1.8 ng/mL (High)",
                "bnp": "48 pg/mL (Normal)"
            }
        },
        "expected_finding": "Right Lower Lobe Consolidation (Lobar Pneumonia)",
        "clinical_pearl": "Air bronchograms within the consolidation confirm alveolar airspace filling rather than collapse or pleural fluid.",
        "pathology_type": "pneumonia",
        "blur_amount": 0.0
    },
    {
        "id": "case_cardiomegaly",
        "title": "Case #2: Decompensated Congestive Heart Failure",
        "category": "Cardiology / Emergency",
        "difficulty": "Moderate",
        "modality": "Chest X-Ray (PA View)",
        "patient": {
            "patient_id": "PT-44091",
            "name": "Arthur Pendelton",
            "age": 72,
            "gender": "Male",
            "modality": "Chest X-Ray (PA View)"
        },
        "clinical_notes": {
            "history": "72-year-old male with history of ischemic cardiomyopathy presenting with progressive orthopnea (3-pillow requirement), paroxysmal nocturnal dyspnea, and rapid 4kg weight gain over 1 week.",
            "symptoms": ["Orthopnea", "Bilateral Leg Swelling", "Dyspnea at rest", "Nocturnal Cough"],
            "vitals": {
                "temperature": "36.8°C",
                "blood_pressure": "158/92 mmHg",
                "heart_rate": "88 bpm (Irregular)",
                "respiratory_rate": "22 breaths/min",
                "spo2": "92% room air"
            },
            "labs": {
                "bnp": "1,620 pg/mL (Markedly Elevated)",
                "troponin_i": "0.02 ng/mL (Negative)",
                "creatinine": "1.4 mg/dL",
                "crp": "4.2 mg/L (Normal)"
            }
        },
        "expected_finding": "Cardiomegaly (CTR > 0.60) & Pulmonary Venous Hypertension",
        "clinical_pearl": "Transverse cardiac diameter greater than half the internal thoracic width confirms cardiomegaly.",
        "pathology_type": "cardiomegaly",
        "blur_amount": 0.0
    },
    {
        "id": "case_pneumothorax",
        "title": "Case #3: Acute Spontaneous Pneumothorax",
        "category": "Thoracic Surgery / Trauma",
        "difficulty": "High",
        "modality": "Chest X-Ray (PA Erect)",
        "patient": {
            "patient_id": "PT-90142",
            "name": "Lucas Morales",
            "age": 28,
            "gender": "Male",
            "modality": "Chest X-Ray (PA Erect)"
        },
        "clinical_notes": {
            "history": "28-year-old tall, slender male smoker presenting to the emergency room with hyperacute, sudden-onset right pleuritic chest pain and acute shortness of breath while seated at desk.",
            "symptoms": ["Sudden Sharp Chest Pain", "Acute Hypoxia", "Tachypnea", "Diminished Right Breath Sounds"],
            "vitals": {
                "temperature": "37.0°C",
                "blood_pressure": "128/78 mmHg",
                "heart_rate": "116 bpm",
                "respiratory_rate": "28 breaths/min",
                "spo2": "88% room air"
            },
            "labs": {
                "wbc": "7.8 x10^9/L (Normal)",
                "crp": "1.2 mg/L (Normal)",
                "d_dimer": "210 ng/mL (Normal)"
            }
        },
        "expected_finding": "Right-Sided Pneumothorax (~35% collapse)",
        "clinical_pearl": "Look specifically for the fine white hairline of the visceral pleura with total absence of lung parenchymal vessels beyond it.",
        "pathology_type": "pneumothorax",
        "blur_amount": 0.0
    },
    {
        "id": "case_nodule",
        "title": "Case #4: Solitary Pulmonary Nodule (High Risk)",
        "category": "Thoracic Oncology / Screening",
        "difficulty": "High",
        "modality": "Chest X-Ray (PA View)",
        "patient": {
            "patient_id": "PT-31084",
            "name": "Harold Chen",
            "age": 67,
            "gender": "Male",
            "modality": "Chest X-Ray (PA View)"
        },
        "clinical_notes": {
            "history": "67-year-old retired shipbuilder with a 38 pack-year tobacco history presenting for routine surveillance. Reports 2-month history of insidious dry cough and 3kg unprovoked weight loss.",
            "symptoms": ["Chronic Cough", "Mild Anorexia", "Unexplained Weight Loss"],
            "vitals": {
                "temperature": "36.7°C",
                "blood_pressure": "134/84 mmHg",
                "heart_rate": "74 bpm",
                "respiratory_rate": "16 breaths/min",
                "spo2": "97% room air"
            },
            "labs": {
                "cea": "5.8 ng/mL (Slightly elevated)",
                "crp": "3.5 mg/L",
                "wbc": "6.9 x10^9/L"
            }
        },
        "expected_finding": "Left Upper Lobe Solitary Nodule (18mm, Spiculated)",
        "clinical_pearl": "Fleischner Society guidelines recommend prompt High-Resolution Chest CT with contrast for non-calcified solid nodules > 8mm in high-risk patients.",
        "pathology_type": "nodule",
        "blur_amount": 0.0
    },
    {
        "id": "case_normal",
        "title": "Case #5: Normal Routine Pre-Operative Clearance",
        "category": "General Radiology / Wellness",
        "difficulty": "Low",
        "modality": "Chest X-Ray (PA View)",
        "patient": {
            "patient_id": "PT-11502",
            "name": "Sarah Jenkins",
            "age": 34,
            "gender": "Female",
            "modality": "Chest X-Ray (PA View)"
        },
        "clinical_notes": {
            "history": "34-year-old female presenting for routine pre-operative screening prior to elective laparoscopic cholecystectomy. No acute or chronic cardiorespiratory complaints.",
            "symptoms": ["Asymptomatic respiratory baseline"],
            "vitals": {
                "temperature": "36.6°C",
                "blood_pressure": "118/74 mmHg",
                "heart_rate": "68 bpm",
                "respiratory_rate": "14 breaths/min",
                "spo2": "99% room air"
            },
            "labs": {
                "wbc": "6.2 x10^9/L (Normal)",
                "crp": "0.8 mg/L (Normal)",
                "hemoglobin": "13.6 g/dL"
            }
        },
        "expected_finding": "Normal Parenchyma & Normal CTR",
        "clinical_pearl": "Both costophrenic angles are acute, diaphragmatic domes are smooth, and pulmonary vascularity tapers normally to periphery.",
        "pathology_type": "normal",
        "blur_amount": 0.0
    },
    {
        "id": "case_poor_quality",
        "title": "Case #6: Degraded / Motion Blur Quality Alert",
        "category": "Quality Assurance / Artifact Audit",
        "difficulty": "Quality Alert",
        "modality": "Chest X-Ray (Portable AP)",
        "patient": {
            "patient_id": "PT-55209",
            "name": "Walter Kowalski",
            "age": 81,
            "gender": "Male",
            "modality": "Chest X-Ray (Portable AP)"
        },
        "clinical_notes": {
            "history": "81-year-old hospitalized patient with severe Parkinsonian tremors and dementia; portable examination acquired during tachypneic breathing without breath hold.",
            "symptoms": ["Tremor / Agitation during imaging", "Sub-optimal inspiration"],
            "vitals": {
                "temperature": "36.9°C",
                "blood_pressure": "124/80 mmHg",
                "heart_rate": "90 bpm",
                "respiratory_rate": "24 breaths/min",
                "spo2": "95% on 2L NC"
            },
            "labs": {
                "wbc": "7.1 x10^9/L",
                "crp": "4.0 mg/L"
            }
        },
        "expected_finding": "Non-Diagnostic Quality: Severe Motion Streaking",
        "clinical_pearl": "AI evidence-validation layer must suppress false positives generated by motion streaks and trigger a mandatory clinical re-acquisition alert.",
        "pathology_type": "poor_quality",
        "blur_amount": 3.0
    }
]

# Cache generated synthetic images so requests are instantaneous
CACHED_DEMO_IMAGES: Dict[str, str] = {}

def get_demo_case_image(case_id: str) -> str:
    if case_id not in CACHED_DEMO_IMAGES:
        for case in DEMO_CASES:
            if case["id"] == case_id:
                CACHED_DEMO_IMAGES[case_id] = create_synthetic_radiograph(
                    pathology=case["pathology_type"],
                    blur_amount=case.get("blur_amount", 0.0)
                )
                break
        if case_id not in CACHED_DEMO_IMAGES:
            CACHED_DEMO_IMAGES[case_id] = create_synthetic_radiograph(pathology="normal")
    return CACHED_DEMO_IMAGES[case_id]
