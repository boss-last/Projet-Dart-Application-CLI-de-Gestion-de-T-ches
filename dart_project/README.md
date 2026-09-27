# Dart Task CLI — Application en Ligne de Commande

Application CLI de gestion de tâches professionnelle développée en **Dart pur (sans Flutter)**, mettant en œuvre la programmation orientée objet avancée, les types génériques, les interfaces, les exceptions personnalisées, la persistance JSON locale et une suite de tests unitaires automatisés.

---

## 🎯 Fonctionnalités implémentées

- ➕ **Ajout de tâches** : avec titre, priorité (`low`, `medium`, `high`) et date limite optionnelle (`YYYY-MM-DD`). Support des tâches urgentes (`UrgentTask`) avec justification.
- 📋 **Liste des tâches** : affichage tabulaire clair avec statut, type, priorité colorée (ANSI) et date d'échéance.
- 🔄 **Tri dynamique** : tri par priorité (`--sort priority` : High > Medium > Low) ou par date limite (`--sort date`).
- ✅ **Marquage comme terminée** : changement de statut par identifiant (`done <id>`).
- 🗑️ **Suppression** : suppression définitive avec confirmation (`delete <id>`).
- 💾 **Persistance locale JSON** : stockage automatique et atomique dans un fichier `tasks.json`.
- 📊 **Tableau de bord statistique** : métriques en temps réel (total, en cours, terminées, en retard, urgentes).
- 💬 **Mode interactif (REPL)** : invite interactive guidée pour enchaîner les commandes.

---

## 🏗️ Architecture & Exigences Techniques

| Exigence du sujet | Implémentation dans le code |
| :--- | :--- |
| **Classes abstraites & Héritage** | `abstract class Task` dans `lib/models/task.dart`, dérivée par `StandardTask` et `UrgentTask`. |
| **Interface** | `abstract interface class JsonEncodable` (`lib/interfaces/json_encodable.dart`) et `Repository<T>` (`lib/interfaces/repository.dart`). |
| **Génériques** | `abstract interface class Repository<T>` et `class JsonFileRepository<T extends JsonEncodable> implements Repository<T>`. |
| **Exceptions personnalisées** | `TaskException`, `TaskNotFoundException`, `StorageException`, `ValidationException`, `InvalidPriorityException` (`lib/exceptions/task_exceptions.dart`). |
| **Tests unitaires (package `test`)** | 8 tests unitaires complets dans `test/task_test.dart` validant les modèles, la sérialisation, la persistance et les exceptions. |

---

## 📂 Structure du Projet

```text
dart_task_cli/
├── bin/
│   └── main.dart                     # Point d'entrée exécutable CLI
├── lib/
│   ├── cli/
│   │   ├── ansi_colors.dart          # Gestion des couleurs de terminal ANSI
│   │   └── cli_parser.dart           # Parseur de commandes et rendu tabulaire
│   ├── exceptions/
│   │   └── task_exceptions.dart      # Hiérarchie d'exceptions typées
│   ├── interfaces/
│   │   ├── json_encodable.dart       # Contrat de sérialisation JSON
│   │   └── repository.dart           # Contrat générique Repository<T>
│   ├── models/
│   │   ├── priority.dart             # Enum Priority avec poids et labels
│   │   └── task.dart                 # Classe abstraite Task, StandardTask, UrgentTask
│   ├── repositories/
│   │   └── json_file_repository.dart # Implémentation générique JsonFileRepository<T>
│   └── services/
│       └── task_service.dart         # Logique métier (tri, calculs, règles)
├── test/
│   └── task_test.dart                # Suite de tests unitaires automatisés
├── tasks.json                        # Fichier de persistance locale généré automatiquement
├── pubspec.yaml                      # Dépendances et métadonnées du projet
└── README.md                         # Documentation complète du projet
```

---

## 🚀 Prérequis & Installation

