/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TerminalView } from './components/TerminalView';
import { CodeExplorer } from './components/CodeExplorer';
import { TestRunnerView } from './components/TestRunnerView';
import { TaskInspectorView } from './components/TaskInspectorView';
import { RubricView } from './components/RubricView';
import { DartSimulator } from './services/dartSimulator';
import { TaskItem } from './types/task';
import { DART_FILES } from './data/dartCodeFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'code' | 'tests' | 'tasks' | 'rubric'>('terminal');
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    // Try restoring from localStorage if available
    try {
      const saved = localStorage.getItem('dart_cli_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: '1',
        title: 'Valider les exigences du sujet Dart CLI',
        priority: 'high',
        dueDate: '2026-10-01T00:00:00.000Z',
        isCompleted: true,
        createdAt: '2026-09-27T10:00:00.000Z',
        taskType: 'urgent',
        escalationReason: "Échéance d'évaluation académique (100 pts)",
      },
      {
        id: '2',
        title: 'Implémenter le Repository générique et la persistance JSON',
        priority: 'high',
        dueDate: '2026-10-05T00:00:00.000Z',
        isCompleted: false,
        createdAt: '2026-09-27T11:15:00.000Z',
        taskType: 'urgent',
        escalationReason: 'Exigence technique obligatoire',
      },
      {
        id: '3',
        title: 'Rédiger les 5+ tests unitaires avec package test',
        priority: 'medium',
        dueDate: '2026-10-10T00:00:00.000Z',
        isCompleted: false,
        createdAt: '2026-09-27T12:00:00.000Z',
        taskType: 'standard',
      },
      {
        id: '4',
        title: 'Créer le README détaillé avec les commandes',
        priority: 'low',
        dueDate: null,
        isCompleted: false,
        createdAt: '2026-09-27T12:30:00.000Z',
        taskType: 'standard',
      },
    ];
  });

  const simulator = useMemo(() => {
    return new DartSimulator(tasks, (newTasks) => {
      setTasks([...newTasks]);
      try {
        localStorage.setItem('dart_cli_tasks', JSON.stringify(newTasks));
      } catch {
        // ignore
      }
    });
  }, []);

  const handleOpenFile = (filePath: string) => {
    setActiveTab('code');
  };

  const handleRunTests = () => {
    setActiveTab('tests');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunTests={handleRunTests}
      />

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'terminal' && (
          <TerminalView
            simulator={simulator}
            onCommandRun={() => setTasks(simulator.getTasks())}
          />
        )}

        {activeTab === 'code' && <CodeExplorer />}

        {activeTab === 'tests' && <TestRunnerView />}

        {activeTab === 'tasks' && (
          <TaskInspectorView
            simulator={simulator}
            tasks={tasks}
            onTasksUpdate={() => setTasks(simulator.getTasks())}
          />
        )}

        {activeTab === 'rubric' && <RubricView onOpenFile={handleOpenFile} />}
      </main>
    </div>
  );
}
