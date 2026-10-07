import React, { useState, useEffect } from 'react';
import {
  UserCheck, Check, X, HelpCircle, FileCheck, Printer, Save,
  AlertTriangle, Shield, CheckCircle2, Send
} from 'lucide-react';

export default function DoctorReview({
  analysisId,
  findings = [],
  initialReview = null,
  onSave = () => {},
  onOpenReport = () => {},
  isSaving = false
}) {
  const [doctorName, setDoctorName] = useState('Dr. Marcus Sterling, MD');
  const [doctorTitle, setDoctorTitle] = useState('Senior Radiologist & Pulmonary Consultant');
  const [licenseId, setLicenseId] = useState('RAD-88192-US');
  
  // Agreement mapping: { finding_id: 'AGREE' | 'DISAGREE' | 'EQUIVOCAL' }
  const [agreements, setAgreements] = useState({});
  const [clinicalImpression, setClinicalImpression] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [signedTimestamp, setSignedTimestamp] = useState(null);

  // Initialize or populate from existing review
  useEffect(() => {
    if (initialReview) {
      if (initialReview.doctor_name) setDoctorName(initialReview.doctor_name);
      if (initialReview.doctor_title) setDoctorTitle(initialReview.doctor_title);
      if (initialReview.clinical_impression) setClinicalImpression(initialReview.clinical_impression);
      if (initialReview.recommendations) setRecommendations(initialReview.recommendations);
      if (initialReview.doctor_signature) {
        setIsSigned(true);
        setSignedTimestamp(initialReview.reviewed_at);
      }
    }

    // Default agree to validated findings if not already set
    const map = {};
    findings.forEach(f => {
      if (initialReview?.disagreed_findings?.includes(f.finding_name)) {
        map[f.id] = 'DISAGREE';
      } else {
        map[f.id] = 'AGREE';
      }
    });
    setAgreements(map);

    if (!clinicalImpression && findings.length > 0) {
      setClinicalImpression(
        `Multimodal radiographic findings correlate with ${findings.map(f => f.finding_name.split('(')[0].trim()).join(' and ')}. ` +
        `Patient clinical presentation and laboratory biomarkers corroborate the primary working hypothesis. Recommend appropriate clinical management.`
      );
    }

    if (!recommendations) {
      setRecommendations(
        `1. Correlate with clinical response within 48-72 hours.\n` +
        `2. Obtain high-resolution non-contrast CT chest if symptoms fail to resolve.\n` +
        `3. Re-evaluate post-treatment radiograph in 4 to 6 weeks.`
      );
    }
  }, [findings, initialReview]);

  const setFindingAgreement = (id, status) => {
    setAgreements(prev => ({ ...prev, [id]: status }));
  };

  const handleSignAndSave = () => {
    const agreedList = findings
      .filter(f => agreements[f.id] === 'AGREE')
      .map(f => f.finding_name);
    
    const disagreedList = findings
      .filter(f => agreements[f.id] === 'DISAGREE')
      .map(f => f.finding_name);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const reviewPayload = {
      analysis_id: analysisId,
      doctor_review: {
        status: disagreedList.length === findings.length ? 'Modified' : 'Approved',
        doctor_name: doctorName,
        doctor_title: `${doctorTitle} (#${licenseId})`,
        reviewed_at: now,
        agreed_findings: agreedList,
        disagreed_findings: disagreedList,
        clinical_impression: clinicalImpression,
        recommendations: recommendations,
        doctor_signature: `${doctorName} [Digital Token: ${btoa(doctorName + licenseId).substring(0, 12)}]`
      }
    };

    setIsSigned(true);
    setSignedTimestamp(now);
    onSave(reviewPayload);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Doctor Review & Clinical Decision Support Sign-Off
              </h3>
              {isSigned && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Clinician Approved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Physician validation required before finalizing diagnostic report
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium transition"
        >
          <Printer className="w-3.5 h-3.5 text-blue-500" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Doctor Credentials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Reviewing Physician
          </label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Clinical Title / Role
          </label>
          <input
            type="text"
            value={doctorTitle}
            onChange={(e) => setDoctorTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Physician License / NPI
          </label>
          <input
            type="text"
            value={licenseId}
            onChange={(e) => setLicenseId(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Interactive Finding Verification Toggles */}
      <div className="my-4">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Physician Finding Verification ({findings.length} Findings)
        </h4>

        <div className="space-y-2">
          {findings.map((f) => {
            const currentStatus = agreements[f.id] || 'AGREE';

            return (
              <div
                key={f.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: f.color || '#ef4444' }}
                    />
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {f.finding_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({Math.round(f.confidence)}% AI Conf)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Location: {f.location}
                  </span>
                </div>

                {/* Agreement Choice Buttons */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFindingAgreement(f.id, 'AGREE')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      currentStatus === 'AGREE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    Agree
                  </button>

                  <button
                    type="button"
                    onClick={() => setFindingAgreement(f.id, 'EQUIVOCAL')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      currentStatus === 'EQUIVOCAL'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-3 h-3" />
                    Equivocal
                  </button>

                  <button
                    type="button"
                    onClick={() => setFindingAgreement(f.id, 'DISAGREE')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      currentStatus === 'DISAGREE'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    Disagree
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Impression Note */}
      <div className="my-4">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
          Attending Physician Impression & Synthesis
        </label>
        <textarea
          rows={3}
          value={clinicalImpression}
          onChange={(e) => setClinicalImpression(e.target.value)}
          placeholder="Enter detailed radiological impression and clinical correlation..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
        />
      </div>

      {/* Recommendations */}
      <div className="my-4">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
          Clinical Recommendations & Next Steps
        </label>
        <textarea
          rows={3}
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Recommended follow-ups, prescriptions, further imaging..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-mono"
        />
      </div>

      {/* Attestation & Save Action */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 max-w-md">
          <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>
            {isSigned
              ? `Signed by ${doctorName} on ${signedTimestamp || 'Just now'}`
              : "By clicking Approve, you certify that you have independently reviewed these images and multimodal notes as a licensed clinician."}
          </span>
        </div>

        <button
          onClick={handleSignAndSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Review...' : isSigned ? 'Update Signed Consultation' : 'Approve & Sign Consultation'}</span>
        </button>
      </div>
    </div>
  );
}
