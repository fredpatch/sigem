# 🚀 Sprint D0 — Plan de Lancement du Développement

### Projet : SIGEM (Système Intégré de Gestion du Matériel)

**Date de début estimée : 21/10/2025**  
**Durée : 10 jours**  
**Responsable : Alpha Software Development**

---

## ⚡ Objectif du Sprint

Mettre en place la **base technique du système SIGEM** :

- Architecture de l’API Gateway
- Authentification & middleware JWT
- Connexion avec le microservice de notifications
- Schémas MongoDB de base (catégories, localisation, actifs)
- Environnement Docker/Dokploy prêt pour tests

---

## ⚡ Quick Wins (tâches rapides)

| Élément                            | Description                                      | Délai  |
| ---------------------------------- | ------------------------------------------------ | ------ |
| **API Gateway**                    | Express, versioning `/v1`, CORS, Helmet, Swagger | 1 jour |
| **Middleware JWT**                 | Extraction cookie `accessToken`, `req.user`      | 0.5 j  |
| **Health checks**                  | `/v1/health` avec uptime, version, DB ping       | 0.5 j  |
| **Connexion Notification Service** | Routes proxy `/v1/notifications` → Kafka         | 0.5 j  |
| **Modèles de base**                | `Category`, `Location` minimal                   | 1 jour |
| **Seed minimal**                   | Catégories + sous-cat + 2 localisations          | 0.5 j  |
| **Docker Compose base**            | Mongo + Kafka + Gateway + Notif                  | 1 jour |

---

## 🧱 Long Poles (tâches longues)

| Élément                 | Description                                | Durée estimée |
| ----------------------- | ------------------------------------------ | ------------- |
| **Import/Export Excel** | Mapping, validation, rollback              | 3-5 j         |
| **Bureau Scoping**      | Arborescence agent → bureau → bâtiment     | 4 j           |
| **Filtres / Recherche** | Multi-critères, texte intégral, pagination | 3 j           |
| **Reporting PDF/Excel** | Génération PDF + totaux par catégorie      | 4 j           |
| **RBAC avancé**         | Règles d’action granulaires                | 3 j           |

---

## 🧪 Priorités de test

1. **Chaîne Kafka-Notif E2E** → `notify.event` → Notification Service → Socket.IO
2. **Middleware Auth JWT + RBAC** → Vérif des rôles `MG_COS`, `MG_COB`, `MG_AGT`
3. **CRUD Category/Location/Asset (MVP)**
4. **Kafka résilience** → reprise après restart
5. **Index DB & performance basique**

---

## 📅 Planning de Développement (10 jours)

| Jour    | Objectif                                   | Livrable                      | Statut |
| ------- | ------------------------------------------ | ----------------------------- | ------ |
| **J1**  | Bootstrap Gateway (`/v1`, health, Swagger) | PR#1 `gateway-skeleton`       | 🔜     |
| **J2**  | Middleware JWT + roles                     | PR#2 `gateway-auth`           | 🔜     |
| **J3**  | Proxy notif-service + test E2E Kafka       | PR#3 `gateway-notif-proxy`    | 🔜     |
| **J4**  | Schémas `Category`, `Location` + CRUD      | PR#4 `inventory-models-base`  | 🔜     |
| **J5**  | Seeder + tests Postman/Insomnia            | PR#5 `seed-and-smoke`         | 🔜     |
| **J6**  | CRUD Asset (create/list + index)           | PR#6 `asset-crud-mvp`         | 🔜     |
| **J7**  | Notifications liées aux assets             | PR#7 `asset-events-to-notify` | 🔜     |
| **J8**  | Application du RBAC sur inventaire         | PR#8 `inventory-rbac`         | 🔜     |
| **J9**  | Tests unitaires + logs structurés          | PR#9 `tests-and-logging`      | 🔜     |
| **J10** | Docker Compose + déploiement Dokploy       | PR#10 `compose-dokploy-min`   | 🔜     |

---

## 📋 Checklist dynamique

| Domaine        | Élément                          | Statut |
| -------------- | -------------------------------- | ------ |
| **Gateway**    | Squelette + health + Swagger     | ✅     |
|                | Auth JWT + authorizedRoles       | ⏳     |
|                | Proxy notif-service              | 🔜     |
| **Inventaire** | Category/Location modèles + CRUD | ✅     |
|                | Asset CRUD (create/list)         | ⏳     |
|                | Filtres multi-critères           | 🔜     |
| **Événements** | Asset→notify.event               | ⏳     |
|                | unread-count (proxy)             | 🔜     |
| **Tests**      | API smoke + unitaires            | ⏳     |
| **Ops**        | Docker Compose minimal           | 🔜     |
|                | Déploiement Dokploy              | 🔜     |

🗝️ **Légende** : ✅ Terminé | ⏳ En cours | 🔜 À venir | ⏸️ En attente

---

## 🔗 Dépendances

- Variables d’environnement (`JWT_SECRET`, `KAFKA_BROKER`, `MONGO_URL`)
- Service `notification-service` déjà fonctionnel
- Topics Kafka `log.action` & `notify.event` créés
- Alignement des rôles MG (`MG_COS`, `MG_COB`, `MG_AGT`)

---

## ⚠️ Risques & Atténuations

| Risque                          | Impact            | Mitigation                |
| ------------------------------- | ----------------- | ------------------------- |
| Kafka indisponible              | Bloque notif/logs | Bus mémoire local en dev  |
| Bureau scoping non défini       | Retarde RBAC      | Découpler en feature flag |
| Import Excel long à implémenter | Déplace MVP       | Faire CLI temporaire      |
| Perf MongoDB                    | Ralentissements   | Créer index dès J6        |

---

## ✅ Stratégie de PR & Validation

- **1 PR / jour**, validée après test local.
- Workflow CI : lint → test → build → docker build.
- Chaque PR **déployable individuellement** (feature flag si besoin).

---

## 📊 Résumé Sprint D0

| Catégorie   | Terminé | En cours | À faire |
| ----------- | ------- | -------- | ------- |
| Gateway     | 1/3     | 1        | 1       |
| Inventaire  | 1/3     | 1        | 1       |
| Événements  | 0       | 1        | 1       |
| Tests / Ops | 0       | 1        | 2       |

**Progression estimée :** 35% terminée, 10% en cours, 55% restante.

---

## 🎯 Prochaines Actions

1. Démarrer **Gateway + Auth JWT** (J1–J2)
2. Connecter **Notif-service via Kafka** (J3)
3. Implémenter **Inventaire CRUD MVP** (J4–J6)
4. Déployer la **stack minimale Docker** (J10)

---

## ⚠️ Points d’attention

- Bureau Scoping encore en discussion avec MG
- Indices MongoDB à vérifier dès >5000 actifs
- Ajout futur du Dashboard de supervision des microservices

---

**Rédigé par :**  
🧑‍💻 _Assistant de Workflow Procédural – Alpha Software Development_  
📆 _20 octobre 2025_
