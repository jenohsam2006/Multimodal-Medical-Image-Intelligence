import React from 'react';
import { GitMerge, Brain, CheckCircle2, ArrowRight, Activity, Sparkles, Layers } from 'lucide-react';

export default function MultimodalReasoning({ reasoning }) {
  if (!reasoning) return null;

  const {
    summary = '',
    steps = [],
    differential_diagnosis = [],
    cross_modal_alignment_score = 90
  } = reasoning;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Multimodal Reasoning & Evidence Synthesis
            </h3>
            <p className="text-xs text-slate-500">
              Cross-attention fusion of radiograph pixels and patient EHR context
            </p>
          </div>
        </div>

        {/* Alignment Gauge */}
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <div className="text-right">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-medium uppercase tracking-wider">
              Cross-Modal Alignment
            </span>
            <span className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300">
              {cross_modal_alignment_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Synthesis Summary Narrative */}
      {summary && (
        <div className="my-4 p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">Synthesis Hypothesis:</strong>
          {summary}
        </div>
      )}

      {/* Step-by-Step Multimodal Reasoning Chain */}
      <div className="mt-5">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Step-by-Step Reasoning Chain
        </h4>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
          {steps.map((step) => (
            <div key={step.step_number} className="relative z-10 flex items-start gap-3">
              {/* Step Circle */}
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                {step.step_number}
              </div>

              <div className="flex-1 bg-white dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h5>
                  {step.confidence_impact && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                      {step.confidence_impact}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                  {step.description}
                </p>

                {/* Visual vs Clinical Cues Breakdown */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                  {step.visual_cues?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-[10px] uppercase">Image:</span>
                      {step.visual_cues.map((cue, i) => (
                        <span key={i} className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px]">
                          {cue}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.clinical_cues?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] uppercase">Notes/Labs:</span>
                      {step.clinical_cues.map((cue, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                          {cue}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Differential Diagnosis Table */}
      {differential_diagnosis.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Calibrated Differential Diagnosis
          </h4>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-semibold">Candidate Pathology</th>
                  <th className="py-2 px-3 font-semibold w-32">Probability</th>
                  <th className="py-2 px-3 font-semibold">Diagnostic Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {differential_diagnosis.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                      {d.condition}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.probability > 70 ? 'bg-indigo-600' : d.probability > 20 ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${d.probability}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold w-10 text-right">
                          {d.probability}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {d.basis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
