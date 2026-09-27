import React, { useState } from 'react';
import { Copy, Check, FileCode, Folder, ChevronRight, Layers, FileJson, BookOpen } from 'lucide-react';
import { DART_FILES, DartFileEntry } from '../data/dartCodeFiles';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<DartFileEntry>(DART_FILES[2]); // lib/models/task.dart by default
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = DART_FILES.filter(
    (f) =>
      f.path.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.badge.toLowerCase().includes(search.toLowerCase()),
  );

  const getFileIcon = (file: DartFileEntry) => {
    if (file.language === 'json') return <FileJson className="w-4 h-4 text-amber-400" />;
    if (file.language === 'markdown') return <BookOpen className="w-4 h-4 text-blue-400" />;
    if (file.category === 'test') return <Check className="w-4 h-4 text-emerald-400" />;
    return <FileCode className="w-4 h-4 text-cyan-400" />;
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div>
          <span className="font-semibold text-white">Explorateur du Code Source Dart Pur</span>
          <span className="text-slate-500 mx-2">·</span>
          <span>Architecture modulaire POO, interfaces, génériques & tests</span>
        </div>
        <div className="text-slate-400">
          Total : <span className="font-mono text-cyan-400 font-semibold">{DART_FILES.length} fichiers</span> prêts pour GitHub
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Sidebar - File Tree */}
        <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Arborescence du Projet</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer..."
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 w-28"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredFiles.map((file) => {
              const isSelected = file.path === selectedFile.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-950/40 border border-cyan-800/60 text-white'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getFileIcon(file)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-mono font-medium truncate">{file.path}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0 font-sans">
                        {file.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{file.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane - Code Viewer */}
        <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-lg flex flex-col overflow-hidden shadow-xl">
          {/* File Header Bar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-cyan-300">{selectedFile.path}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{selectedFile.badge}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-medium rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-400">
            {selectedFile.description}
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="w-10 pr-4 text-right text-slate-600 select-none align-top font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="text-slate-200 whitespace-pre align-top">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
