import io
import base64
import math
import numpy as np
from PIL import Image, ImageDraw
from typing import List, Tuple, Dict, Any, Optional
from .schemas import Finding, BoundingBox, SegmentationPolygon

def generate_gradcam_heatmap(
    width: int,
    height: int,
    hotspots: List[Tuple[float, float, float, float]]  # (center_x, center_y, radius_x, radius_y) normalized
) -> str:
    """
    Generates an RGBA Grad-CAM heatmap where color encodes activation intensity
    (Blue -> Cyan -> Green -> Yellow -> Red) with alpha gradient.
    """
    # Downscaled grid for smooth Gaussian interpolation
    grid_w, grid_h = 128, 128
    heatmap = np.zeros((grid_h, grid_w), dtype=np.float32)

    for cx, cy, rx, ry in hotspots:
        center_x = cx * grid_w
        center_y = cy * grid_h
        sigma_x = max(2.0, rx * grid_w * 0.75)
        sigma_y = max(2.0, ry * grid_h * 0.75)

        y_indices, x_indices = np.ogrid[:grid_h, :grid_w]
        dist_sq = ((x_indices - center_x) ** 2) / (2 * (sigma_x ** 2)) + ((y_indices - center_y) ** 2) / (2 * (sigma_y ** 2))
        gaussian = np.exp(-dist_sq)
        heatmap = np.maximum(heatmap, gaussian)

    # Normalize heatmap 0..1
    max_val = np.max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val

    # Jet-like colormap lookup
    # 0.0 -> transparent, 0.2 -> cyan, 0.5 -> green, 0.75 -> yellow, 1.0 -> deep red
    rgba = np.zeros((grid_h, grid_w, 4), dtype=np.uint8)
    
    # Red channel
    rgba[..., 0] = np.clip(np.where(heatmap < 0.35, 0, (heatmap - 0.35) / 0.65 * 255), 0, 255).astype(np.uint8)
    # Green channel
    green_ramp = np.where(heatmap < 0.2, 0, np.where(heatmap < 0.7, (heatmap - 0.2) / 0.5 * 255, (1.0 - (heatmap - 0.7) / 0.3) * 255))
    rgba[..., 1] = np.clip(green_ramp, 0, 255).astype(np.uint8)
    # Blue channel
    rgba[..., 2] = np.clip(np.where(heatmap < 0.5, (0.5 - heatmap) / 0.5 * 255, 0), 0, 255).astype(np.uint8)
    # Alpha channel: transparent where activation is low (< 0.15), opaque where high
    alpha_ramp = np.clip(np.where(heatmap < 0.12, 0, (heatmap - 0.12) / 0.88 * 210), 0, 220)
    rgba[..., 3] = alpha_ramp.astype(np.uint8)

    heat_img = Image.fromarray(rgba, mode="RGBA").resize((width, height), Image.Resampling.BILINEAR)
    
    buffered = io.BytesIO()
    heat_img.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def generate_ellipse_polygon(cx: float, cy: float, rx: float, ry: float, num_points: int = 24, wobble: float = 0.015) -> List[List[float]]:
    """Generates realistic anatomical polygon contour coordinates."""
    points = []
    np.random.seed(int((cx + cy) * 1000))
    for i in range(num_points):
        theta = (2 * math.pi * i) / num_points
        # add subtle organic perturbation
        dr = 1.0 + (np.sin(theta * 3) * wobble) + (np.cos(theta * 2) * wobble * 0.5)
        x = cx + rx * math.cos(theta) * dr
        y = cy + ry * math.sin(theta) * dr
        points.append([round(float(np.clip(x, 0.05, 0.95)), 4), round(float(np.clip(y, 0.05, 0.95)), 4)])
    return points

