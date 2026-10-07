import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Layers, Brain, BarChart, AlertTriangle, FileCode } from 'lucide-react';
import { fetchModelInfo } from '../services/api';

export default function ModelInfoView() {
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModelInfo()
      .then(res => setModelInfo(res))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !modelInfo) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <Cpu className="w-8 h-8 animate-pulse mx-auto mb-2 text-blue-500" />
        Loading model architecture specifications...
      </div>
    );
  }

  const {
    model_name,
    version,
    description,
    architecture_details = {},
    performance_benchmarks = [],
    image_quality_parameters = {},
    regulatory_classification = '',
    clinical_disclaimer = ''
  } = modelInfo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            {model_name}
          </h2>
          <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono font-semibold">
            v{version}
          </span>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          {description}
        </p>
      </div>

      {/* Multimodal Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-2">
            <Layers className="w-4 h-4" />
            <span>Vision Encoder Backbone</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
            {architecture_details.vision_backbone}
          </p>
          <span className="text-[11px] text-slate-400">
            Extracts high-resolution spatial feature pyramids with localized receptive fields.
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-2">
            <Brain className="w-4 h-4" />
            <span>Clinical NLP Encoder</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
            {architecture_details.text_encoder}
          </p>
          <span className="text-[11px] text-slate-400">
            Pretrained on MIMIC-CXR and PubMed to encode complex symptomatology & laboratory tokens.
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Hallucination Gate</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
            {architecture_details.anti_hallucination_layer}
          </p>
          <span className="text-[11px] text-slate-400">
            Enforces dual-modal verification to suppress ungrounded visual illusions or motion artifacts.
          </span>
        </div>
      </div>

      {/* Benchmark Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
          <BarChart className="w-4 h-4 text-blue-600" />
          Clinical Validation Benchmarks (CheXpert & Internal Test Cohort)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Pathology Target</th>
                <th className="py-2.5 px-3 font-semibold">AUROC (ROC Area)</th>
                <th className="py-2.5 px-3 font-semibold">Diagnostic Sensitivity</th>
                <th className="py-2.5 px-3 font-semibold">Diagnostic Specificity</th>
                <th className="py-2.5 px-3 font-semibold">Clinical Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {performance_benchmarks.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                    {row.condition}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                    {(row.auroc * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {(row.sensitivity * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {(row.specificity * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Validated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Quality Engine Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
          <FileCode className="w-4 h-4 text-indigo-600" />
          Image Quality Assessment (IQA) Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <strong className="block text-slate-800 dark:text-slate-200 mb-1">Sharpness Metric</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {image_quality_parameters.sharpness_algorithm}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <strong className="block text-slate-800 dark:text-slate-200 mb-1">Contrast Analysis</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {image_quality_parameters.contrast_method}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <strong className="block text-slate-800 dark:text-slate-200 mb-1">Inference Gate Threshold</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {image_quality_parameters.diagnostic_threshold}
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory & Safety Box */}
      <div className="bg-slate-100 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-300 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <strong className="text-slate-900 dark:text-slate-100">Regulatory Classification:</strong>
          <span className="text-slate-600 dark:text-slate-300">{regulatory_classification}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {clinical_disclaimer}
        </p>
      </div>
    </div>
  );
}
