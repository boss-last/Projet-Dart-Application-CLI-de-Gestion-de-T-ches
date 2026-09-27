/// Interface pour les objets sérialisables en format JSON.
abstract interface class JsonEncodable {
  /// Sérialise l'instance en un dictionnaire JSON.
  Map<String, dynamic> toJson();
}