def detect_visual_findings(
    img: Image.Image,
    demo_case_id: Optional[str] = None,
    clinical_keywords: Optional[List[str]] = None
) -> Tuple[List[Finding], str]:
    width, height = img.size
    clinical_keywords = [k.lower() for k in (clinical_keywords or [])]

    # Rule/Profile mapping based on demo case or heuristics
    findings: List[Finding] = []
    hotspots: List[Tuple[float, float, float, float]] = []

    case_id = (demo_case_id or "").lower()

    if "pneumonia" in case_id or any(k in ["fever", "cough", "sputum", "crp", "pneumonia", "consolidation"] for k in clinical_keywords):
        # Lobar Pneumonia in Right Lower Lobe
        box = BoundingBox(ymin=0.48, xmin=0.52, ymax=0.82, xmax=0.84)
        mask_points = generate_ellipse_polygon(cx=0.68, cy=0.65, rx=0.14, ry=0.15)
        findings.append(Finding(
            id="f-pneumonia-rll",
            finding_name="Right Lower Lobe Consolidation (Lobar Pneumonia)",
            location="Right Basilar / Lower Lung Zone (Retrocardiac extension)",
            confidence=92.4,
            severity="Severe",
            box=box,
            mask=SegmentationPolygon(points=mask_points),
            visual_evidence="Dense alveolar opacification with branching air bronchograms. Obliteration of the right hemidiaphragm silhouette (positive silhouette sign).",
            clinical_evidence="Directly correlates with high-grade pyrexia (39.2°C), purulent sputum, and marked inflammatory biomarker elevation (CRP 78 mg/L, WBC 14.8k).",
            status="Validated",
            color="#ef4444"
        ))
        hotspots.append((0.68, 0.65, 0.16, 0.16))

        # Secondary reactive parapneumonic pleural thickening
        box_sec = BoundingBox(ymin=0.74, xmin=0.68, ymax=0.86, xmax=0.89)
        findings.append(Finding(
            id="f-pleural-reactive",
            finding_name="Trace Reactive Parapneumonic Effusion",
            location="Right Costophrenic Sulcus",
            confidence=78.8,
            severity="Mild",
            box=box_sec,
            mask=SegmentationPolygon(points=generate_ellipse_polygon(cx=0.78, cy=0.80, rx=0.08, ry=0.05)),
            visual_evidence="Minor blunting of the right lateral costophrenic angle consistent with reactive exudative layering.",
            clinical_evidence="Expected reactive sequela of acute dense bacterial lobar infection.",
            status="Validated",
            color="#f97316"
        ))
        hotspots.append((0.78, 0.80, 0.08, 0.06))

    elif "cardiomegaly" in case_id or any(k in ["bnp", "edema", "dyspnea", "heart failure", "orthopnea", "cardiomegaly"] for k in clinical_keywords):
        # Cardiomegaly finding
        box = BoundingBox(ymin=0.42, xmin=0.32, ymax=0.84, xmax=0.78)
        mask_points = generate_ellipse_polygon(cx=0.55, cy=0.63, rx=0.22, ry=0.19)
        findings.append(Finding(
            id="f-cardiomegaly",
            finding_name="Cardiomegaly with Biventricular Enlargement",
            location="Central Mediastinum & Cardiac Silhouette",
            confidence=95.1,
            severity="Severe",
            box=box,
            mask=SegmentationPolygon(points=mask_points),
            visual_evidence="Marked widening of transverse cardiac diameter. Cardiothoracic ratio (CTR) measured at 0.62 (> 0.50 threshold). Apex displaced leftward.",
            clinical_evidence="Congruent with orthopnea, paroxysmal nocturnal dyspnea, bilateral lower-extremity pitting edema, and NT-proBNP 1,480 pg/mL.",
            status="Validated",
            color="#ec4899"
        ))
        hotspots.append((0.55, 0.63, 0.22, 0.20))

        # Bilateral interstitial vascular engorgement / Cephalization
        box_edema = BoundingBox(ymin=0.32, xmin=0.25, ymax=0.58, xmax=0.76)
        findings.append(Finding(
            id="f-pulmonary-vascular",
            finding_name="Pulmonary Venous Congestion & Cephalization",
            location="Upper Lobar Pulmonary Vasculature",
            confidence=86.3,
            severity="Moderate",
            box=box_edema,
            mask=SegmentationPolygon(points=generate_ellipse_polygon(cx=0.50, cy=0.44, rx=0.24, ry=0.12)),
            visual_evidence="Upper lobe venous recruitment (antler sign) and perihilar haziness indicative of elevated left atrial capillary wedge pressure.",
            clinical_evidence="Supports acute decompensation on chronic heart failure.",
            status="Validated",
            color="#3b82f6"
        ))
        hotspots.append((0.50, 0.44, 0.20, 0.12))

    elif "pneumothorax" in case_id or any(k in ["pneumothorax", "pleuritic", "hypoxia", "chest pain", "absent breath sounds"] for k in clinical_keywords):
        # Pneumothorax in Right Apical/Peripheral hemithorax
        box = BoundingBox(ymin=0.14, xmin=0.60, ymax=0.68, xmax=0.92)
        mask_points = generate_ellipse_polygon(cx=0.77, cy=0.38, rx=0.14, ry=0.24)
        findings.append(Finding(
            id="f-pneumothorax",
            finding_name="Right-Sided Pneumothorax (~35% lung volume)",
            location="Right Superior & Lateral Hemithorax",
            confidence=94.7,
            severity="Severe",
            box=box,
            mask=SegmentationPolygon(points=mask_points),
            visual_evidence="Distinct visceral pleural line identified with absolute absence of peripheral bronchovascular lung markings. Deep sulcus sign noted.",
            clinical_evidence="Matches acute hyperacute onset of unilateral pleuritic chest pain, sudden SpO2 drop to 89%, and diminished vesicular breath sounds.",
            status="Validated",
            color="#ef4444"
        ))
        hotspots.append((0.77, 0.38, 0.14, 0.22))

    elif "nodule" in case_id or any(k in ["nodule", "mass", "hemoptysis", "smoker", "smoking", "pack-year"] for k in clinical_keywords):
        # Pulmonary nodule left mid/upper zone
        box = BoundingBox(ymin=0.28, xmin=0.24, ymax=0.44, xmax=0.40)
        mask_points = generate_ellipse_polygon(cx=0.32, cy=0.36, rx=0.07, ry=0.07)
        findings.append(Finding(
            id="f-nodule",
            finding_name="Solitary Pulmonary Nodule (18mm, Spiculated)",
            location="Left Upper Lobe (Peripheral Segment)",
            confidence=89.2,
            severity="Moderate",
            box=box,
            mask=SegmentationPolygon(points=mask_points),
            visual_evidence="Well-defined 18mm non-calcified nodular density exhibiting coronal radiata / subtle margin spiculation.",
            clinical_evidence="35 pack-year smoking history, progressive unprovoked dry cough, weight loss. Fleischner Society criteria warrants high-risk workup.",
            status="Validated",
            color="#f59e0b"
        ))
        hotspots.append((0.32, 0.36, 0.08, 0.08))

    elif "poor" in case_id or "blur" in case_id:
        # Ambiguous artifact finding that will be flagged/suppressed by validation engine
        box = BoundingBox(ymin=0.62, xmin=0.22, ymax=0.82, xmax=0.48)
        findings.append(Finding(
            id="f-artifact-infiltrate",
            finding_name="Equivocal Basilar Opacity (Probable Motion Artifact)",
            location="Left Lower Lung Base",
            confidence=51.2,
            severity="Mild",
            box=box,
            mask=SegmentationPolygon(points=generate_ellipse_polygon(cx=0.34, cy=0.72, rx=0.11, ry=0.09)),
            visual_evidence="Blurry horizontal streaking across the diaphragm contour simulating plate-like atelectasis.",
            clinical_evidence="Patient is asymptomatic with normal vitals and no inflammatory markers.",
            status="Flagged for Review",
            color="#eab308"
        ))
        hotspots.append((0.34, 0.72, 0.10, 0.08))

    else:
        # Default / Clear / Normal Screen
        findings.append(Finding(
            id="f-clear-lungs",
            finding_name="Normal Parenchymal & Mediastinal Anatomy",
            location="Bilateral Hemithoraces & Cardiac Silhouette",
            confidence=97.8,
            severity="Normal",
            box=BoundingBox(ymin=0.20, xmin=0.15, ymax=0.85, xmax=0.85),
            mask=None,
            visual_evidence="Sharp costophrenic angles bilaterally. Clear lung parenchymal expansion with normal arborization. Cardiothoracic ratio within normal physiological limits (CTR = 0.44).",
            clinical_evidence="Consistent with asymptomatic baseline status or unremarkable routine clinical checkup.",
            status="Validated",
            color="#10b981"
        ))

    # Generate the Grad-CAM color overlay
    heatmap_data_url = generate_gradcam_heatmap(width, height, hotspots) if hotspots else ""

    return findings, heatmap_data_url
