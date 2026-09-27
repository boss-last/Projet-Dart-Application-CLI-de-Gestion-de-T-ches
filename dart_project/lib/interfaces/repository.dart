/// Interface générique représentant un contrat de dépôt de données (Repository Pattern).
abstract interface class Repository<T> {
  /// Récupère tous les éléments enregistrés.
  Future<List<T>> getAll();

  /// Récupère un élément par son identifiant unique.
  Future<T?> getById(String id);

  /// Ajoute un nouvel élément.
  Future<void> add(T item);

  /// Met à jour un élément existant.
  Future<void> update(T item);

  /// Supprime un élément par son identifiant unique.
  Future<bool> delete(String id);

  /// Sauvegarde les éléments dans le support de stockage.
  Future<void> saveAll(List<T> items);
}
