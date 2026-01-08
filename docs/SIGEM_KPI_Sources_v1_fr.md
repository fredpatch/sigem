# SIGEM — Cartographie des KPI (v1)

_Dernière mise à jour : 2025-10-20 13:28:19 WAT_

## 1) Contexte & principes

- **Périmètre** : Département MG — suivi des **actifs** et **stocks (magasin)**.
- **Langue** : Français (documents et interface).
- **Règle d’affichage (temporaire)** : tous les utilisateurs opèrent avec la **portée COS** (pleine visibilité MG). La **portée par bureau** sera introduite plus tard.
- **Fuseau horaire** : Africa/Libreville. Les fenêtres temporelles utilisent `[from (inclus), to (exclus)]` et les agrégations journalières démarrent à 00:00 locale.
- **Qualité de données** : mouvements `status=completed` uniquement ; suppressions logicielles exclues des comptes.

---

## 2) Vue d’ensemble des KPI (cartes, graphiques, tableaux)

### 2.1 Cartes (valeurs simples)

| KPI                                     | Définition (fonction)                                                                                     | Portée      | Source(s)                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------- |
| **Actifs totaux**                       | `count(assets)`                                                                                           | MG          | `assets`                                 |
| **Actifs actifs**                       | `count(assets where status ∈ {in_service, assigned} AND missing=false)`                                   | MG          | `assets`                                 |
| **Imports (période)**                   | `count(imports in [from,to])`                                                                             | MG          | `imports`                                |
| **Exports (période)**                   | `count(exports in [from,to])`                                                                             | MG          | `exports`                                |
| **Exceptions (période)**                | `count(imports+exports where exception exists in [from,to])`                                              | MG          | `imports`, `exports`                     |
| **Actifs manquants (ouverts)**          | `count(assets where missing=true)`                                                                        | MG          | `assets`                                 |
| **Maintenance à venir**                 | `count(assets where maintenance.nextDueAt ∈ [from,to])`                                                   | MG          | `assets`                                 |
| **Maintenance en retard**               | `count(assets where maintenance.nextDueAt < from)`                                                        | MG          | `assets`                                 |
| **Critiques non lus (par utilisateur)** | `count(notification_users where userId=me AND isRead=false AND notification.severity ∈ {critical,error})` | Utilisateur | `notification_users` (+ `notifications`) |

### 2.2 Graphiques (tendances)

| Graphique                                   | Définition                                      | Détails                                |
| ------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| **Imports vs Exports**                      | Comptes agrégés par jour/semaine/mois           | Series : `imports`, `exports`          |
| **Exceptions par type**                     | Nombre d’exceptions par `exception.type`        | Barres empilées ou simples             |
| **Niveaux de stock par catégorie (Top 10)** | Somme du `currentStock` par `articles.category` | Option : taux “sous-min” par catégorie |
| **Maintenance (due vs effectuée)**          | Échéances vs opérations effectuées (si suivi)   | Bucket identique au choix utilisateur  |

### 2.3 Tableaux / classements

| Tableau                              | Colonnes                                                  | Règles                                            |
| ------------------------------------ | --------------------------------------------------------- | ------------------------------------------------- |
| **Top agents (période)**             | Agent, Imports, Exports, Total                            | Ici : portée COS → tout MG (AGT limité plus tard) |
| **Watchlist — Articles sous seuil**  | Article, Stock actuel, Min, % sous min, Dernier mouvement | Bouton “Créer un import”                          |
| **Événements critiques récents**     | Date, Catégorie, Titre, Lien ressource                    | 7–30 derniers jours                               |
| **Documents à expirer** (si utilisé) | Actif, Type doc, Échéance, J-jours                        | Tri par échéance croissante                       |

---

## 3) Détail par KPI — Source, filtres, agrégations, visibilité

### 3.1 Cartes

1. **Actifs totaux**

   - Source : `assets`
   - Filtre : `{ dept:'MG' }` (+ `{ bureau }` plus tard)
   - Aggregation : `count(*)`
   - Visibilité : COS (tous)

2. **Actifs actifs**

   - Source : `assets`
   - Filtre : `{ dept:'MG', status: {in_service, assigned}, missing:false }`
   - Agg : `count(*)`

3. **Imports (période)** / **Exports (période)**

   - Source : `imports` / `exports`
   - Filtre : `{ dept:'MG', createdAt: { $gte: from, $lt: to }, status:'completed' }`
   - Agg : `count(*)`

4. **Exceptions (période)**

   - Source : `imports`, `exports`
   - Filtre : précédent + `exception: { $exists: true }`
   - Agg : `count(*)` (somme des deux)

5. **Actifs manquants (ouverts)**

   - Source : `assets`
   - Filtre : `{ dept:'MG', missing:true }`
   - Agg : `count(*)`

6. **Maintenance à venir / en retard**

   - Source : `assets`
   - Filtres :
     - due : `maintenance.nextDueAt ∈ [from,to]`
     - overdue : `maintenance.nextDueAt < from`
   - Agg : `count(*)`

7. **Critiques non lus (par utilisateur)**
   - Sources : `notification_users` (+ jointure `notifications`)
   - Filtre : `{ userId: me, isDeleted:false, isRead:false, notification.severity ∈ {critical, error} }`
   - Agg : `count(*)`

### 3.2 Graphiques

