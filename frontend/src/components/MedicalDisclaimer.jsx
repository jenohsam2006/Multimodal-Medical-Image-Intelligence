import React from 'react';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs px-3 py-1.5 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
          <span>
            <strong>Clinical Decision Support Notice:</strong> Assistive second-opinion tool. Not a substitute for professional medical judgment.
          </span>
        </div>
        <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
          Simulated Demo
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Clinical Decision Support & Investigational Notice
            </h4>
            <span className="text-[11px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-medium">
              Doctor-Support / Second-Opinion Only
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            MedVision AI is an exploratory multimodal clinical reasoning system intended to assist healthcare professionals in identifying radiographic patterns and cross-referencing clinical context. It does <strong>not</strong> deliver definitive diagnoses, replace radiological interpretation, or establish independent patient management plans. All algorithmic findings and confidence metrics must be corroborated by a licensed physician.
          </p>
        </div>
      </div>
    </div>
  );
}
