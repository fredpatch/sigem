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
    updatedAt: "2026-04-09",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le nouveau parcours est centré sur un principe simple : on enregistre
          d&apos;abord le véhicule dans le formulaire principal, puis on gère les
          opérations du quotidien depuis le menu déroulant de la ligne du
          véhicule.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Créer un véhicule</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Cliquez sur <strong>Ajouter un véhicule</strong> pour ouvrir le
              formulaire central de création.
            </li>
            <li>
              Ce formulaire regroupe l&apos;identité du véhicule, ses
              caractéristiques, son affectation et les informations utiles au
              suivi.
            </li>
            <li>
              Lors de la création, vous pouvez aussi poser les premières bases
              du suivi documentaire afin de démarrer avec un dossier propre.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Gérer le quotidien</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Une fois le véhicule créé, la gestion courante se fait surtout
              depuis le <strong>menu déroulant de la ligne</strong>.
            </li>
            <li>
              Ce menu permet d&apos;accéder rapidement aux actions ciblées : mise à
              jour des informations, kilométrage, vidange ou documents.
            </li>
            <li>
              Les écrans dédiés Documents véhicules et Maintenance servent
              ensuite au suivi global, aux échéances et aux opérations de
              contrôle.
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
    updatedAt: "2026-04-09",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les actions rapides du module véhicules sont maintenant regroupées
          dans le <strong>menu déroulant</strong> de chaque ligne. Ce menu est le
          point d&apos;entrée recommandé pour les mises à jour ciblées après la
          création initiale.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Règle principale</h2>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">Important</div>
            <div className="text-muted-foreground">
              Ouvrez le menu déroulant sur la bonne ligne et vérifiez toujours
              l&apos;immatriculation avant de confirmer une action.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Actions disponibles</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Modifier les informations principales du véhicule.</li>
            <li>Mettre à jour le kilométrage courant.</li>
            <li>Valider une vidange ou une opération d&apos;entretien rapide.</li>
            <li>
              Mettre à jour un document ciblé comme l&apos;assurance, la visite
              technique, le parking ou l&apos;extincteur.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Bon réflexe</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Utilisez le formulaire principal pour l&apos;enregistrement initial ou
              les corrections de fond.
            </li>
            <li>
              Utilisez le menu déroulant pour les opérations rapides et
              récurrentes.
            </li>
            <li>
              Utilisez les pages Documents véhicules et Maintenance pour une
              vision d&apos;ensemble du suivi.
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
    updatedAt: "2026-04-09",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Dans le nouveau parcours, l&apos;utilisateur saisit surtout les bonnes
          dates du document. Le système applique ensuite le schéma de rappels
          standard prévu pour le suivi des échéances.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Ce qui déclenche les rappels</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>La date d&apos;expiration du document reste l&apos;élément principal.</li>
            <li>
              Le système applique automatiquement les rappels standards pour
              aider à anticiper les renouvellements.
            </li>
            <li>
              Chaque mise à jour du document permet de relancer un suivi propre
              sur la nouvelle période de validité.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Ce que l&apos;utilisateur doit faire</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Renseignez la date de début si elle est utile, la date
              d&apos;expiration et la référence du document.
            </li>
            <li>
              Utilisez l&apos;action dédiée du menu déroulant pour renouveler un
              document depuis le véhicule concerné.
            </li>
            <li>
              Vérifiez ensuite les colonnes de validité et les alertes dans les
              listes de suivi du parc.
            </li>
          </ul>
        </section>
      </div>
    ),
  },

  "documents/from-doc-to-task": {
    title: "Passer d&apos;un document à son suivi",
    updatedAt: "2026-04-09",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Le nouveau flux part d&apos;abord du véhicule. On met à jour le document
          depuis la bonne ligne, puis on poursuit le suivi dans les écrans
          dédiés si une intervention ou un contrôle devient nécessaire.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Nouveau point d&apos;entrée</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Repérez le véhicule concerné dans la liste du parc.</li>
            <li>Ouvrez le menu déroulant sur la ligne correspondante.</li>
            <li>
              Lancez l&apos;action adaptée pour mettre à jour le document visé.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Suite du suivi</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Le document mis à jour alimente ensuite le suivi de validité et
              les alertes du parc.
            </li>
            <li>
              Si une action opérationnelle doit être réalisée, poursuivez dans
              le programme de maintenance pour planifier ou clôturer la tâche.
            </li>
          </ul>
        </section>
      </div>
    ),
  },

  "maintenance/models": {
    title: "Modèles de tâche",
    updatedAt: "2026-04-09",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Les modèles de tâche servent à automatiser le suivi récurrent sans
          alourdir la gestion quotidienne des véhicules. Ils définissent la base
          du suivi qui sera ensuite appliqué aux opérations de maintenance.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Où créer un modèle</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ouvrez le programme de suivi de maintenance.</li>
            <li>
              Cliquez sur <strong>Ajouter un modèle de suivi</strong> depuis
              l&apos;action disponible en haut de la page.
            </li>
            <li>
              Configurez ensuite le déclencheur, la fréquence et la période de
              préavis souhaitée.
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
    updatedAt: "2026-04-09",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Terminer une tâche met à jour le suivi du véhicule et prépare la suite
          du cycle de maintenance. Selon le type d&apos;intervention, cela peut aussi
          mettre à jour un document lié ou recalculer la prochaine échéance.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Où terminer une tâche</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Depuis la page de maintenance, utilisez l&apos;action disponible sur
              la ligne de la tâche concernée.
            </li>
            <li>
              Pour certains cas ciblés comme la vidange, une action rapide peut
              aussi être proposée directement depuis le véhicule.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Bonnes pratiques</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Saisissez le kilométrage et la date de réalisation lorsqu&apos;ils sont
              demandés.
            </li>
            <li>
              Vérifiez le statut final ainsi que les mises à jour liées au
              véhicule ou au document concerné.
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