1. **Imports vs Exports (séries temporelles)**

   - Source : `imports`, `exports`
   - Filtre : `{ dept:'MG', createdAt ∈ [from,to], status:'completed' }`
   - Bucket : `day|week|month` (timezone Africa/Libreville)
   - Sortie : `[[{ date, imports, exports }]` + ...] <!-- escaped braces -->

2. **Exceptions par type**

   - Source : `imports`, `exports`
   - Filtre : période + `exception.type`
   - GroupBy : `exception.type`
   - Sortie : `{ type, count }`

3. **Niveaux de stock par catégorie (Top 10)**

   - Source : `articles`
   - Filtre : `{ dept:'MG', status:'active' }`
   - Métrique : `sum(currentStock)` par `category`
   - Variante : taux sous-min = `count(currentStock <= minStock) / count(category)`

4. **Maintenance : due vs effectuée**
   - Source : `assets` (+ éventuellement `maintenance_logs`)
   - Calcul : bucket sur `nextDueAt` vs `completedAt` si existant
   - Sortie : `{ dateBucket, due, completed }`

### 3.3 Tableaux

1. **Top agents (période)**

   - Sources : `imports`, `exports`
   - Filtre : période + `{ dept:'MG' }`
   - GroupBy : `createdBy` → `imports_count`, `exports_count`, `total`
   - Tri : `total desc`, Limite : 10

2. **Watchlist — Sous-seuil**

   - Source : `articles`
   - Filtre : `{ dept:'MG', currentStock <= minStock }`
   - Enrichissement : `lastMovementAt` via `stock_movements` (dernier mouvement par article)
   - Calcul `% sous min` : `(minStock - currentStock) / minStock` (borné à [0,1])

3. **Événements critiques récents**

   - Source : `notifications` (+ pivot `notification_users` si personnel)
   - Filtre : `{ severity ∈ {critical,error}, createdAt >= now-30d }`
   - Colonnes : date, catégorie, titre/message, lien `{ resourceType, resourceId }`

4. **Docs à expirer** (optionnel)
   - Source : `assets` (`documents[]`) ou table dédiée
   - Filtre : `doc.expiry ∈ [now, now+N]`
   - Tri : `expiry asc`

---

## 4) Taxonomies & champs requis

### 4.1 Catégories d’articles (magasin)

- **Équipement**, **Informatique**, **Mobilier**
- Sous-catégories libres (extraites de l’Excel) pour analyse fine (facultatif).

### 4.2 Types d’exception (période)

- Proposés (3–6) : `duplicate_serial`, `qty_mismatch`, `invalid_doc` (à valider au métier).

### 4.3 Champs clés par collection (rappel)

- `assets` : `status`, `missing`, `maintenance.nextDueAt`, `dept`, `bureau?`
- `imports`/`exports` : `createdAt`, `createdBy`, `status`, `exception?`, `dept`, `bureau?`
- `articles` : `category`, `minStock`, `currentStock`, `status`, `dept`, `bureau?`
- `stock_movements` : `type`, `createdAt`, `createdBy`, `status`, `lines[]`
- `notifications` + `notification_users` : `severity`, `createdAt`, `isRead`, `isDeleted`

---

## 5) Indexation (préconisations)

```txt
assets:          { dept:1, status:1, missing:1 }, { 'maintenance.nextDueAt':1 }
imports:         { dept:1, createdAt:1, status:1, 'exception.type':1, createdBy:1 }
exports:         { dept:1, createdAt:1, status:1, 'exception.type':1, createdBy:1 }
articles:        { dept:1, category:1, status:1, currentStock:1, minStock:1 }
stock_movements: { dept:1, createdAt:1, type:1, createdBy:1, status:1, 'lines.articleId':1 }
notifications:   { createdAt:1, severity:1, 'data.resourceId':1, 'recipients.roleKeys':1 }
notification_users: { userId:1, isDeleted:1, isRead:1, notificationId:1 }
```

---

## 6) Caching & fraîcheur

- Cache par clé : `(dept, bureau?, from, to, role)` — **TTL 60–120s**.
- Invalidation ciblée : mise à jour immédiate du compteur **“critiques non lus”** pour l’utilisateur courant lorsque `notif:new` reçoit `severity ∈ {critical,error}`.

---

## 7) Données de test (scénario de validation)

- **Actifs** : 50 (dont 5 `missing`, 8 `nextDueAt` dans 30j, 6 `overdue`).
- **Mouvements** : 120 imports & 95 exports sur 30j ; 12 exceptions (réparties sur 3 types).
- **Articles** : 80 (12 sous min, 5 critiques) ; `category` réparties entre Équipement / Informatique / Mobilier.
- **Agents** : 3 profils avec volumes distincts (classement).
- **Notifications** : quelques critiques non lues pour un utilisateur test (vérif du badge).

---

## 8) RBAC & portée (temporaire)

- **COS** (par défaut pour tous) : visibilité complète MG sur KPI.
- **COB/AGT** : portées spécifiques **à introduire plus tard** (par bureau et/ou par auteur).

---

## 9) Prochaines étapes

1. **Valider** les taxonomies (catégories d’articles, types d’exception).
2. **Confirmer** si la portée **bureau** doit être activée en UI maintenant ou plus tard.
3. **Geler** cette cartographie comme référence pour l’implémentation des endpoints KPI.
