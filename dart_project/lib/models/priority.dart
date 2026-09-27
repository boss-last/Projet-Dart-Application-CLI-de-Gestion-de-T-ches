import '../exceptions/task_exceptions.dart';

/// Énumération représentant le niveau de priorité d'une tâche.
enum Priority implements Comparable<Priority> {
  low(weight: 1, label: 'low', displayLabel: 'Basse', ansiColor: '\x1B[32m'),
  medium(weight: 2, label: 'medium', displayLabel: 'Moyenne', ansiColor: '\x1B[33m'),
  high(weight: 3, label: 'high', displayLabel: 'Haute', ansiColor: '\x1B[31m');

  final int weight;
  final String label;
  final String displayLabel;
  final String ansiColor;

  const Priority({
    required this.weight,
    required this.label,
    required this.displayLabel,
    required this.ansiColor,
  });

  /// Convertit une chaîne de caractères en valeur d'énumération [Priority].
  /// Lève une [InvalidPriorityException] si la valeur est inconnue.
  static Priority fromString(String value) {
    final normalized = value.trim().toLowerCase();
    switch (normalized) {
      case 'low':
      case 'basse':
      case 'l':
      case '1':
        return Priority.low;
      case 'medium':
      case 'moyenne':
      case 'med':
      case 'm':
      case '2':
        return Priority.medium;
      case 'high':
      case 'haute':
      case 'h':
      case '3':
        return Priority.high;
      default:
        throw InvalidPriorityException(
          "Valeur de priorité invalide: '$value'. Valeurs acceptées: low, medium, high.",
        );
    }
  }

  @override
  int compareTo(Priority other) => weight.compareTo(other.weight);

  @override
  String toString() => label;
}
