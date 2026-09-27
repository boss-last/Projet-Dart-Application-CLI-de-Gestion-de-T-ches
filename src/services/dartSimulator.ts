import { PriorityLevel, TaskItem } from '../types/task';

export interface CliOutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
}

export const INITIAL_TASKS: TaskItem[] = [
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

export class DartSimulator {
  private tasks: TaskItem[];
  private onTasksChange?: (tasks: TaskItem[]) => void;

  constructor(initialTasks?: TaskItem[], onTasksChange?: (tasks: TaskItem[]) => void) {
    this.tasks = initialTasks ? [...initialTasks] : [...INITIAL_TASKS];
    this.onTasksChange = onTasksChange;
  }

  public getTasks(): TaskItem[] {
    return [...this.tasks];
  }

  public setTasks(newTasks: TaskItem[]): void {
    this.tasks = [...newTasks];
    if (this.onTasksChange) {
      this.onTasksChange(this.tasks);
    }
  }

  public resetTasks(): void {
    this.setTasks(INITIAL_TASKS);
  }

  private generateNextId(): string {
    if (this.tasks.length === 0) return '1';
    const numericIds = this.tasks
      .map((t) => parseInt(t.id, 10))
      .filter((n) => !isNaN(n));
    if (numericIds.length === 0) return (this.tasks.length + 1).toString();
    const max = Math.max(...numericIds);
    return (max + 1).toString();
  }

  public executeCommand(rawCommand: string): { lines: CliOutputLine[]; clearRequested?: boolean } {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return { lines: [] };
    }

    if (trimmed === 'clear') {
      return { lines: [], clearRequested: true };
    }

    // Strip "dart run bin/main.dart" or "dart bin/main.dart" or "dart run" if user typed it
    let clean = trimmed;
    if (clean.startsWith('dart run bin/main.dart ')) {
      clean = clean.replace('dart run bin/main.dart ', '');
    } else if (clean.startsWith('dart run ')) {
      clean = clean.replace('dart run ', '');
    } else if (clean.startsWith('dart bin/main.dart ')) {
      clean = clean.replace('dart bin/main.dart ', '');
    }

    const tokens = this.tokenize(clean);
    if (tokens.length === 0) {
      return { lines: [] };
    }

    const command = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    try {
      switch (command) {
        case 'help':
        case '--help':
        case '-h':
          return { lines: this.cmdHelp() };

        case 'add':
          return { lines: this.cmdAdd(args) };

        case 'list':
        case 'ls':
          return { lines: this.cmdList(args) };

        case 'done':
        case 'complete':
          return { lines: this.cmdDone(args) };

        case 'delete':
        case 'rm':
        case 'remove':
          return { lines: this.cmdDelete(args) };

        case 'stats':
          return { lines: this.cmdStats() };

        case 'reset':
          this.resetTasks();
          return {
            lines: [
              {
                id: Math.random().toString(),
                type: 'success',
                text: '✔ Fichier de stockage tasks.json réinitialisé aux 4 tâches de démonstration.',
              },
            ],
          };

        default:
          return {
            lines: [
              {
                id: Math.random().toString(),
                type: 'error',
                text: `Erreur: Commande inconnue "${command}". Tapez "help" pour consulter les commandes valides.`,
              },
            ],
          };
      }
    } catch (e: any) {
      return {
        lines: [
          {
            id: Math.random().toString(),
            type: 'error',
            text: `ERREUR DART: ${e.message || String(e)}`,
          },
        ],
      };
    }
  }

  private tokenize(str: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(str)) !== null) {
      if (match[1] !== undefined) {
        tokens.push(match[1]);
      } else if (match[2] !== undefined) {
        tokens.push(match[2]);
      } else {
        tokens.push(match[0]);
      }
    }
    return tokens;
  }

  private cmdHelp(): CliOutputLine[] {
    return [
      {
        id: Math.random().toString(),
        type: 'output',
        text: '================================================================',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  DART TASK CLI — Gestionnaire de Tâches en Ligne de Commande',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '================================================================',
      },
      { id: Math.random().toString(), type: 'output', text: 'COMMANDES DISPONIBLES :' },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  add <titre>                Ajouter une tâche',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '      --priority, -p <level> low | medium | high (défaut: medium)',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '      --due, -d <YYYY-MM-DD> Date limite optionnelle (ex: 2026-10-31)',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '      --urgent, -u           Instancier une UrgentTask',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '      --reason <texte>       Raison de l\'urgence',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  list                       Lister les tâches (--sort priority|date, --filter pending|done)',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  done <id>                  Marquer une tâche comme terminée',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  delete <id>                Supprimer définitivement une tâche',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  stats                      Afficher le récapitulatif des tâches',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  reset                      Réinitialiser le fichier JSON de test',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '  clear                      Effacer l\'écran du terminal',
      },
    ];
  }

  private cmdAdd(args: string[]): CliOutputLine[] {
    if (args.length === 0) {
      throw new Error(
        "[VALIDATION_ERROR] Validation échouée pour 'title': Le titre de la tâche ne peut pas être vide.",
      );
    }

    let priority: PriorityLevel = 'medium';
    let dueDate: string | null = null;
    let isUrgent = false;
    let escalationReason: string | undefined;
    const titleParts: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--priority' || arg === '-p') {
        const val = args[++i]?.toLowerCase();
        if (!val || !['low', 'medium', 'high'].includes(val)) {
          throw new Error(
            `[INVALID_PRIORITY] Valeur de priorité invalide: '${val}'. Valeurs acceptées: low, medium, high.`,
          );
        }
        priority = val as PriorityLevel;
      } else if (arg === '--due' || arg === '-d') {
        const rawDate = args[++i];
        if (!rawDate || isNaN(Date.parse(rawDate))) {
          throw new Error(
            `[VALIDATION_ERROR] Validation échouée pour 'due': Format de date invalide '${rawDate}'. Utilisez YYYY-MM-DD.`,
          );
        }
        dueDate = new Date(rawDate).toISOString();
      } else if (arg === '--urgent' || arg === '-u') {
        isUrgent = true;
      } else if (arg === '--reason') {
        escalationReason = args[++i];
        isUrgent = true;
      } else if (!arg.startsWith('-')) {
        titleParts.push(arg);
      }
    }

    const title = titleParts.join(' ').trim();
    if (!title) {
      throw new Error(
        "[VALIDATION_ERROR] Validation échouée pour 'title': Le titre de la tâche ne peut pas être vide.",
      );
    }

    if (title.length < 3) {
      throw new Error(
        "[VALIDATION_ERROR] Validation échouée pour 'title': Le titre doit contenir au moins 3 caractères.",
      );
    }

    if (priority === 'high') {
      isUrgent = true;
    }

    const nextId = this.generateNextId();
    const newTask: TaskItem = {
      id: nextId,
      title,
      priority,
      dueDate,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      taskType: isUrgent ? 'urgent' : 'standard',
      escalationReason: isUrgent
        ? escalationReason || 'Priorité critique définie à la création'
        : undefined,
    };

    const updated = [...this.tasks, newTask];
    this.setTasks(updated);

    const dueFormatted = dueDate ? dueDate.split('T')[0] : 'Aucune';
    const lines: CliOutputLine[] = [
      {
        id: Math.random().toString(),
        type: 'success',
        text: `✔ Succès : ${newTask.taskType === 'urgent' ? 'UrgentTask' : 'StandardTask'} #${nextId} enregistrée dans tasks.json!`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  • Titre    : ${newTask.title}`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  • Priorité : ${newTask.priority.toUpperCase()} (${newTask.taskType})`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  • Échéance : ${dueFormatted}`,
      },
    ];

    if (newTask.escalationReason) {
      lines.push({
        id: Math.random().toString(),
        type: 'output',
        text: `  • Escalade : ${newTask.escalationReason}`,
      });
    }

    return lines;
  }

  private cmdList(args: string[]): CliOutputLine[] {
    let sortBy = 'priority';
    let filter: 'all' | 'pending' | 'done' = 'all';

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--sort' || arg === '-s') {
        sortBy = args[++i]?.toLowerCase() || 'priority';
      } else if (arg === '--filter' || arg === '-f') {
        const val = args[++i]?.toLowerCase();
        if (val === 'done' || val === 'completed') filter = 'done';
        if (val === 'pending' || val === 'todo') filter = 'pending';
      }
    }

    let list = [...this.tasks];

    if (filter === 'done') {
      list = list.filter((t) => t.isCompleted);
    } else if (filter === 'pending') {
      list = list.filter((t) => !t.isCompleted);
    }

    if (list.length === 0) {
      return [
        {
          id: Math.random().toString(),
          type: 'output',
          text: 'Aucune tâche correspondant aux critères.',
        },
      ];
    }

    // Sort logic
    if (sortBy === 'priority' || sortBy === 'p') {
      const weights: Record<PriorityLevel, number> = { high: 3, medium: 2, low: 1 };
      list.sort((a, b) => {
        const diff = weights[b.priority] - weights[a.priority];
        if (diff !== 0) return diff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } else if (sortBy === 'date' || sortBy === 'due' || sortBy === 'd') {
      list.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    const lines: CliOutputLine[] = [
      {
        id: Math.random().toString(),
        type: 'output',
        text: `LISTE DES TÂCHES (Total: ${list.length}, Tri: ${sortBy.toUpperCase()})`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '--------------------------------------------------------------------------------',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: 'ID   STATUT    TYPE       PRIORITÉ   ÉCHÉANCE       TITRE',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: '--------------------------------------------------------------------------------',
      },
    ];

    const now = new Date();
    for (const t of list) {
      const idCol = t.id.padEnd(4, ' ');
      const isOverdue = !t.isCompleted && t.dueDate && new Date(t.dueDate) < now;
      const statusCol = t.isCompleted ? '[FAIT]  ' : isOverdue ? '[RETARD]' : '[EN CRS]';
      const typeCol = t.taskType === 'urgent' ? 'URGENT   ' : 'Standard ';
      const prioCol = t.priority.toUpperCase().padEnd(10, ' ');
      const dueCol = t.dueDate ? t.dueDate.split('T')[0].padEnd(14, ' ') : '--            ';

      lines.push({
        id: Math.random().toString(),
        type: t.isCompleted ? 'success' : isOverdue ? 'error' : 'output',
        text: `${idCol} ${statusCol} ${typeCol} ${prioCol} ${dueCol} ${t.title}`,
      });
    }

    lines.push({
      id: Math.random().toString(),
      type: 'output',
      text: '--------------------------------------------------------------------------------',
    });

    return lines;
  }

  private cmdDone(args: string[]): CliOutputLine[] {
    if (args.length === 0) {
      throw new Error(
        "[VALIDATION_ERROR] Identifiant requis: tapez 'done <id>' (ex: 'done 1')",
      );
    }

    const id = args[0];
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`[TASK_NOT_FOUND] Aucune tâche trouvée avec l'identifiant: #${id}`);
    }

    const target = this.tasks[index];
    const updatedTask = { ...target, isCompleted: true };
    const newTasks = [...this.tasks];
    newTasks[index] = updatedTask;
    this.setTasks(newTasks);

    return [
      {
        id: Math.random().toString(),
        type: 'success',
        text: `✔ Tâche #${id} "${target.title}" marquée comme TERMINÉE!`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  Mise à jour persistée dans tasks.json.`,
      },
    ];
  }

  private cmdDelete(args: string[]): CliOutputLine[] {
    if (args.length === 0) {
      throw new Error(
        "[VALIDATION_ERROR] Identifiant requis: tapez 'delete <id>' (ex: 'delete 2')",
      );
    }

    const id = args[0];
    const target = this.tasks.find((t) => t.id === id);
    if (!target) {
      throw new Error(`[TASK_NOT_FOUND] Aucune tâche trouvée avec l'identifiant: #${id}`);
    }

    const filtered = this.tasks.filter((t) => t.id !== id);
    this.setTasks(filtered);

    return [
      {
        id: Math.random().toString(),
        type: 'success',
        text: `✔ Tâche #${id} "${target.title}" supprimée définitivement du stockage local.`,
      },
    ];
  }

  private cmdStats(): CliOutputLine[] {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const now = new Date();
    const overdue = this.tasks.filter(
      (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < now,
    ).length;
    const urgent = this.tasks.filter((t) => t.taskType === 'urgent').length;

    return [
      {
        id: Math.random().toString(),
        type: 'output',
        text: 'TABLEAU DE BORD DES TÂCHES (tasks.json) :',
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  • Total des tâches : ${total}`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  • En cours         : ${pending}`,
      },
      {
        id: Math.random().toString(),
        type: 'success',
        text: `  • Terminées        : ${completed}`,
      },
      {
        id: Math.random().toString(),
        type: overdue > 0 ? 'error' : 'output',
        text: `  • En retard        : ${overdue}`,
      },
      {
        id: Math.random().toString(),
        type: 'output',
        text: `  • Tâches urgentes  : ${urgent}`,
      },
    ];
  }
}
