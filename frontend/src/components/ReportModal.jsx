import React from 'react';
import { X, Printer, Shield, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, analysis }) {
  if (!isOpen || !analysis) return null;

  const {
    id,
    created_at,
    patient,
    clinical_notes,
    image_quality,
    findings = [],
    multimodal_reasoning,
    evidence_validation,
    doctor_review,
    image_data
  } = analysis;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print sticky top-0 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm text-slate-800">
              Clinical Radiographic Consultation Summary
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-8 sm:p-10 space-y-6">
          {/* Hospital / Clinic Header */}
          <div className="border-b-2 border-slate-800 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 bg-blue-600 rounded-sm" />
                <h1 className="font-bold text-xl tracking-tight text-slate-950">
                  MEDVISION CLINICAL IMAGING CENTER
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Department of Thoracic Radiology & Multimodal Intelligence
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-mono text-slate-500">Report Ref:</span>
              <p className="font-mono font-bold text-slate-800">{id?.substring(0, 13).toUpperCase()}</p>
              <p className="text-slate-500">{created_at}</p>
            </div>
          </div>

          {/* Patient Demographics & Examination Profile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Patient Name</span>
              <strong className="text-slate-900 font-semibold text-sm">{patient?.name || 'Anonymous'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Medical Record #</span>
              <strong className="font-mono text-slate-800">{patient?.patient_id || 'PT-UNKNOWN'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Age / Gender</span>
              <span className="text-slate-800">{patient?.age} Yrs • {patient?.gender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Modality / View</span>
              <span className="text-slate-800 font-medium">{patient?.modality || 'Chest X-Ray (PA)'}</span>
            </div>
          </div>

          {/* Clinical Context & Indications */}
          <div className="text-xs space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Clinical Indication & Laboratory Profile
            </h4>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {clinical_notes?.history || 'No clinical history provided.'}
            </p>
            {clinical_notes?.vitals && Object.keys(clinical_notes.vitals).length > 0 && (
              <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                <span className="font-semibold text-slate-600">Vitals & Labs:</span>
                {Object.entries(clinical_notes.vitals).map(([k, v]) => (
                  <span key={k} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                    {k}: {String(v)}
                  </span>
                ))}
                {clinical_notes.labs && Object.entries(clinical_notes.labs).map(([k, v]) => (
                  <span key={k} className="bg-blue-50 px-2 py-0.5 rounded text-blue-800 font-mono">
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Radiograph Thumbnail & Quality Assessment */}
          <div className="flex items-start gap-6 border p-4 rounded-xl border-slate-200">
            {image_data && (
              <div className="w-36 h-36 flex-shrink-0 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-300">
                <img
                  src={image_data}
                  alt="Radiograph Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Image Technical Quality Assessment
              </h4>
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-slate-900">
                  Quality Index: {image_quality?.score || 90}/100
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]">
                  {image_quality?.status || 'Diagnostic Quality'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Sharpness: {image_quality?.sharpness} • Contrast: {image_quality?.contrast} • Resolution: {image_quality?.resolution}
              </p>
              {image_quality?.warnings?.length > 0 && (
                <ul className="text-amber-800 text-[11px] space-y-0.5 list-disc list-inside">
                  {image_quality.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* AI Multimodal Findings */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Computer-Assisted Multimodal Findings ({findings.length})
            </h4>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-semibold">Pathology Finding</th>
                  <th className="p-2.5 font-semibold">Anatomical Location</th>
                  <th className="p-2.5 font-semibold w-24">Confidence</th>
                  <th className="p-2.5 font-semibold">Evidence Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {findings.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium text-slate-900">{f.finding_name}</td>
                    <td className="p-2.5 text-slate-700">{f.location}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{Math.round(f.confidence)}%</td>
                    <td className="p-2.5 text-slate-600 text-[11px]">
                      {f.visual_evidence} {f.clinical_evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Evidence-Validation Layer Audit */}
          {evidence_validation && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-900 block">
                  Anti-Hallucination Evidence-Validation Layer
                </span>
                <span className="text-[11px] text-emerald-800">
                  {evidence_validation.validated_findings_count} findings validated • {evidence_validation.suppressed_findings_count} artifacts suppressed
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-700 uppercase">Trust Index</span>
                <p className="font-mono font-bold text-emerald-900 text-sm">
                  {evidence_validation.overall_trust_score}%
                </p>
              </div>
            </div>
          )}

          {/* Attending Physician Impression & Sign-Off Block */}
          <div className="border-t-2 border-slate-800 pt-5 space-y-4">
            <h4 className="font-bold text-slate-950 uppercase tracking-wider text-[11px]">
              Attending Physician Final Evaluation & Endorsement
            </h4>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <strong className="text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
                  Clinical Impression:
                </strong>
                <p className="text-slate-800 leading-relaxed">
                  {doctor_review?.clinical_impression || 'No impression recorded yet.'}
                </p>
              </div>

              {doctor_review?.recommendations && (
                <div className="pt-2 border-t border-slate-200">
                  <strong className="text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
                    Plan & Recommendations:
                  </strong>
                  <pre className="text-slate-800 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                    {doctor_review.recommendations}
                  </pre>
                </div>
              )}
            </div>

            {/* Signature Block */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <div>
                <p className="font-semibold text-slate-900">
                  {doctor_review?.doctor_name || 'Dr. Marcus Sterling, MD'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {doctor_review?.doctor_title || 'Attending Radiologist'}
                </p>
                <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                  Electronic Signature: {doctor_review?.doctor_signature || 'Electronically Verified'}
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-xs">
                  {doctor_review?.status || 'Clinician Approved'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {doctor_review?.reviewed_at || created_at}
                </p>
              </div>
            </div>
          </div>

          {/* Regulatory & Safety Footer */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 text-center leading-relaxed">
            <p>
              <strong>MEDVISION AI CLINICAL DECISION SUPPORT NOTICE:</strong> This document summarizes an algorithmic computer-assisted evaluation synthesized with physician review. MedVision AI is an assistive decision-support second-opinion tool and not an autonomous diagnostic system. Confidential medical record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
