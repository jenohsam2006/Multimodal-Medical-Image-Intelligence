import React from 'react';
import {
  AlertCircle, CheckCircle, Crosshair, MapPin, Eye, FileText,
  Activity, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function FindingsList({
  findings = [],
  selectedFindingId = null,
  onSelectFinding = () => {}
}) {
  if (!findings || findings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
        <p className="text-sm font-medium">No Pathologies Detected</p>
        <p className="text-xs opacity-70 mt-1">Image parenchyma clear within physiological baseline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((f) => {
        const isSelected = f.id === selectedFindingId;
        const conf = Math.round(f.confidence);

        // Severity pill styling
        const severityColors = {
          Severe: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
          Moderate: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
          Mild: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
          Normal: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
        };

        const statusColors = {
          'Validated': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          'Flagged for Review': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          'Suppressed / Low Evidence': 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
        };

        return (
          <div
            key={f.id}
            onClick={() => onSelectFinding(f.id)}
            className={`rounded-xl border transition-all cursor-pointer p-4 bg-white dark:bg-slate-900 ${
              isSelected
                ? 'border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Header: Name, Severity, Confidence */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: f.color || '#ef4444' }}
                  />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {f.finding_name}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${severityColors[f.severity] || severityColors.Moderate}`}>
                    {f.severity}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[f.status] || statusColors.Validated}`}>
                    {f.status}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>Exact Location: <strong className="text-slate-800 dark:text-slate-200">{f.location}</strong></span>
                </div>
              </div>

              {/* Confidence Gauge */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    {conf}%
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Conf</span>
                </div>
                {/* Visual Bar */}
                <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${
                      conf >= 85 ? 'bg-emerald-500' : conf >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${conf}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Evidence Breakdown Grid */}
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              {/* Supporting Visual Evidence */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium mb-1">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Radiological Visual Evidence:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {f.visual_evidence}
                </p>
              </div>

              {/* Supporting Clinical Notes & Labs */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium mb-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>EHR & Laboratory Correlation:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {f.clinical_evidence}
                </p>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex items-center justify-between mt-3 pt-2 text-[11px]">
              <span className="text-slate-400">
                {f.box ? `Bounding Box: [${f.box.ymin}, ${f.box.xmin}, ${f.box.ymax}, ${f.box.xmax}]` : 'Diffuse Anatomy'}
              </span>
              <button
                type="button"
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium transition"
              >
                <Crosshair className="w-3 h-3" />
                <span>Locate on Image</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
