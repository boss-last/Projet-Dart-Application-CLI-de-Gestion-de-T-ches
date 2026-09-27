import 'dart:io';

import '../exceptions/task_exceptions.dart';
import '../models/priority.dart';
import '../models/task.dart';
import '../services/task_service.dart';
import 'ansi_colors.dart';

/// Gestionnaire d'exécution CLI fournissant les commandes et l'affichage formaté.
class CliRunner {
  final TaskService _service;

  CliRunner(this._service);

  /// Affiche l'aide et les commandes disponibles.
  void printHelp() {
    stdout.writeln('''
${Ansi.bold}${Ansi.cyan}================================================================${Ansi.reset}
${Ansi.bold}  DART TASK CLI — Gestionnaire de Tâches en Ligne de Commande${Ansi.reset}
${Ansi.bold}${Ansi.cyan}================================================================${Ansi.reset}

${Ansi.bold}USAGE:${Ansi.reset}
  dart run bin/main.dart <commande> [options]

${Ansi.bold}COMMANDES DISPONIBLES:${Ansi.reset}
  ${Ansi.cyan}add${Ansi.reset} <titre>                Ajouter une tâche
      ${Ansi.dim}--priority, -p <level>${Ansi.reset}  low | medium | high (défaut: medium)
      ${Ansi.dim}--due, -d <YYYY-MM-DD>${Ansi.reset}  Date limite optionnelle (ex: 2026-10-31)
      ${Ansi.dim}--urgent, -u${Ansi.reset}            Créer une tâche urgente (UrgentTask)
      ${Ansi.dim}--reason <texte>${Ansi.reset}        Raison de l'urgence

  ${Ansi.cyan}list${Ansi.reset} [options]             Lister toutes les tâches
      ${Ansi.dim}--sort, -s <critère>${Ansi.reset}    Tri: priority | date | created (défaut: priority)
      ${Ansi.dim}--filter, -f <état>${Ansi.reset}    Filtre: pending | done | all (défaut: all)

  ${Ansi.cyan}done${Ansi.reset} <id>                  Marquer une tâche comme terminée

  ${Ansi.cyan}delete${Ansi.reset} <id>                Supprimer définitivement une tâche

  ${Ansi.cyan}stats${Ansi.reset}                      Afficher les statistiques du tableau de bord

  ${Ansi.cyan}interactive${Ansi.reset}               Lancer le mode interactif guidé

  ${Ansi.cyan}help${Ansi.reset}                       Afficher cette documentation
''');
  }

  /// Exécute la commande transmise sous forme de liste d'arguments.
  Future<void> execute(List<String> args) async {
    if (args.isEmpty || args.first == 'help' || args.first == '--help' || args.first == '-h') {
      printHelp();
      return;
    }

    final command = args.first.toLowerCase();
    final subArgs = args.sublist(1);

    try {
      switch (command) {
        case 'add':
          await _handleAdd(subArgs);
          break;
        case 'list':
        case 'ls':
          await _handleList(subArgs);
          break;
        case 'done':
        case 'complete':
          await _handleDone(subArgs);
          break;
        case 'delete':
        case 'rm':
        case 'remove':
          await _handleDelete(subArgs);
          break;
        case 'stats':
          await _handleStats();
          break;
        case 'interactive':
          await runInteractiveLoop();
          break;
        default:
          stderr.writeln(
            '${Ansi.red}Erreur: Commande inconnue "$command". Tapez "help" pour la liste des commandes.${Ansi.reset}',
          );
      }
    } on TaskException catch (e) {
      stderr.writeln('${Ansi.red}ERREUR [${e.code ?? 'APP'}]: ${e.message}${Ansi.reset}');
    } catch (e) {
      stderr.writeln('${Ansi.red}ERREUR INATTENDUE: $e${Ansi.reset}');
    }
  }

  Future<void> _handleAdd(List<String> args) async {
    if (args.isEmpty) {
      throw ValidationException('titre', 'Veuillez spécifier le titre de la tâche.');
    }

    String title = '';
    Priority priority = Priority.medium;
    DateTime? dueDate;
    bool isUrgent = false;
    String? reason;

    final nonFlagParts = <String>[];

    for (int i = 0; i < args.length; i++) {
      final arg = args[i];
      if (arg == '--priority' || arg == '-p') {
        if (i + 1 < args.length) {
          priority = Priority.fromString(args[++i]);
        }
      } else if (arg == '--due' || arg == '-d') {
        if (i + 1 < args.length) {
          final raw = args[++i];
          final parsed = DateTime.tryParse(raw);
          if (parsed == null) {
            throw ValidationException('due', "Format de date invalide '$raw'. Utilisez le format ISO YYYY-MM-DD.");
          }
          dueDate = parsed;
        }
      } else if (arg == '--urgent' || arg == '-u') {
        isUrgent = true;
      } else if (arg == '--reason') {
        if (i + 1 < args.length) {
          reason = args[++i];
          isUrgent = true;
        }
      } else if (!arg.startsWith('-')) {
        nonFlagParts.add(arg);
      }
    }

    title = nonFlagParts.join(' ').replaceAll('"', '').replaceAll("'", '');

    final task = await _service.addTask(
      title: title,
      priority: priority,
      dueDate: dueDate,
      isUrgent: isUrgent,
      escalationReason: reason,
    );

    stdout.writeln(
      '${Ansi.green}✔ Succès : ${task.taskType == 'urgent' ? 'Tâche urgente' : 'Tâche'} #${task.id} créée avec succès!${Ansi.reset}',
    );
    stdout.writeln('  ${Ansi.bold}Titre:${Ansi.reset} ${task.title}');
    stdout.writeln('  ${Ansi.bold}Priorité:${Ansi.reset} ${task.priority.ansiColor}${task.priority.displayLabel}${Ansi.reset}');
    if (task.dueDate != null) {
      stdout.writeln('  ${Ansi.bold}Échéance:${Ansi.reset} ${task.dueDate!.toLocal().toString().split(' ')[0]}');
    }
  }

