import React, { useState, useEffect } from 'react';
import {
  Upload, Sparkles, AlertCircle, FileText, Activity, Play,
  CheckCircle2, RefreshCw, User, Thermometer, FlaskConical,
  Heart, ArrowRight, CornerDownRight, RotateCcw
} from 'lucide-react';
import ImageViewer from '../components/ImageViewer';
import FindingsList from '../components/FindingsList';
import MultimodalReasoning from '../components/MultimodalReasoning';
import EvidenceValidation from '../components/EvidenceValidation';
import DoctorReview from '../components/DoctorReview';
import ImageQualityBadge from '../components/ImageQualityBadge';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import ReportModal from '../components/ReportModal';
import { analyzeMedicalCase, quickQualityCheck, saveDoctorReview, fetchDemoCases } from '../services/api';

export default function NewAnalysisView({
  demoCases = [],
  activeCaseId = null,
  onAnalysisSaved = () => {}
}) {
  // Input state
  const [selectedImage, setSelectedImage] = useState(null); // base64
  const [currentDemoId, setCurrentDemoId] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Patient Info
  const [patientId, setPatientId] = useState('PT-78219');
  const [patientName, setPatientName] = useState('Eleanor Vance');
  const [patientAge, setPatientAge] = useState(64);
  const [patientGender, setPatientGender] = useState('Female');
  const [modality, setModality] = useState('Chest X-Ray (PA View)');

  // Clinical Notes & Labs
  const [history, setHistory] = useState('64-year-old female presents with 4-day history of worsening productive cough with rusty sputum, acute right-sided pleuritic chest pain, rigors, and subjective breathlessness.');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['High-grade Fever', 'Productive Cough', 'Right Pleuritic Pain', 'Dyspnea on exertion']);
  const [vitals, setVitals] = useState({
    temperature: '39.2°C',
    blood_pressure: '112/68 mmHg',
    heart_rate: '104 bpm',
    respiratory_rate: '24 breaths/min',
    spo2: '91% room air'
  });
  const [labs, setLabs] = useState({
    wbc: '15.4 x10^9/L',
    crp: '82 mg/L',
    procalcitonin: '1.8 ng/mL',
    bnp: '48 pg/mL'
  });

  // Pre-analysis quality
  const [qualityCheck, setQualityCheck] = useState(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  // Analysis result
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Available common clinical symptom chips
  const commonSymptoms = [
    'High-grade Fever', 'Productive Cough', 'Dry Cough', 'Right Pleuritic Pain',
    'Left Pleuritic Pain', 'Dyspnea on exertion', 'Orthopnea', 'Bilateral Leg Swelling',
    'Sudden Sharp Chest Pain', 'Hemoptysis', 'Weight Loss', 'Rigors / Chills'
  ];

  // Clear existing demographics & notes so clinician can input them fresh
  const clearPatientDemographicsAndNotes = (keepImage = true) => {
    if (!keepImage) {
      setSelectedImage(null);
      setQualityCheck(null);
    }
    setCurrentDemoId(null);
    setIsCustomMode(true);
    setPatientId('');
    setPatientName('');
    setPatientAge('');
    setPatientGender('Male');
    setModality('Chest X-Ray (PA View)');
    setHistory('');
    setSelectedSymptoms([]);
    setVitals({
      temperature: '',
      blood_pressure: '',
      heart_rate: '',
      respiratory_rate: '',
      spo2: ''
    });
    setLabs({
      wbc: '',
      crp: '',
      procalcitonin: '',
      bnp: ''
    });
    setAnalysisResult(null);
    setSelectedFindingId(null);
    setErrorMessage(null);
  };

  // Load a demo case
  const loadDemoCase = (caseObj) => {
    if (!caseObj) return;
    setIsCustomMode(false);
    setCurrentDemoId(caseObj.id);
    setSelectedImage(caseObj.image_data);
    setPatientId(caseObj.patient.patient_id);
    setPatientName(caseObj.patient.name);
    setPatientAge(caseObj.patient.age);
    setPatientGender(caseObj.patient.gender);
    setModality(caseObj.patient.modality);
    setHistory(caseObj.clinical_notes.history);
    setSelectedSymptoms(caseObj.clinical_notes.symptoms || []);
    setVitals(caseObj.clinical_notes.vitals || {});
    setLabs(caseObj.clinical_notes.labs || {});
    setAnalysisResult(null);
    setSelectedFindingId(null);
    setErrorMessage(null);

    // Instant quality pre-check
    if (caseObj.image_data) {
      triggerQualityCheck(caseObj.image_data);
    }
  };

  // Initial load
  useEffect(() => {
    if (activeCaseId && demoCases.length > 0) {
      const match = demoCases.find(c => c.id === activeCaseId);
      if (match) loadDemoCase(match);
    } else if (!selectedImage && demoCases.length > 0) {
      loadDemoCase(demoCases[0]);
    }
  }, [activeCaseId, demoCases]);

  // Process uploaded or dropped image file
  const processImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result;
      setSelectedImage(b64);
      // Remove already existing patient demographics and clinical history so doctor can enter them fresh!
      clearPatientDemographicsAndNotes(true);
      triggerQualityCheck(b64);
    };
    reader.readAsDataURL(file);
  };

  // Handle custom image upload file input
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
      e.target.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const triggerQualityCheck = async (imgB64) => {
    setIsCheckingQuality(true);
    try {
      const res = await quickQualityCheck(imgB64);
      setQualityCheck(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  // Run full analysis
  const handleRunAnalysis = async () => {
    if (!selectedImage) {
      setErrorMessage('Please upload a chest radiograph or select a sample case first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const payload = {
        image_base64: selectedImage,
        patient: {
          patient_id: patientId.trim() || (`PT-${Math.floor(10000 + Math.random() * 90000)}`),
          name: patientName.trim() || 'Anonymous Patient',
          age: patientAge !== '' ? Number(patientAge) : 0,
          gender: patientGender || 'Unspecified',
          modality: modality || 'Chest X-Ray (PA View)'
        },
        clinical_notes: {
          history: history,
          symptoms: selectedSymptoms,
          vitals: vitals,
          labs: labs
        },
        demo_case_id: currentDemoId
      };

      const res = await analyzeMedicalCase(payload);
      setAnalysisResult(res);
      setQualityCheck(res.image_quality);
      if (res.findings?.length > 0) {
        setSelectedFindingId(res.findings[0].id);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Analysis failed. Please check inputs and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReview = async (reviewPayload) => {
    setIsSavingReview(true);
    try {
      await saveDoctorReview(reviewPayload);
      onAnalysisSaved();
      // Update local state review
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          doctor_review: reviewPayload.doctor_review
        });
      }
    } catch (err) {
      alert(`Error saving review: ${err.message}`);
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <MedicalDisclaimer />

      {/* Benchmark Case Switcher Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Benchmark Clinical Cases & Input Modes
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Select a sample case or start a fresh manual patient case
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Dedicated Blank Case Button */}
          <button
            type="button"
            onClick={() => clearPatientDemographicsAndNotes(false)}
            className={`p-2.5 rounded-xl border text-left transition text-xs flex flex-col justify-between h-20 ${
              isCustomMode && !currentDemoId
                ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold ring-2 ring-indigo-500/20'
                : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/30'
            }`}
            title="Start a fresh patient case with empty demographics and notes"
          >
            <div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-mono font-bold">
                + NEW PATIENT
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight mt-0.5">
                Blank Case
              </div>
            </div>
            <span className="text-[9px] text-slate-500 truncate block">
              Manual Entry
            </span>
          </button>

          {demoCases.map((c) => {
            const isCurrent = currentDemoId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => loadDemoCase(c)}
                className={`p-2.5 rounded-xl border text-left transition text-xs flex flex-col justify-between h-20 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 font-semibold ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
                }`}
              >
                <div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-mono">
                    {c.patient?.patient_id}
                  </span>
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate leading-tight mt-0.5">
                    {c.title.replace('Case #', '').split(':')[1] || c.title}
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 truncate block">
                  {c.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Entry Notification Banner */}
      {isCustomMode && selectedImage && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              <strong>New Medical Radiograph Loaded:</strong> Existing demo patient demographics were removed. You can now fill in your patient's details, clinical history, and laboratory biomarkers below.
            </span>
          </div>
          <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
            Custom Patient
          </span>
        </div>
      )}

      {/* Main Workspace Grid: Setup & Clinical Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Image Upload & Quality Check */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                Medical Radiograph Input
              </h3>
              <label className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Upload Custom
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview & Interactive Drag-and-Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed transition-all p-4 text-center ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40'
              }`}
            >
              {selectedImage ? (
                <div className="space-y-3">
                  <div className="relative inline-block max-h-56 overflow-hidden rounded-lg border border-slate-700 bg-black">
                    <img
                      src={selectedImage}
                      alt="Uploaded Radiograph"
                      className="max-h-56 object-contain mx-auto"
                    />
                    {currentDemoId ? (
                      <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        Demo Mode
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                        Custom Radiograph
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                    <span>Modality: {modality}</span>
                    <span>•</span>
                    <label className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                      Replace Image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Drag and drop chest radiograph (DICOM export, PNG, JPEG)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Standard PA / AP projection recommended • Auto-clears demo demographics
                  </p>
                </div>
              )}
            </div>

            {/* Quality Assessment Badge */}
            <div className="mt-4">
              <ImageQualityBadge
                quality={qualityCheck}
                onRecheck={() => selectedImage && triggerQualityCheck(selectedImage)}
                isChecking={isCheckingQuality}
              />
            </div>
          </div>

          {/* Patient Demographics Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Patient Demographics
              </h3>
              <button
                type="button"
                onClick={() => { setPatientId(''); setPatientName(''); setPatientAge(''); setPatientGender('Male'); }}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Clear Demographics
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">MRN / Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. PT-94821 or MRN-102"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 52"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Biological Sex</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unspecified">Unspecified</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Clinical Notes, Symptoms, Vitals, Labs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Patient Clinical History & Presenting Symptoms
              </h3>
              <button
                type="button"
                onClick={() => {
                  setHistory('');
                  setSelectedSymptoms([]);
                  setVitals({ temperature: '', blood_pressure: '', heart_rate: '', respiratory_rate: '', spo2: '' });
                  setLabs({ wbc: '', crp: '', procalcitonin: '', bnp: '' });
                }}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Clear Notes & Labs
              </button>
            </div>

            {/* Clinical History Textarea */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                EHR Clinical Note / Physician Examination
              </label>
              <textarea
                rows={3}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="Enter patient presenting symptoms, history of present illness, auscultation findings..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick Symptom Chips */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Key Presenting Symptoms (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {commonSymptoms.map((sym) => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span>Patient Vital Signs</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">Temperature</label>
                  <input
                    type="text"
                    value={vitals.temperature || ''}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    placeholder="e.g. 38.5°C"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Heart Rate</label>
                  <input
                    type="text"
                    value={vitals.heart_rate || ''}
                    onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                    placeholder="e.g. 92 bpm"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitals.blood_pressure || ''}
                    onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                    placeholder="e.g. 120/80 mmHg"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Pulse Oximetry (SpO2)</label>
                  <input
                    type="text"
                    value={vitals.spo2 || ''}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    placeholder="e.g. 96%"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Laboratory Biomarkers */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
                <span>Laboratory Biomarkers</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">WBC Count</label>
                  <input
                    type="text"
                    value={labs.wbc || ''}
                    onChange={(e) => setLabs({ ...labs, wbc: e.target.value })}
                    placeholder="e.g. 11.2 x10^9/L"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">C-Reactive Protein</label>
                  <input
                    type="text"
                    value={labs.crp || ''}
                    onChange={(e) => setLabs({ ...labs, crp: e.target.value })}
                    placeholder="e.g. 45 mg/L"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">NT-proBNP</label>
                  <input
                    type="text"
                    value={labs.bnp || ''}
                    onChange={(e) => setLabs({ ...labs, bnp: e.target.value })}
                    placeholder="e.g. 240 pg/mL"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Procalcitonin / Other</label>
                  <input
                    type="text"
                    value={labs.procalcitonin || ''}
                    onChange={(e) => setLabs({ ...labs, procalcitonin: e.target.value })}
                    placeholder="e.g. 0.8 ng/mL"
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Run Analysis Trigger Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                AI Vision-Language Multimodal Fusion Pipeline ready
              </span>
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !selectedImage}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Multimodal Case...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run AI-Assisted Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="space-y-6 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Multimodal Analysis Results & Localization
              </h2>
              <p className="text-xs text-slate-500">
                Generated {analysisResult.created_at} • Analysis ID: {analysisResult.id.substring(0, 8)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs"
              >
                View Consultation Summary
              </button>
            </div>
          </div>

          {/* Top Row: Interactive Radiology Canvas + Findings List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Canvas (7 cols) */}
            <div className="lg:col-span-7 h-[540px]">
              <ImageViewer
                imageData={analysisResult.image_data}
                heatmapData={analysisResult.heatmap_data}
                findings={analysisResult.findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={(id) => setSelectedFindingId(id)}
                isPoorQuality={analysisResult.image_quality?.is_poor_quality}
              />
            </div>

            {/* Findings List (5 cols) */}
            <div className="lg:col-span-5 h-[540px] overflow-y-auto pr-1">
              <div className="sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Detected Findings ({analysisResult.findings?.length || 0})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Click finding to locate on canvas
                </span>
              </div>
              <FindingsList
                findings={analysisResult.findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={(id) => setSelectedFindingId(id)}
              />
            </div>
          </div>

          {/* Second Row: Multimodal Reasoning & Evidence-Validation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MultimodalReasoning reasoning={analysisResult.multimodal_reasoning} />
            <EvidenceValidation validation={analysisResult.evidence_validation} />
          </div>

          {/* Third Row: Doctor Review & Sign-Off Section */}
          <DoctorReview
            analysisId={analysisResult.id}
            findings={analysisResult.findings}
            initialReview={analysisResult.doctor_review}
            onSave={handleSaveReview}
            onOpenReport={() => setShowReportModal(true)}
            isSaving={isSavingReview}
          />
        </div>
      )}

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        analysis={analysisResult}
      />
    </div>
  );
}
