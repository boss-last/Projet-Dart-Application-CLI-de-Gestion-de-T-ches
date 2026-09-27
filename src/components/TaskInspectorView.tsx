import React, { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, Copy, Check, FileJson, AlertTriangle } from 'lucide-react';
import { PriorityLevel, TaskItem } from '../types/task';
import { DartSimulator } from '../services/dartSimulator';

interface TaskInspectorViewProps {
  simulator: DartSimulator;
  tasks: TaskItem[];
  onTasksUpdate: () => void;
}

export const TaskInspectorView: React.FC<TaskInspectorViewProps> = ({
  simulator,
  tasks,
  onTasksUpdate,
}) => {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [formError, setFormError] = useState('');

  const jsonString = JSON.stringify(tasks, null, 2);

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleDone = (id: string, currentlyDone: boolean) => {
    if (currentlyDone) {
      // Toggle back to pending
      const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: false } : t));
      simulator.setTasks(updated);
    } else {
      simulator.executeCommand(`done ${id}`);
    }
    onTasksUpdate();
  };

  const handleDelete = (id: string) => {
    simulator.executeCommand(`delete ${id}`);
    onTasksUpdate();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Le titre est obligatoire (minimum 3 caractères).');
      return;
    }
    if (newTitle.trim().length < 3) {
      setFormError('Le titre doit contenir au moins 3 caractères (règle Task._validate()).');
      return;
    }

    let cmd = `add "${newTitle.trim()}" --priority ${newPriority}`;
    if (newDueDate) {
      cmd += ` --due ${newDueDate}`;
    }
    if (isUrgent || newPriority === 'high') {
      cmd += ` --urgent`;
      if (escalationReason.trim()) {
        cmd += ` --reason "${escalationReason.trim()}"`;
      }
    }

    simulator.executeCommand(cmd);
    onTasksUpdate();

    // Reset form
    setNewTitle('');
    setNewPriority('medium');
    setNewDueDate('');
    setIsUrgent(false);
    setEscalationReason('');
    setFormError('');
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'done') return t.isCompleted;
    if (filter === 'pending') return !t.isCompleted;
    return true;
  });

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'low':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Gestionnaire Visuel & tasks.json</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
              Persistance Locale Synchronisée
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Les modifications effectuées ici mettent immédiatement à jour le fichier <code className="text-cyan-300">tasks.json</code> et vice-versa.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm shadow-cyan-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Tâche</span>
        </button>
      </div>

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Task Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Segmented Filter Control */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Toutes ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filter === 'pending'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                En cours ({tasks.filter((t) => !t.isCompleted).length})
              </button>
              <button
                onClick={() => setFilter('done')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filter === 'done'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Terminées ({tasks.filter((t) => t.isCompleted).length})
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-lg text-slate-500 text-xs">
              Aucune tâche ne correspond à ce filtre.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isOverdue =
                  !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                      task.isCompleted
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleDone(task.id, task.isCompleted)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                        title={task.isCompleted ? 'Marquer comme non terminée' : 'Marquer comme terminée (done)'}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-500 font-semibold">
                            #{task.id}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              task.isCompleted
                                ? 'line-through text-slate-500'
                                : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <span
                            className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-mono font-medium ${getPriorityStyle(
                              task.priority,
                            )}`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-slate-600">·</span>

                          <span
                            className={`font-mono ${
                              task.taskType === 'urgent'
                                ? 'text-rose-400 font-semibold'
                                : 'text-slate-400'
                            }`}
                          >
                            {task.taskType === 'urgent' ? 'UrgentTask' : 'StandardTask'}
                          </span>

                          {task.dueDate && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span
                                className={`font-mono ${
                                  isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'
                                }`}
                              >
                                Échéance : {task.dueDate.split('T')[0]} {isOverdue && '(Retard)'}
                              </span>
                            </>
                          )}
                        </div>

                        {task.escalationReason && (
                          <div className="mt-1 text-[11px] text-rose-300/80 font-mono">
                            ⚠ Motif : {task.escalationReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      title="Supprimer la tâche (delete)"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live tasks.json File Inspector */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">tasks.json</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                {tasks.length} entrées
              </span>
            </div>

            <button
              onClick={handleCopyJson}
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
                  <span>Copier JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-900/30 border-b border-slate-800/50 text-[11px] text-slate-400">
            Sérialisé par <code className="text-cyan-300">JsonFileRepository&lt;Task&gt;.saveAll()</code>
          </div>

          <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-cyan-200/90 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            {jsonString}
          </pre>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-3">Ajouter une nouvelle tâche (CLI `add`)</h3>

            {formError && (
              <div className="mb-3 p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Titre de la tâche (obligatoire, min. 3 car.) :
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Préparer la démonstration technique"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Priorité :</label>
                <select
                  value={newPriority}
                  onChange={(e) => {
                    const p = e.target.value as PriorityLevel;
                    setNewPriority(p);
                    if (p === 'high') setIsUrgent(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Basse (low)</option>
                  <option value="medium">Moyenne (medium)</option>
                  <option value="high">Haute (high - instancie UrgentTask)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date limite optionnelle :</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-600 focus:ring-0"
                  />
                  <span>Tâche urgente (classe dérivée <code className="text-cyan-400">UrgentTask</code>)</span>
                </label>
              </div>

              {isUrgent && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Raison de l'urgence :</label>
                  <input
                    type="text"
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder="Ex: Incident de production en cours"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                >
                  Ajouter la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
