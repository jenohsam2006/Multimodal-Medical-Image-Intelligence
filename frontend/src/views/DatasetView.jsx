import React from 'react';
import { Database, Sparkles, ArrowRight, Eye, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

export default function DatasetView({ demoCases = [], onLoadCase = () => {} }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Clinical Benchmark Dataset & Case Explorer
          </h2>
          <p className="text-xs text-slate-500">
            Curated ground-truth thoracic radiograph vignettes with multimodal clinical records
          </p>
        </div>

        <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl font-semibold">
          {demoCases.length} Standard Benchmark Cases
        </span>
      </div>

      {/* Grid of benchmark cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCases.map((caseItem) => {
          const isQualityAlert = caseItem.id === 'case_poor_quality';

          return (
            <div
              key={caseItem.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between bg-white dark:bg-slate-900 shadow-xs hover:shadow-md ${
                isQualityAlert
                  ? 'border-amber-300 dark:border-amber-800/80'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Banner / Image */}
                <div className="relative bg-black h-48 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800">
                  {caseItem.image_data ? (
                    <img
                      src={caseItem.image_data}
                      alt={caseItem.title}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Eye className="w-10 h-10 text-slate-600" />
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/20">
                      {caseItem.patient.patient_id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isQualityAlert
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {caseItem.difficulty}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-mono">
                    {caseItem.modality}
                  </div>
                </div>

                {/* Case Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
                      {caseItem.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                      {caseItem.title}
                    </h3>
                  </div>

                  {/* Expected Finding */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">
                      Target Pathology / Ground Truth:
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {caseItem.expected_finding}
                    </strong>
                  </div>

                  {/* Patient Vignette summary */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {caseItem.clinical_notes.history}
                  </p>

                  {/* Clinical Pearl */}
                  {caseItem.clinical_pearl && (
                    <div className="flex items-start gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-500" />
                      <span>
                        <strong>Radiology Pearl:</strong> {caseItem.clinical_pearl}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => onLoadCase(caseItem.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition shadow-xs"
                >
                  <span>Load into Analysis Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
