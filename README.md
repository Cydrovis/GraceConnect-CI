# GraceConnect (Édition 2025)

## Description

GraceConnect est une application web de gestion d'église complète et moderne, conçue pour simplifier l'administration d'une communauté religieuse. Elle offre une interface intuitive inspirée des tableaux de bord administratifs pour gérer les membres, les finances, les événements, la communication interne et bien plus encore.

L'application inclut également un tableau de bord pour un "Super Administrateur", permettant de gérer plusieurs instances d'églises, de valider les inscriptions et de superviser la plateforme.

## Fonctionnalités Principales

- **Tableau de Bord (Panneau d'accueil)** : Vue d'ensemble des statistiques clés, notifications importantes, calendrier des événements et journal d'activité.
- **Gestion du Personnel** : Gestion des utilisateurs de l'application (pasteurs, secrétaires, etc.), de leurs rôles et de leurs permissions.
- **Gestion des Membres** : Fiches détaillées des membres, suivi des enfants, gestion des statuts (actif, nouveau, à suivre), et historique des interactions.
- **Organisation** :
    - **Départements/Ministères** : Création de groupes, gestion des membres et des bureaux.
    - **Cultes et Événements** : Planification d'événements récurrents ou uniques avec un calendrier interactif.
- **Gestion Financière Complète** :
    - **Transactions** : Suivi des revenus (dîmes, offrandes) et des dépenses.
    - **Cotisations** : Création et suivi de campagnes de cotisation (régulières, projets, cas de décès).
    - **Projets** : Gestion de projets de l'église avec suivi de budget et de dépenses.
    - **Cas de Décès** : Gestion des dossiers et lancement de campagnes de soutien.
- **Affectations et Responsabilités** : Suivi des rôles et des responsabilités des membres au sein de l'église.
- **Formations et Enseignements** : Création de parcours de formation, gestion des cours, des sessions et suivi de la présence.
- **Communications Internes** :
    - **Messagerie Interne** : Système de messagerie sécurisé entre les membres du personnel.
    - **Annonces** : Publication d'annonces pour l'ensemble du personnel.
- **Gestion Documentaire** : Archivage et gestion des documents importants (certificats, procès-verbaux, etc.).
- **Rapports et Statistiques** : Génération de rapports détaillés sur les finances, les membres, la croissance et les événements.
- **Paramétrages** : Personnalisation complète de l'application (logo, nom de l'église, modèles de documents, etc.).

## Stack Technique

- **Frontend** : React.js, TypeScript
- **Styling** : Tailwind CSS
- **Graphiques** : Recharts
- **Export PDF** : jsPDF, jspdf-autotable
- **Export Image** : html2canvas

L'application est conçue comme un prototype client-seul, sans backend. Toutes les données sont simulées et gérées en mémoire (`dummyData.ts`) via les contextes React.

## Structure du Projet

```
/
├── components/         # Tous les composants React réutilisables
├── index.html          # Point d'entrée HTML de l'application
├── index.tsx           # Point de montage de l'application React
├── App.tsx             # Composant racine, gère la navigation basée sur l'état
├── contexts.tsx        # Logique de gestion d'état (Data, Auth, UI, Church)
├── constants.tsx       # Constantes (éléments de la sidebar, permissions)
├── types.ts            # Définitions TypeScript
├── dummyData.ts        # Données initiales pour la simulation
└── README.md           # Ce fichier
```

## Lancement de l'Application

Ce projet est un prototype autonome. Aucun processus de build n'est nécessaire.

1.  Assurez-vous d'avoir un serveur web local pour servir les fichiers statiques. Une extension comme "Live Server" pour VS Code est parfaite pour cela.
2.  Servez le répertoire racine du projet.
3.  Ouvrez `index.html` dans votre navigateur via le serveur local.

Toutes les dépendances sont chargées via un `importmap` dans `index.html` depuis un CDN (esm.sh).

## Architecture de Gestion d'État

L'application utilise l'API Context de React pour une gestion d'état centralisée et modulaire.

- **`DataContext`** : Gère les données globales de la plateforme, comme la liste de toutes les églises et les paramètres généraux. Il est le plus haut niveau de l'état.
- **`AuthContext`** : Gère l'authentification, la session de l'utilisateur (connecté, déconnecté, etc.) et stocke les informations de l'utilisateur courant.
- **`ChurchContext`** : Une fois un utilisateur d'église connecté, ce contexte s'isole et ne gère que les données et les actions de l'église active. C'est ici que les modifications de données (ajout d'un membre, enregistrement d'une transaction) sont effectuées.
- **`UIContext`** : Gère les états purement liés à l'interface, comme l'ouverture des modales, la page active dans le layout principal, etc.

Cette architecture permet une séparation claire des responsabilités et facilite la maintenance et l'évolution de l'application.

## Authentification et Rôles

- **Authentification** : Le système simule une connexion pour un "Super Administrateur" et pour les utilisateurs d'une église. Les identifiants sont définis dans `dummyData.ts`.
- **Autorisation** : Un système de permissions basé sur les rôles est implémenté. Les permissions pour chaque rôle sont définies dans `constants.tsx` et la logique de vérification est gérée par la fonction `hasPermission`.
