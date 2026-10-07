# MedVision AI – Multimodal Medical Image Intelligence

**MedVision AI** is an assistive Clinical Decision Support (CDS) web application engineered for radiologists and clinicians. It synergistically combines computer vision analysis of chest radiographs (X-rays) with unstructured electronic health record (EHR) notes, patient vitals, and laboratory biomarkers to provide localized, explainable, and grounded second-opinion insights.

---

## Key Clinical Capabilities & Architecture

### 1. Interactive Radiology Visualizer
- **Visual Localization Layers**:
  - **Bounding Boxes**: Exact anatomical coordinates with confidence percentage badges.
  - **Grad-CAM Activation Heatmaps**: High-resolution heatmap overlay with an interactive opacity slider ($0\%-100\%$) highlighting primary neural network attention regions.
  - **Segmentation Masks**: Active contour polygons delineating pathological margins (e.g. consolidation perimeters, cardiac contours).
- **Radiologist Windowing / Leveling Controls**:
  - Zoom & Pan with crosshair coordinate tracker ($X, Y$ in pixels and normalized coordinates).
  - Brightness ($50\%-180\%$) and Contrast ($50\%-200\%$) adjustments.
  - **Invert Greyscale LUT**: Standard radiological negative mode to distinguish subtle apical pneumothoraces and nodule margins.

### 2. Image Quality Assessment (IQA) Engine
- Automatic pre-screening of uploaded radiographs for diagnostic viability:
  - **Sharpness**: Laplacian variance analysis detects respiratory motion artifacts and focus degradation.
  - **Contrast & Dynamic Range**: Histogram standard deviation and luminance evaluation.
  - **Exposure Saturation**: Under-exposure and over-exposure pixel clipping ratios.
  - **Resolution Compliance**: Warns if input resolution is sub-diagnostic ($< 512\times512$).
  - **Safety Action**: If an image is flagged as **Non-Diagnostic / Poor Quality**, the system displays high-visibility clinical warnings, penalizes confidence, and advises clinical re-acquisition.

### 3. Multimodal Reasoning Engine
- Synthesizes radiological pixel densities with patient context:
  - Patient demographics (Age, Gender, MRN).
  - Presenting symptoms and clinical history.
  - Vital signs (Core temperature, SpO2, heart rate, blood pressure, respiratory rate).
  - Inflammatory and cardiac biomarkers (WBC, CRP, NT-proBNP, Procalcitonin).
- Generates an interactive **Multimodal Reasoning Chain** detailing:
  1. *Radiographic Feature Detection*
  2. *Clinical Biomarker Corroboration*
  3. *Cross-Modal Grounding & Exclusion of Mimics*
  4. *Calibrated Differential Diagnosis Ranking*

### 4. Evidence-Validation & Anti-Hallucination Layer
- Cross-modal gating layer that suppresses unsupported, ambiguous, or artifactual findings:
  - Filters out common false positives (e.g., clavicle/first rib osteophyte overlaps mimicking nodules, diaphragmatic motion blur mimicking basilar atelectasis).
  - Enforces confidence thresholds and consistency checks between imaging and acute clinical flags.
  - Maintains a transparent **Evidence Audit Trail** showing validated findings vs. suppressed artifacts with safety mitigation rationales.

### 5. Doctor Review & Clinical Decision Support Sign-Off
- Interactive physician verification:
  - Individual finding agreement toggles: `[Agree]`, `[Equivocal]`, `[Disagree]`.
  - Attending physician impression and clinical notes editor.
  - Actionable clinical recommendation checklist.
  - Electronic signature block with physician credentials and timestamp.
  - Exportable / Printable **Clinical Consultation Summary Report** (`window.print()` / PDF ready).

### 6. Working Demo Mode (6 Curated Benchmark Cases)
- **Case #1**: Acute Lobar Pneumonia (Right lower lobe consolidation, fever 39.2°C, elevated CRP & WBC)
- **Case #2**: Decompensated Congestive Heart Failure (Cardiomegaly CTR 0.62, cephalization, NT-proBNP 1,620 pg/mL, edema)
- **Case #3**: Acute Spontaneous Pneumothorax (Visceral pleural line, 35% lung collapse, sudden pleurisy & hypoxia)
- **Case #4**: Solitary Pulmonary Nodule (18mm spiculated mass in left upper lobe, 38 pack-year smoker)
- **Case #5**: Normal Pre-Operative Clearance (Clear lung fields, normal cardiothoracic ratio, asymptomatic)
- **Case #6**: Degraded / Motion Blur Quality Alert (Non-diagnostic quality, triggers severe blur alert & artifact suppression)

### 7. Clinical Dashboard
- **New Analysis**: End-to-end interactive diagnostic consultation workspace.
- **Previous Analyses**: Searchable history by MRN, patient name, finding, and status filter.
- **Dataset Explorer**: Benchmark case repository with ground truth comparisons and clinical pearls.
- **Model Architecture**: VLM BioViL specs, AUROC/sensitivity/specificity tables, and explainability documentation.
- **Doctor Review Queue**: Triage inbox for pending radiologist sign-offs.
- **Clinical Statistics**: Concordance rates, validation pass percentages, and pathology distributions.

---

## Medical Disclaimer

> **IMPORTANT CLINICAL NOTICE**: MedVision AI is an assistive decision-support / second-opinion tool. It is **not** an autonomous diagnostic device and does not replace the clinical judgment of a licensed radiologist or physician. All computer-generated predictions, masks, and confidence values must be reviewed and corroborated by qualified healthcare personnel.

---

## Running the Application

### Backend (FastAPI + Python)
```bash
# Navigate to project root
cd /path/to/project

# Start backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation available at: `http://127.0.0.1:8000/docs`*

### Frontend (React + Vite + Tailwind CSS)
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
*Frontend application available at: `http://127.0.0.1:5173`*
