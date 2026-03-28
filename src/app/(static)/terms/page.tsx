import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — EventMediaKit",
  description: "CGU du service EventMediaKit. Conditions d'accès et d'utilisation de la plateforme.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Conditions Générales d&apos;Utilisation</h1>
      <p className="lead">Dernière mise à jour : mars 2026</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
        l&apos;utilisation de la plateforme EventMediaKit, accessible à l&apos;adresse
        media-kit.pulse-n-flow.com et ses sous-domaines.
      </p>

      <h2>2. Définitions</h2>
      <ul>
        <li><strong>Plateforme</strong> : le service SaaS EventMediaKit.</li>
        <li><strong>Organisateur</strong> : toute personne physique ou morale utilisant la Plateforme pour créer des kits média.</li>
        <li><strong>Visiteur</strong> : toute personne accédant à une page publique d&apos;événement pour générer des visuels.</li>
        <li><strong>Génération</strong> : le téléchargement d&apos;un visuel personnalisé.</li>
      </ul>

      <h2>3. Inscription et compte</h2>
      <p>
        L&apos;inscription est gratuite. L&apos;Organisateur s&apos;engage à fournir des informations
        exactes et à maintenir la confidentialité de ses identifiants de connexion. Toute activité
        réalisée depuis son compte est sous sa responsabilité.
      </p>

      <h2>4. Services proposés</h2>
      <p>
        EventMediaKit permet aux Organisateurs de :
      </p>
      <ul>
        <li>Créer des événements et configurer leur branding.</li>
        <li>Designer des templates visuels avec des zones personnalisables.</li>
        <li>Partager un lien public permettant aux Visiteurs de générer des visuels.</li>
        <li>Suivre les statistiques de génération.</li>
      </ul>

      <h2>5. Tarification</h2>
      <p>
        Les plans et tarifs sont indiqués sur la page Tarifs. La facturation est mensuelle.
        Les générations non utilisées dans le mois ne sont pas reportées. L&apos;Organisateur
        peut changer de plan à tout moment.
      </p>

      <h2>6. Propriété intellectuelle</h2>
      <p>
        Les templates créés par l&apos;Organisateur lui appartiennent. EventMediaKit conserve
        la propriété intellectuelle de sa plateforme, son code, son interface et ses algorithmes.
        Les visuels générés par les Visiteurs sont la propriété de l&apos;Organisateur de l&apos;événement.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <a href="/privacy">Politique de Confidentialité</a>. L&apos;Organisateur est responsable
        du traitement des données de ses Visiteurs et s&apos;engage à respecter le RGPD.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        EventMediaKit s&apos;engage à fournir un service disponible et fonctionnel. Toutefois,
        nous ne garantissons pas une disponibilité ininterrompue. Notre responsabilité est
        limitée au montant des sommes versées par l&apos;Organisateur au cours des 12 derniers mois.
      </p>

      <h2>9. Résiliation</h2>
      <p>
        L&apos;Organisateur peut résilier son compte à tout moment depuis les Paramètres.
        En cas de violation des CGU, EventMediaKit se réserve le droit de suspendre ou
        supprimer un compte sans préavis.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux
        de Paris seront seuls compétents.
      </p>
    </article>
  );
}
