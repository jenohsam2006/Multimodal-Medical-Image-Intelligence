import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Eye, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function ImageQualityBadge({ quality, onRecheck, isChecking }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!quality) return null;

  const {
    score = 0,
    status = 'Unknown',
    sharpness = 0,
    contrast = 0,
    brightness_mean = 0,
    resolution = 'N/A',
    warnings = [],
    is_poor_quality = false,
    recommendation = ''
  } = quality;

  // Status-based color schemes
  const isGood = score >= 70 && !is_poor_quality;
  const isBorderline = score >= 48 && score < 70 && !is_poor_quality;

  const badgeColor = isGood
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    : isBorderline
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';

  const icon = isGood ? (
    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  ) : isBorderline ? (
    <AlertTriangle className="w-4 h-4 text-amber-500" />
  ) : (
    <AlertCircle className="w-4 h-4 text-rose-500" />
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      <div className="p-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Circular mini score badge */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
              isGood ? 'border-emerald-500 text-emerald-500' :
              isBorderline ? 'border-amber-500 text-amber-500' : 'border-rose-500 text-rose-500'
            }`}>
              {score}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Image Quality Assessment
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${badgeColor}`}>
                {icon}
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              {resolution} • Sharpness: {sharpness} • Contrast: {contrast}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRecheck && (
            <button
              onClick={onRecheck}
              disabled={isChecking}
              className="text-xs px-2.5 py-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition"
            >
              {isChecking ? 'Checking...' : 'Re-check'}
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
          >
            {showDetails ? 'Hide Metrics' : 'Metrics'}
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Critical Poor Quality Warning Callout */}
      {is_poor_quality && (
        <div className="bg-rose-500/15 border-t border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Diagnostic Quality Warning: Non-Diagnostic Radiograph</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
              {recommendation || "Image degradation may obscure subtle pathology or induce motion streak artifacts. Findings have been penalized and ungrounded anomalies suppressed."}
            </p>
          </div>
        </div>
      )}

      {/* Collapsible detail panel */}
      {showDetails && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block">Sharpness (Laplacian)</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{sharpness}</span>
              <span className="text-[10px] text-slate-400 block">{sharpness > 60 ? 'Optimal' : sharpness > 25 ? 'Soft' : 'Blurred'}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block">Contrast (Std Dev)</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{contrast}</span>
              <span className="text-[10px] text-slate-400 block">{contrast > 35 ? 'Wide DR' : 'Low Contrast'}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block">Mean Luminance</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{brightness_mean}/255</span>
              <span className="text-[10px] text-slate-400 block">Balanced</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block">Resolution</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{resolution}</span>
              <span className="text-[10px] text-slate-400 block">Matrix</span>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300 block mb-1">Detected Quality Flags:</span>
              <ul className="space-y-1">
                {warnings.map((w, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
            <strong>Clinical Guidance:</strong> {recommendation}
          </div>
        </div>
      )}
    </div>
  );
}
