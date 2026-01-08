# 🏗️ SIGEM – Architecture Backend Microservices

### Version : 1.0 — Mise à jour du 20/10/2025

**Langue** : Français  
**Responsable technique** : Alpha Software Development  
**Nom du système** : SIGEM (Système Intégré de Gestion du Matériel)

---

## 🧩 Objectif

Mettre en place une architecture **modulaire et évolutive** basée sur des microservices indépendants, interconnectés via **Kafka** pour la communication asynchrone, et **MongoDB** comme base de données principale.  
Cette structure vise la **stabilité**, la **traçabilité** et la **scalabilité** du système de gestion d’actifs du département MG.

---

## 🧱 Structure générale

```text
                ┌──────────────────────────┐
                │        API Gateway        │
                │ (Express, Auth, Routing)  │
                └────────────┬──────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐   ┌──────▼─────────┐   ┌──────▼─────────┐
│ NotificationSvc │   │  InventorySvc  │   │  VehicleSvc    │
│ (Socket.IO,Kafka│   │ CRUD, Filters  │   │ Gestion véhicules│
│ MongoDB Logs)   │   │ MongoDB Assets │   │ MongoDB Fleet  │
└────────┬────────┘   └──────┬─────────┘   └──────┬─────────┘
         │                   │                   │
         ▼                   ▼                   ▼
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │  LogSvc    │      │  AuthSvc   │      │  ReportSvc │
   │ Kafka→DB   │      │ JWT, RBAC  │      │ Exports,PDF│
   └────────────┘      └────────────┘      └────────────┘
```
