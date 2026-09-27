import 'dart:convert';
import 'dart:io';

import '../exceptions/task_exceptions.dart';
import '../interfaces/json_encodable.dart';
import '../interfaces/repository.dart';

/// Implémentation générique d'un dépôt persistant les entités dans un fichier JSON local.
/// [T] doit implémenter l'interface [JsonEncodable].
class JsonFileRepository<T extends JsonEncodable> implements Repository<T> {
  final File _file;
  final T Function(Map<String, dynamic> json) _fromJson;
  final String Function(T item) _idSelector;

  JsonFileRepository({
    required String filePath,
    required T Function(Map<String, dynamic> json) fromJson,
    required String Function(T item) idSelector,
  })  : _file = File(filePath),
        _fromJson = fromJson,
        _idSelector = idSelector;

  /// Chemin absolu ou relatif du fichier de stockage.
  String get filePath => _file.path;

  /// Vérifie ou initialise le fichier de stockage local avec une liste vide.
  Future<void> _ensureFileExists() async {
    try {
      if (!await _file.exists()) {
        await _file.create(recursive: true);
        await _file.writeAsString(jsonEncode(<dynamic>[]));
      }
    } catch (e) {
      throw StorageException(
        "Impossible d'initialiser le fichier de stockage sur '${_file.path}'.",
        cause: e,
      );
    }
  }

  @override
  Future<List<T>> getAll() async {
    await _ensureFileExists();
    try {
      final raw = await _file.readAsString();
      if (raw.trim().isEmpty) return <T>[];

      final dynamic decoded = jsonDecode(raw);
      if (decoded is! List) {
        throw StorageException("Le format du fichier JSON est invalide (liste attendue).");
      }

      return decoded
          .map((item) => _fromJson(item as Map<String, dynamic>))
          .toList();
    } on FormatException catch (e) {
      throw StorageException("Erreur de décodage du fichier JSON sur '${_file.path}'.", cause: e);
    } catch (e) {
      if (e is StorageException) rethrow;
      throw StorageException("Échec de lecture du fichier de données.", cause: e);
    }
  }

  @override
  Future<T?> getById(String id) async {
    final items = await getAll();
    for (final item in items) {
      if (_idSelector(item) == id) {
        return item;
      }
    }
    return null;
  }

  @override
  Future<void> add(T item) async {
    final items = await getAll();
    final newId = _idSelector(item);
    final exists = items.any((existing) => _idSelector(existing) == newId);
    if (exists) {
      throw StorageException("Un élément avec l'identifiant #$newId existe déjà.");
    }
    items.add(item);
    await saveAll(items);
  }

  @override
  Future<void> update(T item) async {
    final items = await getAll();
    final targetId = _idSelector(item);
    final index = items.indexWhere((existing) => _idSelector(existing) == targetId);
    if (index == -1) {
      throw TaskNotFoundException(targetId);
    }
    items[index] = item;
    await saveAll(items);
  }

  @override
  Future<bool> delete(String id) async {
    final items = await getAll();
    final initialCount = items.length;
    items.removeWhere((item) => _idSelector(item) == id);
    if (items.length == initialCount) {
      throw TaskNotFoundException(id);
    }
    await saveAll(items);
    return true;
  }

  @override
  Future<void> saveAll(List<T> items) async {
    try {
      final jsonList = items.map((e) => e.toJson()).toList();
      final encoder = JsonEncoder.withIndent('  ');
      final serialized = encoder.convert(jsonList);
      await _file.writeAsString(serialized);
    } catch (e) {
      throw StorageException("Échec d'écriture des données sur le disque.", cause: e);
    }
  }
}
