import React, { useState } from 'react';
import { Download, Terminal, CheckCircle2, Copy, Check } from 'lucide-react';
import { downloadProjectZip } from '../utils/zipExporter';
import { DART_FILES } from '../data/dartCodeFiles';

interface HeaderProps {
  activeTab: 'terminal' | 'code' | 'tests' | 'tasks' | 'rubric';
  setActiveTab: (tab: 'terminal' | 'code' | 'tests' | 'tasks' | 'rubric') => void;
  onRunTests: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onRunTests }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyReadme = async () => {
    const readme = DART_FILES.find((f) => f.path === 'README.md')?.content || '';
    await navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadProjectZip();
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm font-mono">
              D&gt;
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('terminal');
              }}
              className="text-base font-semibold tracking-tight text-white flex items-center gap-2"
            >
              Dart Task CLI
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                · Application Dart Pur
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Terminal CLI
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Code Source Dart
            </button>
            <button
              onClick={() => {
                setActiveTab('tests');
                onRunTests();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Tests Unitaires (8/8)
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              tasks.json
            </button>
            <button
              onClick={() => setActiveTab('rubric')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'rubric'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Barème 100 pts
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReadme}
              title="Copier le README complet pour GitHub"
              className="px-3 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors hidden sm:flex items-center gap-1.5 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">README copié!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier README</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-3.5 py-1.5 text-xs font-medium rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-cyan-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Génération...' : 'Télécharger ZIP'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'terminal' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'code' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Code Dart
          </button>
          <button
            onClick={() => {
              setActiveTab('tests');
              onRunTests();
            }}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'tests' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Tests (8/8)
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'tasks' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
            }`}
          >
            tasks.json
          </button>
          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${
              activeTab === 'rubric' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Barème 100 pts
          </button>
        </div>
      </div>
    </header>
  );
};
