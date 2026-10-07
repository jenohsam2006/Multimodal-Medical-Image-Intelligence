import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Filter, Info, EyeOff } from 'lucide-react';

export default function EvidenceValidation({ validation }) {
  const [filter, setFilter] = useState('ALL'); // ALL, VALIDATED, SUPPRESSED, FLAGGED

  if (!validation) return null;

  const {
    overall_trust_score = 95,
    validated_findings_count = 0,
    suppressed_findings_count = 0,
    checks = [],
    hallucination_risk_level = 'Low'
  } = validation;

  const filteredChecks = checks.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Evidence-Validation & Anti-Hallucination Layer
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                hallucination_risk_level === 'Low'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
              }`}>
                {hallucination_risk_level} Hallucination Risk
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cross-modal gating verifies visual groundings and suppresses uncorroborated artifacts
            </p>
          </div>
        </div>

        {/* Trust Score */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
              Validation Trust Score
            </span>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {overall_trust_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Validated Findings</span>
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{validated_findings_count}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
        </div>

        <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">Suppressed Artifacts</span>
            <span className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">{suppressed_findings_count}</span>
          </div>
          <EyeOff className="w-6 h-6 text-rose-500/40" />
        </div>

        <div className="col-span-2 sm:col-span-1 bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">Verification Policy</span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Dual-Gated (IQA + EHR)</span>
          </div>
          <ShieldAlert className="w-6 h-6 text-blue-500/40" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Evidence Audit Trail ({checks.length} Checks)
        </span>
        <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
          {['ALL', 'VALIDATED', 'SUPPRESSED', 'FLAGGED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md transition font-medium text-[11px] ${
                filter === tab
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Checks List */}
      <div className="space-y-2.5">
        {filteredChecks.map((check, idx) => {
          const isVal = check.status === 'VALIDATED';
          const isSup = check.status === 'SUPPRESSED';

          const badgeClass = isVal
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : isSup
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';

          const icon = isVal ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : isSup ? (
            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          );

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition ${
                isSup
                  ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {check.finding_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Visual: {check.visual_score}% | Clinical: {check.clinical_score}%
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badgeClass}`}>
                    {check.status}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pl-6">
                {check.verdict_reason}
              </p>

              {check.mitigation && (
                <div className="mt-1.5 ml-6 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-500">
                  <strong className="text-slate-700 dark:text-slate-300">Safety Mitigation:</strong> {check.mitigation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
