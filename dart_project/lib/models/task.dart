import '../exceptions/task_exceptions.dart';
import '../interfaces/json_encodable.dart';
import 'priority.dart';

/// Classe abstraite de base représentant une tâche métier.
/// Implémente l'interface [JsonEncodable] pour la sérialisation.
abstract class Task implements JsonEncodable {
  final String id;
  String title;
  Priority priority;
  DateTime? dueDate;
  bool isCompleted;
  final DateTime createdAt;

  Task({
    required this.id,
    required this.title,
    required this.priority,
    this.dueDate,
    this.isCompleted = false,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now() {
    _validate();
  }

  /// Valide les attributs de la tâche et lève une [ValidationException] si nécessaire.
  void _validate() {
    if (id.trim().isEmpty) {
      throw ValidationException('id', "L'identifiant ne peut pas être vide.");
    }
    if (title.trim().isEmpty) {
      throw ValidationException('title', 'Le titre de la tâche ne peut pas être vide.');
    }
    if (title.trim().length < 3) {
      throw ValidationException('title', 'Le titre doit contenir au moins 3 caractères.');
    }
  }

  /// Type de la tâche pour la spécialisation polymorphique.
  String get taskType;

  /// Libellé formaté pour l'affichage en console.
  String get displayTag;

  /// Indique si la tâche est en retard par rapport à l'instant présent.
  bool get isOverdue {
    if (isCompleted || dueDate == null) return false;
    return DateTime.now().isAfter(dueDate!);
  }

  /// Marque la tâche comme terminée.
  void markAsCompleted() {
    isCompleted = true;
  }

  /// Marque la tâche comme non terminée.
  void markAsPending() {
    isCompleted = false;
  }

  @override
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'priority': priority.label,
      'dueDate': dueDate?.toIso8601String(),
      'isCompleted': isCompleted,
      'createdAt': createdAt.toIso8601String(),
      'taskType': taskType,
    };
  }

  /// Fabrique polymorphique instanciant [StandardTask] ou [UrgentTask] selon les données JSON.
  static Task fromJson(Map<String, dynamic> json) {
    final type = json['taskType'] as String? ?? 'standard';
    final id = json['id'] as String? ?? '';
    final title = json['title'] as String? ?? '';
    final priorityStr = json['priority'] as String? ?? 'medium';
    final priority = Priority.fromString(priorityStr);
    final isCompleted = json['isCompleted'] as bool? ?? false;
    final dueDateStr = json['dueDate'] as String?;
    final dueDate = dueDateStr != null ? DateTime.tryParse(dueDateStr) : null;
    final createdAtStr = json['createdAt'] as String?;
    final createdAt = createdAtStr != null ? DateTime.tryParse(createdAtStr) : null;

    if (type == 'urgent') {
      final escalationReason = json['escalationReason'] as String? ?? 'Priorité critique';
      return UrgentTask(
        id: id,
        title: title,
        priority: priority,
        dueDate: dueDate,
        isCompleted: isCompleted,
        createdAt: createdAt,
        escalationReason: escalationReason,
      );
    }

    return StandardTask(
      id: id,
      title: title,
      priority: priority,
      dueDate: dueDate,
      isCompleted: isCompleted,
      createdAt: createdAt,
    );
  }

  @override
  String toString() {
    final status = isCompleted ? '[FAIT]' : (isOverdue ? '[RETARD]' : '[À FAIRE]');
    final due = dueDate != null ? " (Échéance: ${dueDate!.toLocal().toString().split(' ')[0]})" : '';
    return '$status $displayTag #$id: $title [${priority.displayLabel}]$due';
  }
}

/// Spécialisation pour les tâches régulières.
class StandardTask extends Task {
  StandardTask({
    required super.id,
    required super.title,
    super.priority = Priority.medium,
    super.dueDate,
    super.isCompleted = false,
    super.createdAt,
  });

  @override
  String get taskType => 'standard';

  @override
  String get displayTag => '[STANDARD]';
}

/// Spécialisation pour les tâches urgentes avec motif d'escalade.
class UrgentTask extends Task {
  final String escalationReason;

  UrgentTask({
    required super.id,
    required super.title,
    super.priority = Priority.high,
    super.dueDate,
    super.isCompleted = false,
    super.createdAt,
    this.escalationReason = 'Intervention immédiate requise',
  });

  @override
  String get taskType => 'urgent';

  @override
  String get displayTag => '[URGENT]';

  @override
  Map<String, dynamic> toJson() {
    final base = super.toJson();
    base['escalationReason'] = escalationReason;
    return base;
  }
}
