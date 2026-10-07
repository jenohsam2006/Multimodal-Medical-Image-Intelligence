import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NewAnalysisView from './views/NewAnalysisView';
import PreviousAnalysesView from './views/PreviousAnalysesView';
import DatasetView from './views/DatasetView';
import ModelInfoView from './views/ModelInfoView';
import ReviewQueueView from './views/ReviewQueueView';
import StatisticsView from './views/StatisticsView';
import { fetchDemoCases } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('new');
  // Default to true for radiology dark mode
  const [darkMode, setDarkMode] = useState(true);
  const [demoCases, setDemoCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load demo cases on startup
  useEffect(() => {
    fetchDemoCases()
      .then(res => {
        setDemoCases(res.demo_cases || []);
      })
      .catch(err => console.error('Failed to preload demo cases:', err));
  }, []);

  const handleQuickDemo = (caseId) => {
    setActiveCaseId(caseId);
    setCurrentView('new');
  };

  const handleLoadFromDataset = (caseId) => {
    setActiveCaseId(caseId);
    setCurrentView('new');
  };

  const handleSelectCaseForReview = (analysisId) => {
    // Navigate to new analysis with that ID or view details
    setCurrentView('previous');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onQuickDemo={handleQuickDemo}
        demoCases={demoCases}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'new' && (
          <NewAnalysisView
            demoCases={demoCases}
            activeCaseId={activeCaseId}
            onAnalysisSaved={() => {}}
          />
        )}

        {currentView === 'previous' && (
          <PreviousAnalysesView />
        )}

        {currentView === 'dataset' && (
          <DatasetView
            demoCases={demoCases}
            onLoadCase={handleLoadFromDataset}
          />
        )}

        {currentView === 'model' && (
          <ModelInfoView />
        )}

        {currentView === 'queue' && (
          <ReviewQueueView
            onSelectCaseForReview={handleSelectCaseForReview}
          />
        )}

        {currentView === 'stats' && (
          <StatisticsView />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-4 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>MedVision AI Clinical Intelligence Suite • FDA Investigational Class II CDS Prototype</span>
          </div>
          <p className="text-[11px] text-slate-400">
            For Physician Decision-Support & Educational Research Only • Not Validated for Autonomous Diagnosis
          </p>
        </div>
      </footer>
    </div>
  );
}
