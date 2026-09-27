import 'dart:io';
import 'package:test/test.dart';

import '../lib/exceptions/task_exceptions.dart';
import '../lib/models/priority.dart';
import '../lib/models/task.dart';
import '../lib/repositories/json_file_repository.dart';
import '../lib/services/task_service.dart';

void main() {
  group('1. Modèles & Héritage (Task, StandardTask, UrgentTask)', () {
    test('StandardTask hérite de Task et initialise correctement les attributs', () {
      final task = StandardTask(
        id: '1',
        title: 'Nettoyer le code source',
        priority: Priority.medium,
      );

      expect(task, isA<Task>());
      expect(task.taskType, equals('standard'));
      expect(task.isCompleted, isFalse);
      expect(task.title, equals('Nettoyer le code source'));
      expect(task.priority, equals(Priority.medium));

      task.markAsCompleted();
      expect(task.isCompleted, isTrue);
    });

    test('UrgentTask hérite de Task et gère la raison critique', () {
      final urgent = UrgentTask(
        id: '2',
        title: 'Corriger faille critique en production',
        priority: Priority.high,
        escalationReason: 'Vulnérabilité SQL détectée',
      );

      expect(urgent, isA<Task>());
      expect(urgent.taskType, equals('urgent'));
      expect(urgent.escalationReason, equals('Vulnérabilité SQL détectée'));
      expect(urgent.priority, equals(Priority.high));
      expect(urgent.displayTag, contains('URGENT'));
    });
  });

  group('2. Sérialisation & Polymorphisme JSON (JsonEncodable)', () {
    test('Sérialise et reconstruit polymorphiquement une UrgentTask depuis un JSON', () {
      final original = UrgentTask(
        id: '42',
        title: 'Mettre à jour les dépendances de sécurité',
        priority: Priority.high,
        dueDate: DateTime(2026, 12, 31),
        escalationReason: 'Audit externe imminent',
      );

      final json = original.toJson();
      expect(json['id'], equals('42'));
      expect(json['taskType'], equals('urgent'));
      expect(json['escalationReason'], equals('Audit externe imminent'));

      final restored = Task.fromJson(json);
      expect(restored, isA<UrgentTask>());
      expect((restored as UrgentTask).escalationReason, equals('Audit externe imminent'));
      expect(restored.title, equals(original.title));
      expect(restored.dueDate?.year, equals(2026));
    });
  });

  group('3. Exceptions personnalisées & Validation des données', () {
    test('ValidationException levée si le titre est vide ou trop court', () {
      expect(
        () => StandardTask(id: '1', title: '  ', priority: Priority.low),
        throwsA(isA<ValidationException>()),
      );

      expect(
        () => StandardTask(id: '1', title: 'ab', priority: Priority.low),
        throwsA(isA<ValidationException>()),
      );
    });

    test('InvalidPriorityException levée lors de la conversion de chaîne inconnue', () {
      expect(
        () => Priority.fromString('ultra_urgent_inconnu'),
        throwsA(isA<InvalidPriorityException>()),
      );
    });
  });

  group('4. Dépôt Générique (Repository<T>) & Persistance locale', () {
    late Directory tempDir;
    late String tempFile;
    late JsonFileRepository<Task> repo;

    setUp(() async {
      tempDir = await Directory.systemTemp.createTemp('task_test_');
      tempFile = '${tempDir.path}/test_tasks.json';
      repo = JsonFileRepository<Task>(
        filePath: tempFile,
        fromJson: (j) => Task.fromJson(j),
        idSelector: (t) => t.id,
      );
    });

    tearDown(() async {
      if (await tempDir.exists()) {
        await tempDir.delete(recursive: true);
      }
    });

    test('Ajoute, récupère et supprime des tâches avec persistance JSON', () async {
      expect(await repo.getAll(), isEmpty);

      final task = StandardTask(id: '100', title: 'Tâche de test unitaire');
      await repo.add(task);

      final all = await repo.getAll();
      expect(all.length, equals(1));
      expect(all.first.id, equals('100'));

      // Vérification que le fichier JSON local existe et contient les données
      final file = File(tempFile);
      expect(await file.exists(), isTrue);
      final content = await file.readAsString();
      expect(content, contains('Tâche de test unitaire'));

      // Suppression
      await repo.delete('100');
      expect(await repo.getAll(), isEmpty);
    });

    test('Lève TaskNotFoundException si on tente de supprimer un identifiant introuvable', () async {
      expect(
        () => repo.delete('999999'),
        throwsA(isA<TaskNotFoundException>()),
      );
    });
  });

  group('5. Logique Métier & Tri (TaskService)', () {
    late Directory tempDir;
    late JsonFileRepository<Task> repo;
    late TaskService service;

    setUp(() async {
      tempDir = await Directory.systemTemp.createTemp('service_test_');
      repo = JsonFileRepository<Task>(
        filePath: '${tempDir.path}/tasks.json',
        fromJson: (j) => Task.fromJson(j),
        idSelector: (t) => t.id,
      );
      service = TaskService(repo);
    });

    tearDown(() async {
      if (await tempDir.exists()) {
        await tempDir.delete(recursive: true);
      }
    });

    test('Trie correctement par priorité (High > Medium > Low)', () async {
      await service.addTask(title: 'Tâche basse priorité', priority: Priority.low);
      await service.addTask(title: 'Tâche haute priorité', priority: Priority.high);
      await service.addTask(title: 'Tâche moyenne priorité', priority: Priority.medium);

      final sorted = await service.listTasks(sortBy: 'priority');
      expect(sorted[0].priority, equals(Priority.high));
      expect(sorted[1].priority, equals(Priority.medium));
      expect(sorted[2].priority, equals(Priority.low));
    });

    test('Marquer une tâche comme terminée met à jour son état', () async {
      final created = await service.addTask(title: 'Vérifier la couverture de code');
      expect(created.isCompleted, isFalse);

      final completed = await service.markAsCompleted(created.id);
      expect(completed.isCompleted, isTrue);

      final retrieved = await service.getTask(created.id);
      expect(retrieved.isCompleted, isTrue);
    });
  });
}