### Prérequis
- [Dart SDK](https://dart.dev/get-dart) version **3.0.0** ou supérieure installée sur votre machine.

Vérifiez votre installation avec :
```bash
dart --version
```

### Installation des dépendances
Placez-vous à la racine du projet et exécutez :
```bash
dart pub get
```

---

## 💻 Guide d'utilisation de la CLI

### 1. Afficher l'aide
```bash
dart run bin/main.dart help
```

### 2. Ajouter une tâche
```bash
# Tâche standard avec priorité par défaut (medium)
dart run bin/main.dart add "Rédiger le rapport d'architecture"

# Tâche avec priorité et date d'échéance
dart run bin/main.dart add "Préparer la démonstration client" --priority high --due 2026-10-15

# Raccourcis d'options (-p, -d)
dart run bin/main.dart add "Mettre à jour la documentation" -p low -d 2026-11-01

# Tâche urgente (UrgentTask avec raison d'escalade)
dart run bin/main.dart add "Corriger la faille de sécurité en production" --urgent --reason "Alerte SOC niveau 1"
```

### 3. Lister les tâches
```bash
# Liste par défaut (triée par priorité : High > Medium > Low)
dart run bin/main.dart list

# Tri explicite par date d'échéance
dart run bin/main.dart list --sort date

# Filtrer uniquement les tâches en cours
dart run bin/main.dart list --filter pending

# Filtrer uniquement les tâches terminées
dart run bin/main.dart list --filter done
```

### 4. Marquer une tâche comme terminée
```bash
dart run bin/main.dart done 1
```

### 5. Supprimer une tâche
```bash
dart run bin/main.dart delete 2
```

### 6. Tableau de bord des statistiques
```bash
dart run bin/main.dart stats
```

### 7. Mode interactif (REPL)
```bash
dart run bin/main.dart interactive
```

---

## 🧪 Exécution des Tests Unitaires

Le projet utilise le package officiel `test` de Dart. Pour exécuter l'ensemble de la suite de tests :

```bash
dart test
```

Pour exécuter les tests avec affichage détaillé de chaque test :
```bash
dart test --reporter expanded
```

### Scénarios de tests couverts :
1. **StandardTask** : instanciation, héritage, valeurs par défaut, transition d'état terminé.
2. **UrgentTask** : héritage, gestion de la raison critique, priorité haute par défaut.
3. **Sérialisation polymorphique** : transformation en JSON et désérialisation vers le sous-type concret (`UrgentTask` / `StandardTask`).
4. **ValidationException** : vérification des règles métier (titre vide, titre trop court < 3 caractères).
5. **InvalidPriorityException** : validation stricte des chaînes de priorités autorisées.
6. **Repository CRUD** : persistance fichier réelle, création, lecture, suppression.
7. **TaskNotFoundException** : détection et levée d'exception sur ID inexistant.
8. **TaskService Tri & Logique** : ordonnancement strict (High > Medium > Low) et gestion des états.

---

## 📤 Déploiement sur GitHub

Pour livrer ce projet sur votre compte GitHub :

```bash
# 1. Initialiser le dépôt git
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Créer le commit initial
git commit -m "feat: initial commit of dart task cli application with full requirements"

# 4. Créer un dépôt public sur GitHub (nommé par exemple dart-task-cli)
# puis lier le dépôt distant :
git remote add origin https://github.com/<votre-utilisateur>/dart-task-cli.git

# 5. Pousser vers la branche principale
git branch -M main
git push -u origin main
```

---

## 🛡️ Gestion des Exceptions Personnalisées

L'application n'utilise pas de simples chaînes d'erreurs génériques, mais une hiérarchie stricte d'exceptions :
- `TaskException` : classe abstraite de base avec code d'erreur et message standardisé.
- `TaskNotFoundException` : levée lors d'un accès à un identifiant inconnu.
- `StorageException` : levée en cas de fichier JSON corrompu ou d'erreur d'E/S disque.
- `ValidationException` : levée lors d'un non-respect des règles métier (titre < 3 chars, id vide).
- `InvalidPriorityException` : levée lorsqu'une valeur inconnue est passée en argument de priorité.
