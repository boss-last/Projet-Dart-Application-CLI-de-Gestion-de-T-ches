import '../exceptions/task_exceptions.dart';
import '../interfaces/repository.dart';
import '../models/priority.dart';
import '../models/task.dart';

/// Service métier gérant les opérations de gestion de tâches.
class TaskService {
  final Repository<Task> _repository;

  TaskService(this._repository);

  /// Génère un nouvel identifiant numérique unique basé sur les identifiants existants.
  Future<String> _generateNextId() async {
    final tasks = await _repository.getAll();
    if (tasks.isEmpty) return '1';
    final numericIds = tasks
        .map((t) => int.tryParse(t.id))
        .where((id) => id != null)
        .cast<int>()
        .toList();
    if (numericIds.isEmpty) return (tasks.length + 1).toString();
    numericIds.sort();
    return (numericIds.last + 1).toString();
  }

  /// Ajoute une nouvelle tâche (standard ou urgente).
  Future<Task> addTask({
    required String title,
    Priority priority = Priority.medium,
    DateTime? dueDate,
    bool isUrgent = false,
    String? escalationReason,
  }) async {
    final cleanTitle = title.trim();
    if (cleanTitle.isEmpty) {
      throw ValidationException('title', 'Le titre de la tâche est obligatoire.');
    }

    final id = await _generateNextId();

    final Task task;
    if (isUrgent || priority == Priority.high) {
      task = UrgentTask(
        id: id,
        title: cleanTitle,
        priority: priority,
        dueDate: dueDate,
        escalationReason: escalationReason ?? 'Priorité critique définie à la création',
      );
    } else {
      task = StandardTask(
        id: id,
        title: cleanTitle,
        priority: priority,
        dueDate: dueDate,
      );
    }

    await _repository.add(task);
    return task;
  }

  /// Liste toutes les tâches avec tri configurable (par priorité, par date d'échéance ou par création).
  Future<List<Task>> listTasks({String sortBy = 'priority', bool? completedFilter}) async {
    var tasks = await _repository.getAll();

    if (completedFilter != null) {
      tasks = tasks.where((t) => t.isCompleted == completedFilter).toList();
    }

    switch (sortBy.toLowerCase()) {
      case 'priority':
      case 'p':
        tasks.sort((a, b) {
          // Plus haute priorité d'abord (High > Medium > Low)
          final comp = b.priority.compareTo(a.priority);
          if (comp != 0) return comp;
          return a.createdAt.compareTo(b.createdAt);
        });
        break;

      case 'date':
      case 'due':
      case 'd':
        tasks.sort((a, b) {
          // Dates les plus proches d'abord, les tâches sans échéance en dernier
          if (a.dueDate == null && b.dueDate == null) return 0;
          if (a.dueDate == null) return 1;
          if (b.dueDate == null) return -1;
          return a.dueDate!.compareTo(b.dueDate!);
        });
        break;

      case 'created':
      case 'id':
      default:
        tasks.sort((a, b) => a.createdAt.compareTo(b.createdAt));
        break;
    }

    return tasks;
  }

  /// Récupère une tâche par son identifiant unique.
  Future<Task> getTask(String id) async {
    final task = await _repository.getById(id);
    if (task == null) {
      throw TaskNotFoundException(id);
    }
    return task;
  }

  /// Marque une tâche comme terminée.
  Future<Task> markAsCompleted(String id) async {
    final task = await getTask(id);
    task.markAsCompleted();
    await _repository.update(task);
    return task;
  }

  /// Supprime une tâche par son identifiant.
  Future<void> deleteTask(String id) async {
    final success = await _repository.delete(id);
    if (!success) {
      throw TaskNotFoundException(id);
    }
  }

  /// Calcule les métriques globales de suivi.
  Future<Map<String, int>> getStats() async {
    final tasks = await _repository.getAll();
    final total = tasks.length;
    final completed = tasks.where((t) => t.isCompleted).length;
    final pending = total - completed;
    final overdue = tasks.where((t) => t.isOverdue).length;
    final urgent = tasks.whereType<UrgentTask>().length;

    return {
      'total': total,
      'completed': completed,
      'pending': pending,
      'overdue': overdue,
      'urgent': urgent,
    };
  }
}
