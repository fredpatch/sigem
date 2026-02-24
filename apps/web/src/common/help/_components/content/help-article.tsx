import * as React from "react";

export type HelpArticle = {
  title: string;
  updatedAt?: string; // optionnel
  content: React.ReactNode;
};

type Key = `${string}/${string}`; // "section/topic"

export const HELP_ARTICLES: Record<Key, HelpArticle> = {
  "getting-started/overview": {
    title: "Vue d’ensemble",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          SIGEM est une application de gestion pour le suivi du patrimoine, du
          parc automobile et des opérations associées (documents, maintenance,
          utilisateurs).
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Ce que vous pouvez faire</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Gérer les biens (création, mise à jour, statut, localisation).
            </li>
            <li>Gérer les véhicules (affectation, kilométrage, suivi).</li>
            <li>Suivre les documents véhicules (validité, rappels).</li>
            <li>
              Planifier et suivre les tâches de maintenance (modèles +
              récurrence).
            </li>
            <li>Administrer les utilisateurs (rôles, sécurité, 2FA).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            Comment l’application “se comporte”
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les actions dans les tables s’appliquent toujours à la ligne
              sélectionnée (véhicule, document, tâche…).
            </li>
            <li>
              Les documents ont une date d’expiration : le système peut afficher
              des statuts et envoyer des rappels.
            </li>
            <li>
              Les tâches de maintenance peuvent être récurrentes : terminer une
              tâche peut générer automatiquement la suivante selon le modèle.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Gardez le kilométrage des véhicules à jour (important pour les
              tâches “par km”).
            </li>
            <li>
              Renseignez les dates d’expiration des documents pour activer le
              suivi.
            </li>
            <li>
              Utilisez les emplacements pour produire une localisation fiable
              des biens.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "getting-started/navigation": {
    title: "Navigation & raccourcis",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          L’application est organisée par modules accessibles via la barre
          latérale. Chaque module possède des pages “listing” (tableaux) et
          parfois des actions rapides (modals) pour créer ou modifier des
          éléments.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) La barre latérale (menu)</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Utilisez le menu pour passer rapidement d’un module à un autre
              (Patrimoine, Véhicules, Documents, Maintenance, Emplacements…).
            </li>
            <li>
              Les pages administratives (Utilisateurs, paramètres) peuvent être
              visibles uniquement selon votre rôle.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Les pages “listing” (tables)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les tableaux affichent une liste filtrable (recherche, statuts,
              etc.).
            </li>
            <li>
              Les actions à droite (icônes) s’appliquent toujours à la ligne
              sélectionnée (véhicule, document, tâche…).
            </li>
            <li>
              Sur certaines pages, une zone “Guidelines” sous la table rappelle
              les règles et les actions principales.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Actions rapides (modals)</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Certaines actions ouvrent une fenêtre (modal) pour saisir ou
              modifier des informations (ex : ajouter un document, planifier une
              tâche).
            </li>
            <li>
              Dans un modal, les champs essentiels sont en haut : remplissez-les
              en priorité (dates d’expiration, kilométrage, statut…).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Comprendre les statuts</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les statuts servent à prioriser : un document “expiré” ou une
              tâche “en retard” doit être traité en premier.
            </li>
            <li>
              Les statuts peuvent être mis à jour automatiquement (ex : tâches
              de maintenance selon date/kilométrage).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Utilisez la recherche pour retrouver un élément plutôt que de
              parcourir toute la liste.
            </li>
            <li>
              Mettez à jour le kilométrage des véhicules dès qu’un entretien est
              réalisé.
            </li>
            <li>
              Renseignez les dates d’expiration pour activer le suivi de
              conformité.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "getting-started/roles": {
    title: "Rôles & permissions (RBAC)",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          L’accès aux fonctionnalités de l’application est contrôlé par un
          système de rôles (RBAC – Role Based Access Control). Chaque
          utilisateur se voit attribuer un rôle qui définit ce qu’il peut voir
          et faire.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Pourquoi des rôles ?</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Sécuriser l’application en limitant l’accès aux actions sensibles.
            </li>
            <li>Adapter l’interface selon le profil de l’utilisateur.</li>
            <li>
              Éviter les erreurs de manipulation sur des données critiques.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Rôles courants</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Super Administrateur</strong> : accès complet à tous les
              modules, gestion des utilisateurs et des paramètres globaux.
            </li>
            <li>
              <strong>Administrateur</strong> : gestion opérationnelle (biens,
              véhicules, documents, maintenance), sans accès aux réglages
              critiques.
            </li>
            <li>
              <strong>MG (Gestion)</strong> : accès aux modules métiers selon
              son périmètre (patrimoine, parc auto, documents).
            </li>
            <li>
              <strong>Utilisateur standard</strong> : accès en lecture ou
              actions limitées selon la configuration.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Ce que le rôle impacte</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Les menus visibles dans la barre latérale.</li>
            <li>
              Les boutons d’action disponibles (ajouter, modifier, supprimer).
            </li>
            <li>
              L’accès aux pages administratives (utilisateurs, paramètres).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Attribuez les rôles les plus élevés uniquement aux personnes
              habilitées.
            </li>
            <li>Désactivez les comptes qui ne sont plus utilisés.</li>
            <li>Vérifiez régulièrement les accès pour garantir la sécurité.</li>
          </ul>
        </section>
      </div>
    ),
  },
  "getting-started/security-2fa": {
    title: "Sécurité & authentification 2FA",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          L’application utilise une authentification à deux facteurs (2FA)
          obligatoire. Tous les utilisateurs doivent valider un code à usage
          unique (OTP) pour accéder à l’application, sans exception.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) 2FA obligatoire</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Le 2FA est <strong>toujours actif</strong> pour tous les comptes.
            </li>
            <li>
              Aucun utilisateur ne peut accéder à l’application sans valider son
              code OTP.
            </li>
            <li>
              Cette mesure protège l’ensemble des données sensibles (patrimoine,
              véhicules, documents, utilisateurs).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Déroulement de la connexion
          </h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Vous saisissez vos identifiants (matricule et mot de passe).
            </li>
            <li>Un écran de validation 2FA s’affiche automatiquement.</li>
            <li>
              Vous devez entrer le <strong>code OTP</strong> pour finaliser la
              connexion.
            </li>
            <li>
              Une fois le code validé, l’accès à l’application est autorisé.
            </li>
          </ol>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Mode actuel de fonctionnement
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Actuellement, le code OTP est <strong>affiché directement</strong>{" "}
              sur l’écran de validation 2FA.
            </li>
            <li>
              Ce mode facilite la mise en place initiale et les phases de test.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Évolution prévue</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              À terme, le code OTP sera{" "}
              <strong>envoyé exclusivement par email</strong>.
            </li>
            <li>L’affichage direct du code sera supprimé.</li>
            <li>Cette évolution renforcera encore la sécurité du système.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ne partagez jamais votre code OTP.</li>
            <li>
              Assurez-vous que votre matricule est correcte et accessible.
            </li>
            <li>
              Contactez un administrateur en cas de difficulté lors de la
              validation 2FA.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "patrimoine/assets": {
    title: "Gérer les biens du patrimoine",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le module Patrimoine permet de gérer l’ensemble des biens matériels de
          l’organisation (équipements, mobilier, matériel informatique). Chaque
          bien est identifié, localisé et suivi tout au long de son cycle de
          vie.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Qu’est-ce qu’un bien ?</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un bien représente un élément matériel appartenant à
              l’organisation (ordinateur, imprimante, bureau, onduleur, etc.).
            </li>
            <li>
              Chaque bien appartient à une <strong>famille</strong> et une
              <strong> catégorie</strong>.
            </li>
            <li>
              Un bien est toujours rattaché à un <strong>emplacement</strong>.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Création d’un bien</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              La création se fait via le bouton{" "}
              <strong>“Ajouter un bien”</strong>.
            </li>
            <li>
              Les informations essentielles sont :
              <ul className="list-disc pl-5">
                <li>la catégorie,</li>
                <li>l’emplacement,</li>
                <li>le statut initial.</li>
              </ul>
            </li>
            <li>
              Le <strong>code du bien</strong> est généré automatiquement selon
              la catégorie.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Statuts des biens</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Le statut reflète l’état réel du bien.</li>
            <li>
              Exemples de statuts courants :
              <ul className="list-disc pl-5">
                <li>En service</li>
                <li>En panne</li>
                <li>Hors service</li>
                <li>Réformé</li>
              </ul>
            </li>
            <li>
              Un changement de statut permet d’identifier rapidement les biens
              non utilisables.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4) Localisation et emplacements
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Chaque bien est localisé via un emplacement structuré (site →
              bâtiment → direction → bureau).
            </li>
            <li>
              La localisation permet des statistiques et un suivi précis par
              service.
            </li>
            <li>
              Modifier l’emplacement d’un bien met à jour sa localisation
              partout dans l’application.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            5) Modification et désactivation
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les informations d’un bien peuvent être mises à jour à tout
              moment.
            </li>
            <li>
              La désactivation permet de retirer un bien du service actif tout
              en conservant l’historique.
            </li>
            <li>
              Les biens désactivés ne sont plus utilisables mais restent
              traçables.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Choisissez la bonne catégorie dès la création pour éviter les
              incohérences.
            </li>
            <li>
              Maintenez les statuts à jour pour refléter la réalité du terrain.
            </li>
            <li>
              Utilisez systématiquement les emplacements pour une meilleure
              traçabilité.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "patrimoine/categories-codes": {
    title: "Catégories & codes automatiques",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les catégories permettent de classer les biens de manière cohérente.
          Elles servent aussi à générer automatiquement un code unique pour
          chaque bien, afin d’assurer la traçabilité.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Familles et catégories</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Une <strong>famille</strong> est un regroupement principal (ex :
              Équipement, Informatique, Mobilier).
            </li>
            <li>
              Une <strong>catégorie</strong> est plus précise (ex : Ordinateur
              portable, Imprimante, Bureau, Onduleur).
            </li>
            <li>
              Lors de la création d’un bien, la catégorie est obligatoire : elle
              garantit une classification uniforme.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Pourquoi la catégorie est importante
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Elle influence le <strong>code généré</strong> du bien.
            </li>
            <li>
              Elle améliore la recherche, les rapports et les statistiques.
            </li>
            <li>
              Elle facilite la gestion des stocks, des mouvements et des
              affectations.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Codes automatiques : principe
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              À la création d’un bien, l’application génère un{" "}
              <strong>code unique</strong>.
            </li>
            <li>
              Le code est basé sur la catégorie (préfixe) + un compteur
              (séquence).
            </li>
            <li>
              Cela évite les doublons et assure une identification fiable dans
              le temps.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Exemple (illustratif)</div>
            <div className="text-muted-foreground">
              Un bien “Ordinateur portable” peut recevoir un code du type :{" "}
              <span className="font-semibold">IOP-003</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Changement de catégorie</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Si la catégorie d’un bien est modifiée, le code peut être mis à
              jour selon les règles de l’application.
            </li>
            <li>
              Cette opération doit être faite avec prudence afin de garder une
              traçabilité cohérente.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Choisissez la catégorie la plus précise possible dès la création.
            </li>
            <li>
              Évitez de changer de catégorie sans raison (cela peut modifier
              l’identifiant).
            </li>
            <li>
              Gardez une nomenclature claire et stable pour les catégories.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "patrimoine/statuses": {
    title: "Statuts des biens",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les statuts permettent de suivre l’état réel des biens dans le temps.
          Ils aident à prioriser les interventions (réparation, remplacement) et
          à produire des rapports fiables.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) À quoi sert le statut ?</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Identifier rapidement les biens utilisables et non utilisables.
            </li>
            <li>Faciliter le suivi des pannes, réparations et réformes.</li>
            <li>
              Améliorer les statistiques (disponibilité, taux de panne, etc.).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Statuts courants</h2>
          <p className="text-sm text-muted-foreground">
            Les libellés peuvent varier selon votre configuration, mais le
            principe reste le même :
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">En service</div>
              <div className="text-sm text-muted-foreground">
                Le bien est opérationnel et utilisé normalement.
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">En panne</div>
              <div className="text-sm text-muted-foreground">
                Le bien n’est pas utilisable et nécessite une intervention.
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Hors service</div>
              <div className="text-sm text-muted-foreground">
                Le bien est indisponible pour une durée indéterminée (souvent en
                attente de décision ou de réparation).
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Réformé</div>
              <div className="text-sm text-muted-foreground">
                Le bien est retiré du service (fin de vie / remplacement) mais
                reste conservé dans l’historique.
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Bonnes pratiques de mise à jour
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Mettez à jour le statut dès qu’un événement important se produit
              (panne, réparation, réforme).
            </li>
            <li>
              Utilisez <strong>En panne</strong> pour déclencher une action, et
              évitez de laisser un bien “En service” s’il est inutilisable.
            </li>
            <li>
              Si un bien ne doit plus être utilisé, privilégiez{" "}
              <strong>Réformé</strong>
              (au lieu de supprimer), afin de conserver la traçabilité.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Impact sur la gestion</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les tableaux et indicateurs peuvent mettre en avant les biens “En
              panne” ou “Hors service” pour faciliter le suivi.
            </li>
            <li>
              Les rapports et statistiques s’appuient sur les statuts : un
              statut incorrect fausse les résultats.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "vehicules/manage": {
    title: "Gérer les véhicules",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le module Parc automobile permet d’enregistrer et suivre les véhicules
          de l’organisation. Chaque véhicule est identifié, peut être affecté à
          un agent, et sert de base au suivi des documents et de la maintenance.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Informations principales</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Chaque véhicule est identifié par son{" "}
              <strong>immatriculation</strong> (unique).
            </li>
            <li>
              Les champs courants : marque, modèle, type, énergie, année, etc.
            </li>
            <li>
              Le <strong>statut</strong> indique si le véhicule est opérationnel
              ou non.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Création d’un véhicule</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Cliquez sur <strong>“Ajouter un véhicule”</strong>.
            </li>
            <li>
              Renseignez au minimum : immatriculation, marque, modèle et statut.
            </li>
            <li>
              Indiquez le <strong>kilométrage actuel</strong> si disponible
              (utile pour la maintenance).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Statuts véhicules (principe)
          </h2>
          <p className="text-sm text-muted-foreground">
            Les libellés peuvent varier, mais l’objectif est de refléter l’état
            réel du véhicule :
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Actif</div>
              <div className="text-sm text-muted-foreground">
                Véhicule disponible et en service.
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">En maintenance</div>
              <div className="text-sm text-muted-foreground">
                Véhicule temporairement indisponible (entretien / réparation).
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Inactif</div>
              <div className="text-sm text-muted-foreground">
                Véhicule non utilisé (parké, attente de décision).
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Retiré</div>
              <div className="text-sm text-muted-foreground">
                Véhicule retiré du parc (historique conservé).
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4) Liens avec documents & maintenance
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les <strong>documents</strong> (assurance, visite technique…) sont
              enregistrés par véhicule, avec dates d’expiration.
            </li>
            <li>
              Les <strong>tâches</strong> (vidange, entretien…) peuvent être
              planifiées pour un véhicule et suivies dans le module maintenance.
            </li>
            <li>
              Mettre à jour correctement le véhicule facilite la conformité et
              le suivi global.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Vérifiez l’immatriculation avant d’enregistrer (unicité).</li>
            <li>
              Mettez à jour le statut dès qu’un véhicule devient indisponible.
            </li>
            <li>
              Renseignez et maintenez le kilométrage (important pour les alertes
              “par km”).
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "vehicules/assignment": {
    title: "Affectation",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          L’affectation permet d’indiquer à qui (ou à quel service) un véhicule
          est attribué. Elle facilite la traçabilité, la responsabilisation et
          le suivi opérationnel du parc.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) À quoi sert l’affectation ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Identifier rapidement le responsable ou le service utilisateur du
              véhicule.
            </li>
            <li>Améliorer le suivi des utilisations et des mouvements.</li>
            <li>
              Faciliter les recherches (ex : “tous les véhicules affectés à une
              direction”).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Comment affecter un véhicule
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              L’affectation se fait lors de la création ou via la modification
              d’un véhicule.
            </li>
            <li>
              Selon la configuration, vous pouvez affecter à :
              <ul className="list-disc pl-5">
                <li>un agent / utilisateur,</li>
                <li>une direction / service,</li>
                <li>un emplacement (bureau) de référence.</li>
              </ul>
            </li>
            <li>
              L’objectif est d’avoir un point de repère clair :{" "}
              <strong>qui utilise</strong> le véhicule et <strong>où</strong> il
              est rattaché.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Ce que ça change dans l’application
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les listes et filtres peuvent afficher les véhicules par
              affectation.
            </li>
            <li>
              Les documents et tâches restent liés au véhicule, indépendamment
              de l’affectation, mais l’affectation facilite la gestion “par
              responsable”.
            </li>
            <li>
              En cas de changement d’utilisateur/service, vous pouvez mettre à
              jour l’affectation sans perdre l’historique du véhicule.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Mettez à jour l’affectation dès qu’un véhicule change de
              responsable.
            </li>
            <li>
              Évitez de laisser un véhicule “sans affectation” si un responsable
              existe.
            </li>
            <li>
              Utilisez une convention claire (agent principal / service) pour
              rester cohérent.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "vehicules/mileage": {
    title: "Kilométrage",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le kilométrage est une information essentielle pour le suivi du parc
          automobile. Il permet de déclencher certaines tâches de maintenance
          (ex : vidange) et de maintenir un historique fiable des interventions.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Pourquoi le kilométrage est important ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Certaines tâches sont planifiées en fonction d’un{" "}
              <strong>seuil kilométrique</strong>
              (ex : tous les 5 000 km).
            </li>
            <li>
              Le kilométrage permet d’identifier les véhicules très sollicités
              et d’anticiper l’entretien.
            </li>
            <li>
              Un kilométrage à jour améliore la fiabilité des alertes et du
              suivi.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Quand le mettre à jour ?</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Lors de la création du véhicule (kilométrage actuel).</li>
            <li>
              Lorsqu’une intervention est réalisée (souvent lors de la clôture
              d’une tâche).
            </li>
            <li>
              Lors d’un contrôle périodique (ex : fin de semaine / fin de mois).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Impact sur les tâches de maintenance
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Les tâches basées sur le kilométrage utilisent la valeur
              enregistrée pour calculer si la tâche est <strong>à venir</strong>
              , <strong>bientôt due</strong> ou <strong>en retard</strong>.
            </li>
            <li>
              Lors de la clôture d’une tâche, le kilométrage saisi peut devenir
              la référence pour la prochaine échéance.
            </li>
            <li>
              Si le kilométrage est incorrect, les alertes peuvent être
              faussées.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Exemple (illustratif)</div>
            <div className="text-muted-foreground">
              Vidange tous les 5 000 km : si le véhicule est à 45 000 km, la
              prochaine échéance est vers 50 000 km.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Évitez les mises à jour approximatives : utilisez la valeur réelle
              du compteur.
            </li>
            <li>
              Ne diminuez pas le kilométrage (cela peut casser le suivi ou créer
              des incohérences).
            </li>
            <li>
              En cas d’erreur, corrigez rapidement et documentez la modification
              (note / commentaire).
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "vehicules/actions": {
    title: "Actions rapides (docs / tâches)",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Depuis la liste des véhicules, certaines actions permettent d’agir
          rapidement sur un véhicule sans quitter la page : ajouter un document,
          planifier une tâche, modifier ou désactiver. Ces actions s’appliquent
          toujours au véhicule de la ligne sélectionnée.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Règle principale</h2>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Important</div>
            <div className="text-muted-foreground">
              Les actions de la colonne “Actions” s’appliquent au{" "}
              <strong>véhicule de la ligne</strong>. Vérifiez l’immatriculation
              avant de valider une action.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Ajouter un document</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Cette action permet d’enregistrer un document (assurance, visite
              technique, carte…) lié au véhicule sélectionné.
            </li>
            <li>
              Renseignez la <strong>date d’expiration</strong> pour activer le
              suivi et les alertes.
            </li>
            <li>
              Les <strong>rappels</strong> (jours avant échéance) servent à
              anticiper le renouvellement.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Planifier une tâche (maintenance)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Cette action crée une tâche de maintenance liée au véhicule (ex :
              vidange, entretien).
            </li>
            <li>
              Utilisez un <strong>modèle de tâche</strong> pour activer la
              récurrence automatique.
            </li>
            <li>
              Définissez le déclencheur : <strong>date</strong>,{" "}
              <strong>kilométrage</strong> ou les deux.
            </li>
            <li>
              Une tâche terminée peut générer automatiquement la suivante si
              elle est récurrente.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Modifier / Désactiver</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Modifier</strong> : met à jour les informations (statut,
              affectation, données…).
            </li>
            <li>
              <strong>Désactiver</strong> (ou retirer) : retire le véhicule du
              parc actif tout en conservant l’historique.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Checklists rapides (quand vous êtes perdu)
          </h2>

          {/* 1) Ajouter un véhicule */}
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              1) Ajouter un véhicule (checklist)
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Parc automobile</strong> → cliquez sur{" "}
                <strong>Ajouter un véhicule</strong>.
              </li>
              <li>
                Renseignez l’<strong>immatriculation</strong> (unique), la{" "}
                <strong>marque</strong> et le <strong>modèle</strong>.
              </li>
              <li>
                Définissez le <strong>statut</strong> (ex : Actif / En
                maintenance).
              </li>
              <li>
                Renseignez le <strong>kilométrage actuel</strong> si disponible
                (recommandé).
              </li>
              <li>
                Ajoutez l’<strong>affectation</strong> si le véhicule est
                attribué (agent/service).
              </li>
              <li>
                Enregistrez. Ensuite, ajoutez les <strong>documents</strong> et
                planifiez la <strong>maintenance</strong>.
              </li>
            </ol>
          </div>

          {/* 2) Ajouter un document */}
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              2) Ajouter un document à un véhicule (checklist)
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Dans la liste des véhicules, trouvez le véhicule
                (immatriculation).
              </li>
              <li>
                Cliquez sur l’action <strong>Document</strong> (icône document)
                de la ligne.
              </li>
              <li>
                Choisissez le <strong>type de document</strong> (assurance,
                visite technique…).
              </li>
              <li>
                Renseignez la <strong>date d’expiration</strong> (obligatoire
                pour le suivi).
              </li>
              <li>
                Ajoutez des <strong>rappels</strong> (ex : 30, 15, 7 jours avant
                l’échéance).
              </li>
              <li>
                Enregistrez. Le document apparaît dans la page{" "}
                <strong>Documents véhicules</strong>.
              </li>
            </ol>
          </div>

          {/* 3) Planifier une maintenance */}
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              3) Planifier une maintenance (vidange, entretien…) - checklist
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Depuis la liste des véhicules, cliquez sur{" "}
                <strong>Planifier une tâche</strong> (icône clé/outil) sur la
                ligne du véhicule.
              </li>
              <li>
                Choisissez un <strong>modèle de tâche</strong> si disponible
                (recommandé pour la récurrence).
              </li>
              <li>
                Définissez l’échéance : <strong>date</strong>,{" "}
                <strong>kilométrage</strong>, ou les deux.
              </li>
              <li>
                Vérifiez le <strong>kilométrage actuel</strong> du véhicule
                (important si déclencheur par km).
              </li>
              <li>
                Enregistrez. La tâche apparaît dans{" "}
                <strong>Suivi des véhicules</strong>.
              </li>
              <li>
                Quand la tâche est réalisée : ouvrez la tâche →{" "}
                <strong>Terminer</strong> → saisissez le kilométrage réel.
              </li>
            </ol>
          </div>

          {/* 4) Planifier le suivi (monitoring) d’un document */}
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              4) Planifier le suivi d’un document (renouvellement) - checklist
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ajoutez le document avec sa <strong>date d’expiration</strong>{" "}
                (voir checklist #2).
              </li>
              <li>
                Dans <strong>Documents véhicules</strong>, vérifiez son{" "}
                <strong>statut</strong> (Valide / Bientôt / Expiré).
              </li>
              <li>
                Assurez-vous que des <strong>rappels</strong> sont définis (ex :
                30, 15, 7 jours).
              </li>
              <li>
                Si vous souhaitez une action de renouvellement : cliquez sur{" "}
                <strong>Planifier une tâche</strong> depuis le document (ex :
                “Renouvellement assurance”).
              </li>
              <li>
                Définissez la date limite avant expiration (ex : 7 jours avant).
              </li>
              <li>
                Quand le document est renouvelé : mettez à jour le document
                (nouvelle date d’expiration) et terminez la tâche.
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Ajoutez les documents dès l’intégration d’un véhicule dans le parc
              (conformité).
            </li>
            <li>
              Planifiez les tâches récurrentes (vidange) dès que le kilométrage
              est connu.
            </li>
            <li>
              Mettez à jour le kilométrage lors des interventions pour
              fiabiliser les alertes.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "documents/validity-status": {
    title: "Validité & statuts",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le module Documents véhicules centralise tous les documents liés au
          parc automobile (assurance, visite technique, carte grise, etc.).
          Chaque document possède une date d’expiration qui permet d’identifier
          automatiquement les documents à risque.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Ce qu’est un document véhicule
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un document est toujours lié à un <strong>véhicule précis</strong>
              .
            </li>
            <li>
              Il contient généralement : un type, une référence (optionnelle),
              une date d’expiration et des notes.
            </li>
            <li>
              La <strong>date d’expiration</strong> est l’élément principal pour
              le suivi.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Statuts de validité (automatiques)
          </h2>
          <p className="text-sm text-muted-foreground">
            Le statut est <strong>attribué automatiquement</strong> dès qu’un
            document possède une <strong>date d’expiration</strong>. Vous n’avez
            rien à sélectionner : l’application calcule l’état du document en
            fonction du temps restant.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Valide</div>
              <div className="text-sm text-muted-foreground">
                La date d’expiration n’est pas encore atteinte.
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Bientôt à échéance</div>
              <div className="text-sm text-muted-foreground">
                Le document approche de l’expiration (selon la règle de préavis
                définie / rappels).
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Expiré</div>
              <div className="text-sm text-muted-foreground">
                La date d’expiration est dépassée : le document doit être
                renouvelé.
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-red-300/40 p-3 text-sm">
            <div className="font-medium text-red-900">Important</div>
            <div className="text-red-900">
              Si la date d’expiration n’est pas renseignée, le document ne peut
              pas être évalué correctement. Renseignez-la pour activer le suivi.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Priorisation : quoi traiter en premier ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Expiré</strong> : action immédiate (renouveler + mettre à
              jour le document).
            </li>
            <li>
              <strong>Bientôt à échéance</strong> : préparer le renouvellement
              (planifier une tâche si besoin).
            </li>
            <li>
              <strong>Valide</strong> : vérification régulière, aucun blocage.
            </li>
          </ul>

          <div className="rounded-lg border bg-blue-300/30 p-3 text-sm">
            <div className="font-medium text-blue-900">Conseil</div>
            <div className="text-blue-900">
              Utilisez les filtres pour afficher uniquement les documents
              “Expirés” ou “Bientôt à échéance”.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Renseignez systématiquement la date d’expiration pour activer le
              suivi.
            </li>
            <li>
              Définissez des rappels cohérents (ex : 30, 15, 7 jours avant
              expiration).
            </li>
            <li>
              Après renouvellement, mettez à jour la date d’expiration
              immédiatement.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "documents/reminders": {
    title: "Rappels & alertes",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les rappels permettent d’anticiper l’expiration des documents
          (assurance, visite technique, etc.). Ils aident à éviter les
          situations “expiré” en déclenchant des alertes avant l’échéance.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Comment ça fonctionne ?</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un rappel est un{" "}
              <strong>nombre de jours avant l’expiration</strong>.
            </li>
            <li>
              Exemple : “30 jours” signifie qu’une alerte peut être déclenchée
              30 jours avant la date d’expiration.
            </li>
            <li>
              Les rappels fonctionnent uniquement si la{" "}
              <strong>date d’expiration</strong> est renseignée.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Exemple</div>
            <div className="text-muted-foreground">
              Expiration le 30/06, rappels 30-15-7 : alertes possibles le 31/05,
              le 15/06 et le 23/06.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) À quoi servent les alertes ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Informer qu’un document approche de l’échéance.</li>
            <li>Permettre de planifier le renouvellement à temps.</li>
            <li>Réduire les risques de non-conformité (documents expirés).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Configurer les rappels (bon réglage)
          </h2>
          <p className="text-sm text-muted-foreground">
            Les rappels doivent être adaptés au type de document et à vos délais
            de traitement.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Réglage standard (recommandé)</div>
              <div className="mt-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>30 jours</li>
                  <li>15 jours</li>
                  <li>7 jours</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="font-semibold">Réglage “urgent”</div>
              <div className="mt-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>14 jours</li>
                  <li>7 jours</li>
                  <li>3 jours</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Important</div>
            <div className="text-muted-foreground">
              Plus le délai de traitement est long (validation, paiement,
              rendez-vous), plus les rappels doivent être anticipés.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Définissez des rappels dès la création du document (ne pas
              attendre).
            </li>
            <li>
              Après renouvellement, mettez à jour la{" "}
              <strong>nouvelle date d’expiration</strong>
              (sinon les rappels deviennent faux).
            </li>
            <li>
              Si vous planifiez une tâche de renouvellement, alignez sa date
              limite avec le dernier rappel (ex : 7 jours avant expiration).
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "documents/from-doc-to-task": {
    title: "Planifier une tâche depuis un document",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Depuis un document véhicule, vous pouvez planifier une tâche de
          renouvellement ou de contrôle (ex : renouvellement assurance, visite
          technique). Cette méthode est idéale pour transformer une échéance
          “document” en action de suivi concrète.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Pourquoi planifier une tâche depuis un document ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Assurer un suivi actif (une échéance devient une action à
              réaliser).
            </li>
            <li>
              Éviter d’oublier un renouvellement, surtout quand le délai de
              traitement est long.
            </li>
            <li>
              Centraliser le suivi dans le module Maintenance (tâches ouvertes /
              en retard / terminées).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Comment ça marche</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              La tâche est automatiquement liée au <strong>véhicule</strong> du
              document.
            </li>
            <li>
              Vous choisissez un modèle de tâche (recommandé) ou créez une tâche
              manuelle.
            </li>
            <li>
              Vous définissez une échéance (date) pour réaliser l’action avant
              l’expiration.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Conseil</div>
            <div className="text-muted-foreground">
              Fixez l’échéance de la tâche <strong>avant</strong> l’expiration
              (ex : 7 ou 15 jours avant).
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            Mise à jour automatique (workflow)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Lorsque vous <strong>terminez une tâche planifiée</strong>,
              l’application met à jour automatiquement les informations via
              l’API.
            </li>
            <li>
              Selon le type de tâche, cela peut mettre à jour : la tâche
              (statut), le véhicule (ex : kilométrage) et le document (ex :
              nouvelle validité).
            </li>
            <li>
              Par bonne pratique, nous recommandons de vérifier rapidement que
              les informations critiques ont bien été mises à jour.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Checklist rapide (recommandée)
          </h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Planifier un renouvellement depuis un document
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Documents véhicules</strong> et trouvez le
                document concerné.
              </li>
              <li>
                Vérifiez la <strong>date d’expiration</strong> et le statut
                (Valide / Bientôt / Expiré).
              </li>
              <li>
                Cliquez sur <strong>Planifier une tâche</strong> depuis la ligne
                du document.
              </li>
              <li>
                Sélectionnez un <strong>modèle de tâche</strong> (ex :
                “Renouvellement assurance”) si disponible.
              </li>
              <li>
                Définissez la <strong>date limite</strong> (ex : 7 ou 15 jours
                avant expiration).
              </li>
              <li>
                Une fois la tâche terminée, le système met à jour
                automatiquement les informations (tâche, véhicule et document)
                via l’API.
              </li>
              <li>
                Pour bonne mesure, vérifiez que :
                <ul className="list-disc pl-5">
                  <li className="text-red-800">
                    la nouvelle date d’expiration du document est correcte,
                  </li>
                  <li className="text-red-800">
                    les informations du véhicule (si concernées) sont bien à
                    jour.
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Cas pratique (exemple)</h2>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Assurance</div>
            <div className="text-muted-foreground">
              Expire le 30/06 → planifier la tâche “Renouvellement assurance”
              avec une échéance au 15/06. Après renouvellement, modifier le
              document : nouvelle expiration (ex : 30/06 de l’année suivante)
              puis terminer la tâche.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Ne planifiez pas la tâche “le jour même” de l’expiration :
              anticipez.
            </li>
            <li>
              Alignez la date limite sur vos rappels (ex : dernier rappel = 7
              jours).
            </li>
            <li>
              Après renouvellement, mettez à jour le document immédiatement
              (sinon le statut reste faux).
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "maintenance/models": {
    title: "Modèles de tâche",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les modèles de tâche permettent d’automatiser le suivi de maintenance.
          Un modèle définit une règle (ex : “Vidange tous les 5 000 km” ou
          “Assurance tous les 12 mois”) que l’application peut utiliser pour
          générer des tâches sur un véhicule.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Modèle vs tâche : différence
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un <strong>modèle</strong> = une règle de suivi (réutilisable).
            </li>
            <li>
              Une <strong>tâche</strong> = une action concrète à réaliser (liée
              à un véhicule).
            </li>
            <li>Un modèle peut générer plusieurs tâches au fil du temps.</li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Exemple</div>
            <div className="text-muted-foreground">
              Modèle “Vidange 5 000 km” → crée une tâche “Vidange” pour un
              véhicule, puis la suivante après clôture.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Types de déclencheurs</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Par date</strong> : échéance selon une périodicité (ex :
              tous les 12 mois).
            </li>
            <li>
              <strong>Par kilométrage</strong> : seuil à atteindre (ex : tous
              les 5 000 km).
            </li>
            <li>
              <strong>Date + kilométrage</strong> : double contrôle si
              nécessaire.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Champs importants d’un modèle
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Nom / type</strong> : ce que l’on suit (vidange, contrôle,
              renouvellement…).
            </li>
            <li>
              <strong>Fréquence</strong> : délai (mois) ou intervalle (km).
            </li>
            <li>
              <strong>Préavis</strong> : quand la tâche devient “bientôt due”
              (ex : 7 jours / 500 km).
            </li>
            <li>
              <strong>Rattachement</strong> (si applicable) : modèle lié à un
              document (assurance, visite technique…).
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Conseil</div>
            <div className="text-muted-foreground">
              Utilisez des noms explicites : “Vidange 5 000 km”, “Assurance
              annuelle”, “Visite technique”.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist rapide</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Créer un modèle de tâche (checklist)
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Tâches & maintenance</strong> → section des
                modèles.
              </li>
              <li>
                Cliquez sur <strong>Nouveau modèle</strong>.
              </li>
              <li>
                Choisissez le type : <strong>date</strong>,{" "}
                <strong>kilométrage</strong> ou les deux.
              </li>
              <li>Définissez l’intervalle (ex : 12 mois / 5 000 km).</li>
              <li>
                Ajoutez un préavis (ex : 7 jours / 500 km) pour anticiper.
              </li>
              <li>
                Enregistrez : le modèle sera disponible lors de la planification
                de tâches.
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Créez d’abord les modèles récurrents (vidange, assurance, visite
              technique).
            </li>
            <li>
              Vérifiez que le kilométrage des véhicules est à jour pour les
              modèles “par km”.
            </li>
            <li>
              Préférez les modèles aux tâches manuelles pour un suivi régulier.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "maintenance/triggers": {
    title: "Déclencheurs (date / km)",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Une tâche de maintenance peut être déclenchée par une date, par un
          kilométrage, ou par les deux. Ce choix détermine comment l’application
          calcule l’échéance et les statuts (à venir, bientôt due, en retard).
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Déclencheur par date</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              La tâche devient due à une <strong>date limite</strong> définie.
            </li>
            <li>
              Recommandé pour : assurance, visite technique, contrôles
              périodiques.
            </li>
            <li>
              Le préavis (ex : 7 jours) permet d’afficher “bientôt due” avant la
              date limite.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Déclencheur par kilométrage
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              La tâche devient due à partir d’un{" "}
              <strong>seuil kilométrique</strong>.
            </li>
            <li>
              Recommandé pour : vidange, filtres, entretien basé sur l’usage.
            </li>
            <li>
              Le préavis (ex : 500 km) permet d’afficher “bientôt due” avant
              d’atteindre le seuil.
            </li>
            <li>
              Ce mode dépend fortement d’un{" "}
              <strong>kilométrage véhicule à jour</strong>.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Important</div>
            <div className="text-muted-foreground">
              Si le kilométrage n’est pas maintenu à jour, les alertes de
              maintenance “par km” peuvent être incorrectes.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Déclencheur mixte (date + km)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              La tâche peut être considérée due si l’un des deux critères est
              atteint (selon votre configuration).
            </li>
            <li>
              Utile lorsque vous souhaitez sécuriser le suivi (ex : entretien au
              plus tôt des deux).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4) Comment l’application calcule les statuts
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>À venir</strong> : loin de l’échéance.
            </li>
            <li>
              <strong>Bientôt due</strong> : dans la période de préavis (jours
              ou km).
            </li>
            <li>
              <strong>En retard</strong> : échéance dépassée (date passée ou
              seuil km dépassé).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist rapide</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Choisir le bon déclencheur</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Si l’échéance est réglementaire → choisissez{" "}
                <strong>date</strong>.
              </li>
              <li>
                Si l’échéance dépend de l’usage → choisissez{" "}
                <strong>kilométrage</strong>.
              </li>
              <li>
                Si vous voulez sécuriser avec double contrôle → choisissez{" "}
                <strong>mixte</strong>.
              </li>
              <li>
                Ajoutez toujours un <strong>préavis</strong> pour anticiper.
              </li>
            </ol>
          </div>
        </section>
      </div>
    ),
  },
  "maintenance/complete-task": {
    title: "Terminer une tâche",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Terminer une tâche permet de clôturer une intervention (vidange,
          entretien, renouvellement, etc.) et de tenir le suivi à jour. Selon le
          type de tâche, la clôture peut déclencher des mises à jour
          automatiques et préparer la prochaine échéance.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Quand terminer une tâche ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Lorsque l’intervention est effectivement réalisée.</li>
            <li>
              Après réception d’un document renouvelé (assurance, visite
              technique…).
            </li>
            <li>
              Après mise à jour des informations nécessaires (ex : kilométrage).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Mise à jour automatique (workflow)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Lorsque vous <strong>terminez une tâche planifiée</strong>,
              l’application met à jour automatiquement les informations via
              l’API.
            </li>
            <li>
              Selon la tâche, cela peut mettre à jour :
              <ul className="list-disc pl-5">
                <li>la tâche (statut, date de réalisation, notes),</li>
                <li>le véhicule (ex : kilométrage),</li>
                <li>le document lié (ex : nouvelle validité / expiration).</li>
              </ul>
            </li>
            <li>
              Si la tâche est récurrente, une prochaine tâche peut être générée
              automatiquement selon le modèle.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Bon réflexe</div>
            <div className="text-muted-foreground">
              Même si la mise à jour est automatique, nous recommandons de
              vérifier rapidement que le véhicule et/ou le document ont bien été
              mis à jour.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist (étape par étape)</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Terminer une tâche de maintenance
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Programme de suivi de maintenance</strong>.
              </li>
              <li>Recherchez la tâche concernée et ouvrez le détail.</li>
              <li>
                Renseignez les informations demandées (ex :{" "}
                <strong>kilométrage</strong>, date de réalisation, commentaire).
              </li>
              <li>
                Cliquez sur <strong>Terminer</strong> /{" "}
                <strong>Clôturer</strong>.
              </li>
              <li>
                Le système met à jour automatiquement les données via l’API
                (tâche / véhicule / document si applicable).
              </li>
              <li>
                Vérifiez rapidement :
                <ul className="list-disc pl-5">
                  <li>
                    le kilométrage du véhicule (si la tâche est basée sur km),
                  </li>
                  <li>la date d’expiration du document (si renouvellement),</li>
                  <li>
                    le statut final (terminée) et la prochaine échéance (si
                    récurrente).
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Erreurs fréquentes</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Terminer une tâche “par km” sans mettre le kilométrage à jour →
              alertes faussées.
            </li>
            <li>
              Renouveler un document mais ne pas vérifier la nouvelle date
              d’expiration → statut incorrect.
            </li>
            <li>
              Utiliser une tâche manuelle alors qu’un modèle existait → suivi
              moins automatique.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Ajoutez une note courte (ex : “Vidange + filtre”) pour conserver
              un historique clair.
            </li>
            <li>
              Gardez le kilométrage fiable : c’est la base des alertes “par km”.
            </li>
            <li>
              Après un renouvellement, vérifiez le document (date + statut) en
              10 secondes.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "emplacements/hierarchy": {
    title: "Hiérarchie & codes",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les emplacements servent à localiser précisément les biens
          (patrimoine). Une structure claire améliore la traçabilité, la
          recherche et les rapports.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Pourquoi utiliser les emplacements ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Localiser un bien rapidement (où se trouve-t-il ?).</li>
            <li>Suivre les mouvements entre bureaux / directions.</li>
            <li>
              Produire des statistiques par site, direction, bâtiment, etc.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Hiérarchie recommandée</h2>
          <p className="text-sm text-muted-foreground">
            Les emplacements suivent généralement une logique du plus large au
            plus précis :
          </p>

          <div className="rounded-xl border bg-background p-4">
            <div className="text-sm">
              <strong>Site</strong> → <strong>Bâtiment</strong> →{" "}
              <strong>Direction / Service</strong> → <strong>Bureau</strong>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Exemple : Libreville → Siège → Direction MG → Bureau 12
            </p>
          </div>

          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Site</strong> : localisation globale (ville, zone, base).
            </li>
            <li>
              <strong>Bâtiment</strong> : immeuble / hangar / bloc / annexe.
            </li>
            <li>
              <strong>Direction / Service</strong> : entité administrative.
            </li>
            <li>
              <strong>Bureau</strong> : emplacement exact (pièce, étage,
              numéro).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            3) Codes d’emplacement (générés automatiquement)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Le <strong>code d’emplacement</strong> est généré automatiquement
              par l’API.
            </li>
            <li>
              Vous n’avez pas besoin de saisir un code : il est créé selon la
              structure et les règles de l’application.
            </li>
            <li>
              Le code facilite l’identification, la recherche et les exports
              (inventaires, rapports).
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Bon réflexe</div>
            <div className="text-muted-foreground">
              Après création, vérifiez que le code généré correspond bien à
              l’emplacement (site / bâtiment / direction / bureau).
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist rapide</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Créer un emplacement (checklist)
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Emplacements</strong>.
              </li>
              <li>
                Créez d’abord les niveaux supérieurs (Site, puis Bâtiment).
              </li>
              <li>
                Ajoutez ensuite les niveaux plus précis (Direction/Service, puis
                Bureau).
              </li>
              <li>
                Enregistrez : le{" "}
                <strong>code est généré automatiquement</strong> par le système.
              </li>

              <li>
                Enregistrez et réutilisez cet emplacement lors de la création
                des biens.
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Créez la hiérarchie complète avant un inventaire.</li>
            <li>
              Gardez des noms courts et clairs (ex : “Bureau 12”, “Atelier”).
            </li>
            <li>
              Évitez les doublons : un bureau ne devrait pas exister deux fois
              au même niveau.
            </li>
            <li>
              Ne recréez pas un emplacement existant : recherchez-le d’abord
              pour éviter les doublons.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "emplacements/best-practices": {
    title: "Bonnes pratiques",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Une bonne organisation des emplacements garantit un inventaire fiable
          et une localisation précise des biens. Cette page donne des règles
          simples à suivre pour éviter les doublons et les incohérences.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Construire la hiérarchie correctement
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Respectez une logique du plus large au plus précis :
              <strong> Site → Bâtiment → Direction/Service → Bureau</strong>.
            </li>
            <li>
              Créez d’abord les niveaux supérieurs (site, bâtiment) avant
              d’ajouter les bureaux.
            </li>
            <li>
              Utilisez des noms simples et explicites (ex : “Bureau 12”,
              “Atelier”, “Magasin”).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Éviter les doublons</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Avant de créer un nouvel emplacement, faites une recherche rapide
              pour vérifier s’il n’existe pas déjà.
            </li>
            <li>
              Évitez les variantes “Bureau12 / Bureau 12 / B12” : choisissez une
              convention.
            </li>
            <li>
              Un bureau ne devrait pas exister deux fois au même niveau dans la
              même direction.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Conseil</div>
            <div className="text-muted-foreground">
              Définissez une convention interne : par exemple “Bureau XX”
              partout, ou “BXX” partout. L’important est la cohérence.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            Auto-complétion & unicité (très important)
          </h2>
          <p className="text-sm text-muted-foreground">
            L’application propose une auto-complétion : la première fois que
            vous saisissez une valeur (ex : “Libreville”, “Bâtiment A”,
            “Direction MG”…), elle est enregistrée. La prochaine fois, cette
            valeur apparaît dans la liste lorsque vous commencez à taper. Cela
            favorise l’unicité et évite les doublons.
          </p>

          <ul className="list-disc space-y-1 pl-5">
            <li>
              Exemple : vous créez “Libreville” une fois → ensuite “Libreville”
              est proposé automatiquement.
            </li>
            <li>
              Cela améliore la cohérence des statistiques (pas de “Libre ville”
              / “Libreville ” / “LibreVille”).
            </li>
            <li>
              Utilisez l’option suggérée quand elle correspond, au lieu de
              retaper une variante.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Bon réflexe</div>
            <div className="text-muted-foreground">
              Avant de créer une nouvelle valeur, tapez quelques lettres et
              sélectionnez une suggestion si elle existe. Cela réduit fortement
              les doublons.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Renommage et impact</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Renommer un emplacement peut impacter la compréhension des
              rapports et des recherches.
            </li>
            <li>
              Si un bureau change de nom, privilégiez un nom “stable” plutôt
              qu’un nom lié à une personne.
            </li>
            <li>
              Le code est généré automatiquement par le système : évitez les
              changements fréquents pour garder une structure stable.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist rapide</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Créer un emplacement propre</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>Vérifiez si l’emplacement existe déjà (recherche).</li>
              <li>Choisissez le bon parent (bâtiment → direction → bureau).</li>
              <li>Nom court et clair (ex : “Bureau 12”).</li>
              <li>Enregistrez : le code est généré automatiquement.</li>
              <li>
                Utilisez cet emplacement lors de la création ou mise à jour des
                biens.
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4) Bonnes pratiques d’utilisation
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Gardez les emplacements “bureaux” pour la localisation exacte, pas
              pour la catégorie du bien.
            </li>
            <li>
              Si un bien est déplacé, mettez à jour son emplacement dès que
              possible.
            </li>
            <li>
              Utilisez les emplacements pour faciliter les inventaires et la
              traçabilité.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
  "users/manage-users": {
    title: "Gérer les utilisateurs",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le module Utilisateurs permet d’administrer les comptes : création,
          rôles, activation/désactivation et suivi des accès. Seuls les profils
          autorisés (Admin / Super Admin) peuvent gérer les utilisateurs.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Objectifs du module</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Créer des comptes pour les agents.</li>
            <li>Attribuer des rôles (RBAC) pour contrôler les accès.</li>
            <li>
              Désactiver un compte si nécessaire (départ, changement de poste,
              sécurité).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Créer un utilisateur</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Cliquez sur <strong>Ajouter un utilisateur</strong>.
            </li>
            <li>
              Renseignez les informations essentielles : nom, email, rôle.
            </li>
            <li>
              Vérifiez l’email : il sert à l’identification et au processus de
              sécurité (2FA).
            </li>
            <li>Enregistrez : le compte est créé et prêt à être utilisé.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Rôles & permissions</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Le rôle définit ce que l’utilisateur peut voir et faire dans
              l’application.
            </li>
            <li>
              Les rôles élevés (Admin / Super Admin) doivent être attribués
              uniquement aux personnes habilitées.
            </li>
            <li>
              Si un utilisateur ne voit pas un module, c’est généralement lié à
              son rôle.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4) Désactiver un utilisateur
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              La désactivation empêche la connexion tout en conservant
              l’historique.
            </li>
            <li>
              Recommandé en cas de départ, fin de mission ou suspicion de
              compromission.
            </li>
            <li>
              Évitez la suppression : elle fait perdre une partie de la
              traçabilité.
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Bon réflexe</div>
            <div className="text-muted-foreground">
              Si un compte n’est plus utilisé, désactivez-le plutôt que de le
              laisser actif.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist rapide</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Créer un utilisateur (checklist)
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Utilisateurs</strong>.
              </li>
              <li>
                Cliquez <strong>Ajouter</strong>.
              </li>
              <li>Renseignez nom + email + matricule + rôle.</li>
              <li>Enregistrez.</li>
              <li>
                Informez l’utilisateur : la connexion requiert la validation 2FA
                (OTP).
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Attribuez le rôle minimum nécessaire (principe de moindre
              privilège).
            </li>
            <li>Contrôlez régulièrement les comptes actifs.</li>
            <li>Gardez des emails valides (indispensable pour la sécurité).</li>
          </ul>
        </section>
      </div>
    ),
  },
  "users/2fa": {
    title: "2FA : validation & réinitialisation",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          L’authentification 2FA (OTP) est obligatoire pour tous les
          utilisateurs. Après la connexion (email/mot de passe), un code OTP
          doit être validé pour accéder à l’application.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            1) Validation 2FA (OTP) — principe
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Le 2FA est <strong>toujours actif</strong> : aucun accès sans OTP.
            </li>
            <li>
              Après saisie des identifiants, l’écran 2FA s’affiche
              automatiquement.
            </li>
            <li>Une fois le code validé, l’accès aux modules est autorisé.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            2) Mode actuel (phase actuelle)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pour le moment, le code OTP est{" "}
              <strong>affiché sur le formulaire 2FA</strong>.
            </li>
            <li>Ce mode facilite les tests et la mise en place initiale.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Évolution prévue</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              À terme, le code OTP sera{" "}
              <strong>envoyé exclusivement par email</strong>.
            </li>
            <li>L’affichage direct du code sera supprimé.</li>
            <li>
              Assurez-vous que l’email des utilisateurs est correct et
              accessible.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            4) Réinitialiser le 2FA (administration)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un administrateur peut réinitialiser le 2FA d’un utilisateur en
              cas de besoin (perte d’accès, changement de contact, incident de
              sécurité).
            </li>
            <li>
              Après réinitialisation, l’utilisateur devra{" "}
              <strong>revalider</strong> le 2FA à la prochaine connexion.
            </li>
            <li>
              Par sécurité, effectuez une vérification avant de réinitialiser
              (identité / demande validée).
            </li>
          </ul>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Bon réflexe</div>
            <div className="text-muted-foreground">
              En cas de doute sur un compte, préférez la désactivation
              temporaire + reset 2FA.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Checklist rapide</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Valider l’accès avec le 2FA</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>Connectez-vous avec matricule + mot de passe.</li>
              <li>Sur l’écran 2FA, récupérez le code OTP.</li>
              <li>Saisissez le code et validez.</li>
              <li>Accédez à l’application.</li>
            </ol>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Réinitialiser le 2FA (Admin)</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Ouvrez <strong>Utilisateurs</strong>.
              </li>
              <li>Sélectionnez l’utilisateur concerné.</li>
              <li>
                Lancez l’action <strong>Réinitialiser 2FA</strong>.
              </li>
              <li>
                Informez l’utilisateur : il devra revalider son OTP à la
                prochaine connexion.
              </li>
            </ol>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ne partagez jamais un OTP.</li>
            <li>
              Gardez des emails à jour (important pour la future version
              email-only).
            </li>
            <li>Désactivez les comptes inactifs.</li>
          </ul>
        </section>
      </div>
    ),
  },
  "faq/common": {
    title: "Problèmes fréquents",
    updatedAt: "2025-12-22",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Cette FAQ regroupe les questions et situations les plus courantes
          rencontrées par les utilisateurs, avec des solutions rapides.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Connexion & sécurité</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Je n’arrive pas à me connecter</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Vérifiez votre matricule et votre mot de passe.</li>
              <li>
                Le 2FA est obligatoire : assurez-vous de saisir le code OTP
                affiché.
              </li>
              <li>
                Si le problème persiste, contactez un administrateur pour un
                reset 2FA ou une vérification du compte.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Je n’ai pas accès à un module</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Cela dépend généralement de votre rôle.</li>
              <li>
                Contactez un administrateur pour vérifier vos permissions
                (RBAC).
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Documents véhicules</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Mon document est “Expiré” alors que j’ai renouvelé
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                Vérifiez que la <strong>nouvelle date d’expiration</strong> a
                bien été enregistrée.
              </li>
              <li>
                Si une tâche de renouvellement a été terminée, l’API met à jour
                automatiquement le document, mais une vérification visuelle est
                recommandée.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Je ne reçois pas d’alertes avant expiration
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Vérifiez que la date d’expiration est renseignée.</li>
              <li>
                Assurez-vous que des <strong>rappels</strong> sont configurés
                (ex : 30, 15, 7 jours).
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Maintenance & tâches</h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Une tâche “par km” ne se déclenche pas
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                Vérifiez que le <strong>kilométrage du véhicule</strong> est à
                jour.
              </li>
              <li>
                Assurez-vous que le modèle de tâche est bien configuré (seuil +
                préavis).
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              J’ai terminé une tâche mais rien n’a changé
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                La mise à jour est automatique (tâche / véhicule / document).
              </li>
              <li>
                Rafraîchissez la page et vérifiez :
                <ul className="list-disc pl-5">
                  <li>le kilométrage du véhicule,</li>
                  <li>la date d’expiration du document,</li>
                  <li>la génération de la prochaine tâche (si récurrente).</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Emplacements & auto-complétion
          </h2>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Je vois plusieurs variantes du même nom
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                L’application propose une <strong>auto-complétion</strong> pour
                éviter cela.
              </li>
              <li>
                Tapez quelques lettres et sélectionnez une valeur existante si
                elle apparaît.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">
              Pourquoi je dois utiliser les suggestions ?
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>
                Cela garantit l’unicité des données et des statistiques fiables.
              </li>
              <li>
                Cela évite les doublons du type “Libreville / Libre ville /
                LibreVille”.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            Besoin d’aide supplémentaire ?
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Consultez les sections détaillées du Help Center.</li>
            <li>Contactez un administrateur en cas de blocage.</li>
            <li>
              En cas d’anomalie persistante, signalez le problème avec le
              maximum de détails.
            </li>
          </ul>
        </section>
      </div>
    ),
  },
};
