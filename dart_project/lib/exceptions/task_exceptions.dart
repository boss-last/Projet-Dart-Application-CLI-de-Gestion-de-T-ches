/// Exception de base pour toutes les erreurs liées à l'application de tâches.
abstract class TaskException implements Exception {
  final String message;
  final String? code;

  const TaskException(this.message, {this.code});

  @override
  String toString() => code != null ? '[$code] $message' : message;
}

/// Déclenchée lorsqu'une tâche recherchée n'existe pas.
class TaskNotFoundException extends TaskException {
  final String taskId;

  TaskNotFoundException(this.taskId)
      : super("Aucune tâche trouvée avec l'identifiant: #$taskId", code: 'TASK_NOT_FOUND');
}

/// Déclenchée lors d'une défaillance de lecture ou d'écriture du fichier de stockage JSON.
class StorageException extends TaskException {
  final Object? cause;

  StorageException(String message, {this.cause})
      : super(message, code: 'STORAGE_ERROR');
}

/// Déclenchée lorsque les données fournies pour une tâche ne respectent pas les règles métier.
class ValidationException extends TaskException {
  final String field;

  ValidationException(this.field, String message)
      : super("Validation échouée pour '$field': $message", code: 'VALIDATION_ERROR');
}

/// Déclenchée lorsqu'une priorité textuelle invalide est transmise.
class InvalidPriorityException extends TaskException {
  InvalidPriorityException(String message)
      : super(message, code: 'INVALID_PRIORITY');
}
