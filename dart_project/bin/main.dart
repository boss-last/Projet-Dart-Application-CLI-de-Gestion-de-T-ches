import 'package:path/path.dart' as p;

import '../lib/cli/cli_parser.dart';
import '../lib/models/task.dart';
import '../lib/repositories/json_file_repository.dart';
import '../lib/services/task_service.dart';

void main(List<String> arguments) async {
  // Chemin de stockage local JSON
  final storagePath = p.join(
    p.current,
    'tasks.json',
  );

  // Instanciation avec le dépôt générique JsonFileRepository<Task>
  final repository = JsonFileRepository<Task>(
    filePath: storagePath,
    fromJson: (json) => Task.fromJson(json),
    idSelector: (task) => task.id,
  );

  // Couche service métier
  final service = TaskService(repository);

  // Interface CLI
  final cliRunner = CliRunner(service);

  await cliRunner.execute(arguments);
}
