# Guide d'exploitation On-Prem SIGEM

Ce dossier contient l'organisation Docker Compose on-prem utilisée pour exécuter SIGEM sur le serveur.

Le modèle de déploiement est organisé service par service :

- infrastructure partagée : `mongo`
- point d'entrée API : `api-gateway`
- frontend : `client`
- services métier démarrés indépendamment :
  - `vehicle-service`
  - `reference-service`
  - `notification-service`
  - `log-service`
  - `provider-service`

L'objectif est de pouvoir démarrer, arrêter, redémarrer et déboguer un service sans interrompre toute la plateforme.

## 1. Prérequis serveur

Installez d'abord les éléments suivants sur le serveur :

- `git`
- `node` 20.x
- `npm`
- `docker`
- le plugin Docker Compose (`docker compose`)

Vérifications rapides :

```bash
node -v
npm -v
docker -v
docker compose version
```

## 2. Cloner le projet sur le serveur

Exemple :

```bash
git clone https://github.com/fredpatch/sigem.git
cd sigem
```

Installez une seule fois les dépendances du workspace :

```bash
npm install
```

## 3. Préparer le fichier d'environnement on-prem

Créez le fichier d'environnement d'exécution à partir de l'exemple :

```bash
cp infra/compose/onprem/.env.onprem.example infra/compose/onprem/.env.onprem
```

Puis modifiez-le :

```bash
nano infra/compose/onprem/.env.onprem
```

Vérifiez attentivement ces valeurs avant le premier démarrage :

- `PUBLIC_URL`
- `CLIENT_PORT`
- `API_GATEWAY_PORT`
- `NOTIFICATION_SERVICE_PORT`
- `VEHICLE_SERVICE_PORT`
- `REFERENCE_SERVICE_PORT`
- `PROVIDER_SERVICE_PORT`
- `LOG_SERVICE_PORT`
- `MONGO_ROOT_USERNAME`
- `MONGO_ROOT_PASSWORD`
- `MONGO_DATABASE`
- `MARIADB_HOST`
- `MARIADB_PORT`
- `MARIADB_USER`
- `MARIADB_PASSWORD`
- `MARIADB_DATABASE`
- `KAFKA_BROKERS`
- `KAFKA_SSL`
- `KAFKA_SASL_ENABLED`
- `BOOTSTRAP_SUPER_ADMIN_ENABLED`
- `BOOTSTRAP_SUPER_ADMIN_MATRICULATION`
- `BOOTSTRAP_SUPER_ADMIN_USERNAME`
- `BOOTSTRAP_SUPER_ADMIN_PASSWORD`
- `BOOTSTRAP_SUPER_ADMIN_EMAIL`

Notes :

- Si Kafka n'est pas encore disponible, laissez `KAFKA_BROKERS=` vide et utilisez le mode sans Kafka prévu par les services.
- `PUBLIC_URL` doit correspondre à l'URL réellement utilisée par les utilisateurs sur le serveur, par exemple `http://server-ip:8080` ou votre nom DNS interne.
- Pour un déploiement proche de la production, privilégiez `NODE_ENV=production`.

## 4. Construire et démarrer depuis le serveur

Toutes les commandes ci-dessous s'exécutent depuis la racine du dépôt :

```bash
cd /path/to/sigem
```

### Étape 1 : démarrer l'infrastructure partagée

```bash
npm run onprem:core:up
```

Cette commande démarre uniquement Mongo.

### Étape 2 : démarrer les services backend un par un

Démarrez les services dans cet ordre :

```bash
npm run onprem:vehicle:up
npm run onprem:reference:up
npm run onprem:notification:up
npm run onprem:log:up
npm run onprem:provider:up
```

Ensuite, démarrez la gateway :

```bash
npm run onprem:gateway:up
```

Puis démarrez le frontend :

```bash
npm run onprem:client:up
```

## 5. Ordre conseillé pour un premier déploiement

Pour un déploiement initial sur un nouveau serveur, utilisez cette séquence :

1. `npm run onprem:core:up`
2. `npm run onprem:vehicle:up`
3. `npm run onprem:gateway:up`
4. `npm run onprem:client:up`
5. `npm run onprem:reference:up`
6. `npm run onprem:notification:up`
7. `npm run onprem:log:up`
8. `npm run onprem:provider:up`

Cette approche rend le déploiement progressif et facilite le diagnostic en cas de problème.

## 6. Vérifier l'état des conteneurs sur le serveur

Lister les conteneurs en cours d'exécution :

```bash
docker ps
```

Vérifier spécifiquement la stack on-prem :

```bash
docker compose --env-file infra/compose/onprem/.env.onprem \
  -f infra/compose/onprem/docker-compose.core.yml \
  -f infra/compose/onprem/docker-compose.vehicle.yml \
  -f infra/compose/onprem/docker-compose.api-gateway.yml \
  -f infra/compose/onprem/docker-compose.client.yml \
  ps
```

## 7. Suivre les logs sur le serveur

Logs de la stack pilote :

```bash
npm run onprem:pilot:logs
```

Un seul conteneur :

```bash
docker logs -f sigem-onprem-api-gateway
docker logs -f sigem-onprem-vehicle-service
docker logs -f sigem-onprem-notification-service
docker logs -f sigem-onprem-provider-service
docker logs -f sigem-onprem-reference-service
docker logs -f sigem-onprem-log-service
docker logs -f sigem-onprem-client
```

## 8. Arrêter ou redémarrer un service sans interrompre les autres

Arrêter un service :

```bash
npm run onprem:provider:down
```

Redémarrer un service en le relançant :

```bash
npm run onprem:provider:up
```

Vous pouvez faire la même chose avec :

- `onprem:vehicle:*`
- `onprem:reference:*`
- `onprem:notification:*`
- `onprem:log:*`
- `onprem:gateway:*`
- `onprem:client:*`

## 9. Arrêter la tranche pilote

```bash
npm run onprem:pilot:down
```

Cette commande arrête la stack pilote définie par :

- `core`
- `vehicle-service`
- `api-gateway`
- `client`

## 10. Vérifications de santé

Exemples depuis le serveur :

```bash
curl http://localhost:4000/v1/health
curl http://localhost:4003/v1/health
curl http://localhost:4006/v1/health
curl http://localhost:4001/v1/health
curl http://localhost:4004/v1/health
curl http://localhost:4010/v1/health
curl http://localhost:8080
```

Adaptez les ports si vous les avez modifiés dans `.env.onprem`.

## 11. Mettre à jour le projet sur le serveur

Après avoir récupéré le nouveau code :

```bash
git pull origin main
npm install
```

Puis reconstruisez uniquement le service modifié en relançant son script `onprem:*:up`.

Exemples :

```bash
npm run onprem:provider:up
npm run onprem:notification:up
npm run onprem:gateway:up
```

## 12. Notes d'exploitation

- `api-gateway` est le point d'entrée exposé au navigateur pour les API backend.
- Les services internes doivent être consommés via la gateway depuis le client.
- `notification-service` dépend du proxy socket configuré dans le nginx du client.
- `provider-service`, `reference-service` et `vehicle-service` peuvent être redémarrés indépendamment.
- `inventory-service` ne fait pas encore partie de ce déploiement on-prem.
- Conservez `.env.onprem` sur le serveur et ne le versionnez pas avec des secrets serveur.
