import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle2, ArrowRight, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { fetchAnalyses, fetchAnalysisDetails } from '../services/api';
import ReportModal from '../components/ReportModal';

export default function ReviewQueueView({ onSelectCaseForReview }) {
  const [pendingCases, setPendingCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadPending = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAnalyses('', 'Pending Review');
      setPendingCases(res.analyses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleQuickSummary = async (id) => {
    try {
      const record = await fetchAnalysisDetails(id);
      setSelectedRecord(record);
      setShowModal(true);
    } catch (err) {
      alert(`Could not load record: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Radiologist Clinical Sign-Off Queue
          </h2>
          <p className="text-xs text-slate-500">
            Pending multimodal analyses awaiting physician verification and electronic sign-off
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full font-semibold">
            {pendingCases.length} Pending Attending Review
          </span>
          <button
            onClick={loadPending}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Queue items */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
          Loading pending review queue...
        </div>
      ) : pendingCases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            Review Queue All Caught Up!
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            All pending cases have received physician review and electronic signatures.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingCases.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {item.patient_id}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Sign-Off
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {item.patient_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {item.patient_age} yrs • {item.patient_gender} • {item.modality}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Tentative AI Finding:
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <strong className="text-slate-900 dark:text-slate-100">
                      {item.top_finding}
                    </strong>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(item.confidence)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSummary(item.id)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
                >
                  Quick Summary
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCaseForReview(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-xs"
                >
                  <span>Review & Sign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Modal */}
      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        analysis={selectedRecord}
      />
    </div>
  );
}