  Future<void> _handleList(List<String> args) async {
    String sortBy = 'priority';
    bool? completedFilter;

    for (int i = 0; i < args.length; i++) {
      final arg = args[i];
      if (arg == '--sort' || arg == '-s') {
        if (i + 1 < args.length) {
          sortBy = args[++i];
        }
      } else if (arg == '--filter' || arg == '-f') {
        if (i + 1 < args.length) {
          final f = args[++i].toLowerCase();
          if (f == 'done' || f == 'completed') completedFilter = true;
          if (f == 'pending' || f == 'todo') completedFilter = false;
        }
      }
    }

    final tasks = await _service.listTasks(sortBy: sortBy, completedFilter: completedFilter);

    if (tasks.isEmpty) {
      stdout.writeln('${Ansi.yellow}Aucune tâche trouvée pour ces critères.${Ansi.reset}');
      return;
    }

    stdout.writeln('');
    stdout.writeln(
      '${Ansi.bold}LISTE DES TÂCHES (Total: ${tasks.length}, Tri: $sortBy)${Ansi.reset}',
    );
    stdout.writeln('${Ansi.dim}--------------------------------------------------------------------------------${Ansi.reset}');
    stdout.writeln(
      '${Ansi.dim}ID   STATUT    TYPE       PRIORITÉ   ÉCHÉANCE       TITRE${Ansi.reset}',
    );
    stdout.writeln('${Ansi.dim}--------------------------------------------------------------------------------${Ansi.reset}');

    for (final task in tasks) {
      final idCol = task.id.padRight(4);
      final statusCol = task.isCompleted
          ? '${Ansi.green}[FAIT]  ${Ansi.reset}'
          : (task.isOverdue
              ? '${Ansi.red}[RETARD]${Ansi.reset}'
              : '${Ansi.cyan}[EN CRS]${Ansi.reset}');

      final typeCol = task is UrgentTask
          ? '${Ansi.red}URGENT   ${Ansi.reset}'
          : '${Ansi.dim}Standard ${Ansi.reset}';

      final prioCol =
          '${task.priority.ansiColor}${task.priority.displayLabel.padRight(10)}${Ansi.reset}';

      final dueCol = task.dueDate != null
          ? task.dueDate!.toLocal().toString().split(' ')[0].padRight(14)
          : '${Ansi.dim}--            ${Ansi.reset}';

      stdout.writeln('$idCol $statusCol $typeCol $prioCol $dueCol ${task.title}');
    }

    stdout.writeln('${Ansi.dim}--------------------------------------------------------------------------------${Ansi.reset}');
    stdout.writeln('');
  }

  Future<void> _handleDone(List<String> args) async {
    if (args.isEmpty) {
      throw ValidationException('id', "Identifiant requis: 'dart run bin/main.dart done <id>'");
    }
    final id = args.first;
    final task = await _service.markAsCompleted(id);
    stdout.writeln(
      '${Ansi.green}✔ Tâche #${task.id} "${task.title}" marquée comme TERMINÉE!${Ansi.reset}',
    );
  }

  Future<void> _handleDelete(List<String> args) async {
    if (args.isEmpty) {
      throw ValidationException('id', "Identifiant requis: 'dart run bin/main.dart delete <id>'");
    }
    final id = args.first;
    await _service.deleteTask(id);
    stdout.writeln('${Ansi.green}✔ Tâche #$id supprimée avec succès du stockage local.${Ansi.reset}');
  }

  Future<void> _handleStats() async {
    final stats = await _service.getStats();
    stdout.writeln('''
${Ansi.bold}${Ansi.cyan}TABLEAU DE BORD DES TÂCHES${Ansi.reset}
  Total des tâches   : ${Ansi.bold}${stats['total']}${Ansi.reset}
  En cours           : ${Ansi.yellow}${stats['pending']}${Ansi.reset}
  Terminées          : ${Ansi.green}${stats['completed']}${Ansi.reset}
  En retard          : ${Ansi.red}${stats['overdue']}${Ansi.reset}
  Tâches urgentes    : ${Ansi.magenta}${stats['urgent']}${Ansi.reset}
''');
  }

  Future<void> runInteractiveLoop() async {
    stdout.writeln('${Ansi.bold}${Ansi.cyan}Mode interactif démarré. Tapez "exit" ou "quit" pour quitter.${Ansi.reset}');
    while (true) {
      stdout.write('${Ansi.bold}dart-task-cli>${Ansi.reset} ');
      final line = stdin.readLineSync();
      if (line == null) break;
      final trimmed = line.trim();
      if (trimmed == 'exit' || trimmed == 'quit') {
        stdout.writeln('Au revoir!');
        break;
      }
      if (trimmed.isEmpty) continue;
      final tokens = trimmed.split(RegExp(r'\s+'));
      await execute(tokens);
    }
  }
}
