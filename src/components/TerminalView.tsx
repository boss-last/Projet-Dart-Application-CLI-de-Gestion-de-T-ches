import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Play, RotateCcw, Trash2 } from 'lucide-react';
import { CliOutputLine, DartSimulator } from '../services/dartSimulator';

interface TerminalViewProps {
  simulator: DartSimulator;
  onCommandRun?: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ simulator, onCommandRun }) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<CliOutputLine[]>([
    {
      id: 'welcome-1',
      type: 'system',
      text: 'Dart Task CLI v1.0.0 (Dart SDK 3.0.0+ / Architecture POO avancée)',
    },
    {
      id: 'welcome-2',
      type: 'system',
      text: 'Fichier local connecté : tasks.json. Tapez "help" pour voir les commandes disponibles.',
    },
    {
      id: 'welcome-3',
      type: 'output',
      text: '',
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Show prompt echo line
    const echoLine: CliOutputLine = {
      id: Math.random().toString(),
      type: 'input',
      text: `dart run bin/main.dart ${trimmed}`,
    };

    const res = simulator.executeCommand(trimmed);

    if (res.clearRequested) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, echoLine, ...res.lines]);
    }

    setInputVal('');
    if (onCommandRun) {
      onCommandRun();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(inputVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    }
  };

  const quickCommands = [
    { label: 'list', cmd: 'list' },
    { label: 'list --sort priority', cmd: 'list --sort priority' },
    { label: 'list --sort date', cmd: 'list --sort date' },
    { label: '+ add Tâche standard', cmd: 'add "Réviser le code Dart" -p medium' },
    { label: '+ add Tâche urgente', cmd: 'add "Livrer sur GitHub" --urgent --reason "Evaluation 100pts" -p high' },
    { label: 'done 2', cmd: 'done 2' },
    { label: 'stats', cmd: 'stats' },
    { label: 'help', cmd: 'help' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto p-4 sm:p-6 gap-4">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div>
          <span className="font-semibold text-white">Émulateur d'Environnement Dart CLI</span>
          <span className="text-slate-500 mx-2">·</span>
          <span>Exécute exactement la même logique métier que <code className="text-cyan-400 font-mono">dart run bin/main.dart</code></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => runCommand('clear')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Effacer l'écran</span>
          </button>
          <button
            onClick={() => runCommand('reset')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser JSON</span>
          </button>
        </div>
      </div>

      {/* Quick Command Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 shrink-0 font-mono">Exemples :</span>
        {quickCommands.map((q) => (
          <button
            key={q.label}
            onClick={() => runCommand(q.cmd)}
            className="shrink-0 px-2.5 py-1 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors font-mono"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Terminal Window */}
      <div
        className="flex-1 min-h-0 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-2xl font-mono text-xs sm:text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 text-xs text-slate-400 font-sans">bash — dart run bin/main.dart</span>
          </div>
          <div className="text-xs text-slate-500 font-sans">tasks.json lié</div>
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {lines.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} className="flex items-start gap-2 text-cyan-300 pt-1">
                  <span className="text-slate-500 select-none">$</span>
                  <span className="font-semibold">{line.text}</span>
                </div>
              );
            }
            if (line.type === 'system') {
              return (
                <div key={line.id} className="text-slate-500 italic">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'error') {
              return (
                <div key={line.id} className="text-rose-400 font-medium">
                  {line.text}
                </div>
              );
            }
            if (line.type === 'success') {
              return (
                <div key={line.id} className="text-emerald-400 font-medium">
                  {line.text}
                </div>
              );
            }
            return (
              <div key={line.id} className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {line.text}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Terminal Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2"
        >
          <span className="text-cyan-400 font-bold select-none">$</span>
          <span className="text-slate-500 text-xs hidden sm:inline select-none">dart run bin/main.dart</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez une commande (ex: list, add 'Titre' -p high, done 1, stats, help)..."
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-600 focus:outline-none focus:ring-0 text-xs sm:text-sm font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition-colors"
          >
            <span>Exécuter</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
