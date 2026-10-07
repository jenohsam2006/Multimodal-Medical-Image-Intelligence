import React from 'react';
import {
  Activity, PlusCircle, History, Database, Cpu, UserCheck,
  BarChart3, Moon, Sun, Sparkles, ChevronDown, CheckCircle
} from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  onQuickDemo,
  demoCases = []
}) {
  const [demoMenuOpen, setDemoMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'new', label: 'New Analysis', icon: PlusCircle },
    { id: 'previous', label: 'Previous Analyses', icon: History },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },
    { id: 'model', label: 'Model Architecture', icon: Cpu },
    { id: 'queue', label: 'Doctor Review Queue', icon: UserCheck },
    { id: 'stats', label: 'Clinical Statistics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentView('new')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 animate-med-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  MedVision <span className="text-blue-600 dark:text-blue-400">AI</span>
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm font-semibold tracking-wider uppercase border border-blue-500/20">
                  Multimodal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
                Multimodal Medical Image Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions (Demo cases, Dark mode, Status) */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Case Selector */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium shadow-xs shadow-blue-600/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Cases</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Select Benchmark Clinical Case
                </div>
                <div className="py-1 space-y-1 max-h-80 overflow-y-auto">
                  {demoCases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onQuickDemo(c.id);
                        setDemoMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-start gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{c.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={darkMode ? 'Switch to Clinical Light Mode' : 'Switch to Radiology Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-xs gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition ${
              currentView === item.id
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
