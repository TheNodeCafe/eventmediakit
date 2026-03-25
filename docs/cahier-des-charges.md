# Cahier des charges — Media Kit SaaS pour organisateurs d'événements

## 1. Vision produit
Une plateforme SaaS B2B permettant aux organisateurs d'événements (salons, conférences, festivals) de créer des **kits média personnalisables** à destination de leurs participants (exposants, speakers, visiteurs). Chaque participant reçoit un accès par lien magique pour personnaliser ses visuels sans toucher à la charte graphique définie par l'organisateur.

---

## 2. Acteurs du système

**L'organisateur** — client payant du SaaS. Il crée son événement, design ses templates, invite ses participants et consulte les stats.

**Le participant** (exposant / speaker / visiteur) — utilisateur final gratuit. Il reçoit un lien magique par email, remplit ses données, prévisualise et télécharge ses visuels.

**Super Admin** — back-office interne pour gérer les comptes organisateurs, les plans d'abonnement et le système.

---

## 3. Fonctionnalités par module

### Back-office organisateur

#### Gestion d'événements
- Création de plusieurs événements simultanés
- Paramétrage de chaque événement : nom, dates, branding, langue(s)
- Catégories de participants configurables (Exposant, Speaker, Visiteur, etc.)

#### Éditeur de templates intégré
- Création de templates sur canvas (type Canva / Fabric.js) directement dans le navigateur
- Formats disponibles : carré (1:1), story (9:16), horizontal (16:9), bannière LinkedIn, etc.
- Éléments fixes : fonds, logos, formes, textes statiques — non modifiables par le participant
- Zones variables : jusqu'à 10 champs définis par l'organisateur (Nom, Prénom, Entreprise, Logo entreprise, Titre/Rôle, Numéro de stand, Photo de profil, Réseaux sociaux, etc.)
- Association d'un template à une ou plusieurs catégories de participants
- Aperçu du template avec données fictives

#### Gestion des participants
- Import CSV ou invitation manuelle par email
- Attribution automatique de la catégorie et génération du lien magique
- Tableau de suivi : invité / lien ouvert / visuels téléchargés

#### Statistiques
- Nombre de liens envoyés / ouverts
- Nombre de générations par template
- Téléchargements par catégorie de participant
- Export CSV des données

#### White label
- Nom de domaine personnalisé (ex : `mediakit.monsalon.com`)
- Logo et couleurs de l'organisateur sur toutes les pages participant
- Suppression de la mention de la plateforme

---

### Interface participant (accès par lien magique)
- Page d'accueil avec le branding de l'événement
- Affichage de tous les templates disponibles pour sa catégorie
- Formulaire de saisie des champs variables définis par l'organisateur
- Prévisualisation en temps réel sur chaque template simultanément
- Téléchargement en PNG / JPEG haute résolution
- Support multilingue (FR, EN, + autres selon configuration de l'organisateur)
- Pas de création de compte requise — accès direct par lien magique

---

## 4. Modèle d'abonnement

Facturation mensuelle par paliers de **générations** (= un téléchargement de visuel = 1 génération).

| Plan       | Générations/mois | Événements | White label | Prix indicatif  |
|------------|-------------------|------------|-------------|-----------------|
| Starter    | 500               | 1          | Non         | ~49 EUR/mois    |
| Growth     | 2 000             | 5          | Oui         | ~149 EUR/mois   |
| Pro        | 10 000            | Illimité   | Oui         | ~349 EUR/mois   |
| Enterprise | Sur mesure        | Illimité   | Oui         | Sur devis       |

> Les générations non utilisées ne sont pas reportées au mois suivant. Des packs de générations supplémentaires peuvent être achetés à la volée.

---

## 5. Stack technique recommandée

| Couche            | Technologie recommandée                         |
|-------------------|--------------------------------------------------|
| Frontend          | Next.js (React)                                  |
| Éditeur canvas    | Fabric.js ou Konva.js                            |
| Backend           | Node.js (API REST) ou Laravel                    |
| Rendu visuels     | Puppeteer ou Sharp (serveur)                     |
| Auth / Magic link | Resend ou Postmark                               |
| Base de données   | PostgreSQL                                       |
| Storage assets    | AWS S3 ou Cloudflare R2                          |
| Paiement          | Stripe (abonnements + packs)                     |
| Queue de rendu    | BullMQ                                           |
| Infrastructure    | Vercel (frontend) + Railway ou Render (backend)  |

---

## 6. Architecture des données (aperçu)

```
Organisation
  └── Événements
        ├── Catégories (Exposant, Speaker, Visiteur...)
        ├── Templates
        │     ├── Format (1:1, 9:16, 16:9...)
        │     ├── Éléments fixes (JSON layout)
        │     ├── Champs variables (jusqu'à 10)
        │     └── Catégories associées
        └── Participants
              ├── Email
              ├── Catégorie
              ├── Lien magique (token unique)
              └── Générations (téléchargements effectués)
```

---

## 7. Points de vigilance

### Éditeur de templates
C'est le module le plus complexe techniquement. Il faudra définir précisément comment les zones variables sont positionnées sur le canvas et comment elles sont stockées (JSON de layout) pour être réutilisées lors de la génération côté serveur.

### Qualité de rendu
La génération serveur (Puppeteer / Sharp) est fortement recommandée pour éviter les variations de rendu entre navigateurs et garantir une qualité constante en haute résolution.

### Scalabilité des générations
Si un événement génère 5 000 téléchargements le même jour, la queue de rendu doit être prévue dès l'architecture (BullMQ ou similaire) pour éviter les goulots d'étranglement.

### RGPD
Les données des participants (nom, photo, email) doivent être traitées avec soin :
- Durée de conservation à définir contractuellement
- Suppression des données sur demande
- Consentement explicite au moment de l'accès par lien magique

---

## 8. Prochaines étapes suggérées

1. Valider la stack technique avec l'équipe de développement
2. Rédiger les user stories détaillées par module
3. Concevoir la structure de base de données complète
4. Réaliser des wireframes de l'éditeur de templates et de l'interface participant
5. Définir les prix définitifs des plans avec une étude de marché
6. Développer un MVP (éditeur + interface participant + 1 plan d'abonnement)
