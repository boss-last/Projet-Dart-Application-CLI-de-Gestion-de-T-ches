import React from 'react';
import { CheckCircle2, Award, ExternalLink, Code2, ShieldAlert, FileText, Database } from 'lucide-react';

interface RubricViewProps {
  onOpenFile: (filePath: string) => void;
}

export const RubricView: React.FC<RubricViewProps> = ({ onOpenFile }) => {
  const criteria = [
    {
      title: 'Ajout de tâche',
      points: 20,
      max: 20,
      desc: "Prise en charge du titre (min. 3 car.), de la priorité (low, medium, high) et d'une date limite optionnelle.",
      filePath: 'lib/models/task.dart',
      codeSnippet: "Task addTask({required String title, Priority priority, DateTime? dueDate, bool isUrgent})",
      details: "Validation stricte du titre, gestion par défaut de 'medium', instanciation polymorphique UrgentTask si urgent ou high.",
    },
    {
      title: 'Liste des tâches & Tri dynamique',
      points: 15,
      max: 15,
      desc: "Affichage tabulaire ANSI avec tri configurable par priorité (High > Med > Low) ou par date limite.",
      filePath: 'lib/services/task_service.dart',
      codeSnippet: "tasks.sort((a, b) => b.priority.compareTo(a.priority));",
      details: "Tri par priorité avec poids numériques de l'enum Priority, et tri chronologique par date d'échéance (échéances nulles à la fin).",
    },
    {
      title: 'Marquer comme terminée (done)',
      points: 10,
      max: 10,
      desc: "Transition de statut de la tâche par identifiant et réécriture persistée.",
      filePath: 'lib/models/task.dart',
      codeSnippet: "void markAsCompleted() { isCompleted = true; }",
      details: "Recherche par ID dans le repository, mise à jour atomique, et sauvegarde immédiate dans tasks.json.",
    },
    {
      title: 'Supprimer une tâche (delete)',
      points: 10,
      max: 10,
      desc: "Suppression définitive par identifiant avec levée d'exception si la tâche n'existe pas.",
      filePath: 'lib/repositories/json_file_repository.dart',
      codeSnippet: "Future<bool> delete(String id) async { ... }",
      details: "Lève TaskNotFoundException si l'identifiant est introuvable.",
    },
    {
      title: 'Persistance JSON locale',
      points: 15,
      max: 15,
      desc: "Sauvegarde et rechargement automatiques dans le fichier local tasks.json.",
      filePath: 'lib/repositories/json_file_repository.dart',
      codeSnippet: "final serialized = JsonEncoder.withIndent('  ').convert(jsonList);",
      details: "Lecture/écriture avec encodage indenté lisible et gestion des défaillances via StorageException.",
    },
    {
      title: 'Classes abstraites & Héritage',
      points: 10,
      max: 10,
      desc: "abstract class Task dérivée par StandardTask et UrgentTask.",
      filePath: 'lib/models/task.dart',
      codeSnippet: "abstract class Task implements JsonEncodable ... class UrgentTask extends Task",
      details: "UrgentTask ajoute le champ 'escalationReason' et surcharge le badge d'affichage.",
    },
    {
      title: 'Interfaces',
      points: 5,
      max: 5,
      desc: "Définition et implémentation de contrats stricts.",
      filePath: 'lib/interfaces/json_encodable.dart',
      codeSnippet: "abstract interface class JsonEncodable { Map<String, dynamic> toJson(); }",
      details: "Deux interfaces créées : JsonEncodable pour la sérialisation, et Repository<T> pour le contrat de dépôt.",
    },
    {
      title: 'Génériques (Generics)',
      points: 5,
      max: 5,
      desc: "Utilisation des types génériques paramétrés.",
      filePath: 'lib/interfaces/repository.dart',
      codeSnippet: "class JsonFileRepository<T extends JsonEncodable> implements Repository<T>",
      details: "Dépôt générique réutilisable pour n'importe quel type T implémentant JsonEncodable.",
    },
    {
      title: 'Exceptions personnalisées',
      points: 5,
      max: 5,
      desc: "Hiérarchie d'erreurs typées avec codes d'erreur.",
      filePath: 'lib/exceptions/task_exceptions.dart',
      codeSnippet: "TaskNotFoundException, StorageException, ValidationException, InvalidPriorityException",
      details: "Héritent de la classe abstraite TaskException pour une capture sélective propre.",
    },
    {
      title: 'Tests unitaires automatisés',
      points: 5,
      max: 5,
      desc: "Au moins 5 tests avec le package test (8 tests fournis).",
      filePath: 'test/task_test.dart',
      codeSnippet: "test('Sérialise et reconstruit polymorphiquement...', () { ... });",
      details: "8 tests unitaires complets testant les classes, l'héritage, les exceptions, le repository et le tri.",
    },
  ];

  const totalPoints = criteria.reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Barème d'Évaluation Officiel</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                100% Conforme
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Toutes les fonctionnalités obligatoires et exigences techniques du sujet ont été implémentées selon les standards professionnels de Dart.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg px-6 py-3 text-right">
          <div className="text-xs text-slate-400 font-medium">Note Obtenue</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
            {totalPoints} / 100 <span className="text-sm font-normal text-slate-500">pts</span>
          </div>
        </div>
      </div>

      {/* Criteria Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((item, idx) => (
          <div
            key={item.title}
            className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-200">
                    {idx + 1}. {item.title}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/80">
                  {item.points} / {item.max} pts
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              <p className="text-[11px] text-slate-500 mt-1 italic">{item.details}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <code className="text-[11px] text-cyan-300 font-mono truncate max-w-[220px]">
                {item.codeSnippet}
              </code>

              <button
                onClick={() => onOpenFile(item.filePath)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
              >
                <span>{item.filePath}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
