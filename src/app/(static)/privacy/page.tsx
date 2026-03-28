import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — EventMediaKit",
  description: "Comment EventMediaKit collecte, utilise et protège vos données personnelles. Conforme au RGPD.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Politique de Confidentialité</h1>
      <p className="lead">Dernière mise à jour : mars 2026</p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est EventMediaKit SAS, dont le siège
        social est situé à Paris, France. Contact :{" "}
        <a href="mailto:privacy@eventmediakit.com">privacy@eventmediakit.com</a>.
      </p>

      <h2>2. Données collectées</h2>

      <h3>Organisateurs (utilisateurs inscrits)</h3>
      <ul>
        <li><strong>Données de compte</strong> : email, mot de passe (hashé), nom de l&apos;organisation.</li>
        <li><strong>Données d&apos;utilisation</strong> : événements créés, templates, statistiques de génération.</li>
        <li><strong>Données de facturation</strong> : gérées par Stripe, nous ne stockons pas les informations de carte bancaire.</li>
      </ul>

      <h3>Visiteurs (utilisateurs des pages publiques)</h3>
      <ul>
        <li><strong>Données saisies</strong> : nom, prénom, entreprise, titre, photo — selon les champs configurés par l&apos;Organisateur.</li>
        <li><strong>Données techniques</strong> : aucun cookie de tracking, pas de collecte d&apos;adresse IP.</li>
      </ul>
      <p>
        <strong>Important</strong> : les visuels sont générés côté navigateur (client-side).
        Les données saisies par les Visiteurs ne sont pas transmises à nos serveurs, sauf
        pour le comptage anonyme des générations.
      </p>

      <h2>3. Finalités du traitement</h2>
      <ul>
        <li>Fournir et maintenir le service EventMediaKit.</li>
        <li>Gérer les comptes utilisateurs et l&apos;authentification.</li>
        <li>Traiter les paiements et la facturation.</li>
        <li>Envoyer des communications relatives au service (notifications, mises à jour).</li>
        <li>Améliorer notre service via des statistiques d&apos;usage anonymisées.</li>
      </ul>

      <h2>4. Base légale</h2>
      <ul>
        <li><strong>Exécution du contrat</strong> : pour fournir le service aux Organisateurs.</li>
        <li><strong>Intérêt légitime</strong> : pour améliorer notre service et assurer sa sécurité.</li>
        <li><strong>Consentement</strong> : pour les communications marketing (opt-in).</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li><strong>Données de compte</strong> : conservées pendant la durée de l&apos;abonnement + 30 jours après suppression du compte.</li>
        <li><strong>Données de facturation</strong> : conservées 10 ans conformément aux obligations comptables.</li>
        <li><strong>Données des Visiteurs</strong> : non stockées sur nos serveurs (traitement côté client).</li>
      </ul>

      <h2>6. Sous-traitants</h2>
      <table>
        <thead>
          <tr>
            <th>Sous-traitant</th>
            <th>Finalité</th>
            <th>Localisation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Base de données, authentification</td>
            <td>UE / US</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Paiements</td>
            <td>US (Privacy Shield)</td>
          </tr>
          <tr>
            <td>Hetzner</td>
            <td>Hébergement</td>
            <td>Allemagne</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Vos droits (RGPD)</h2>
      <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données personnelles.</li>
        <li><strong>Droit de rectification</strong> : corriger vos données inexactes.</li>
        <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données.</li>
        <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
        <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données.</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à{" "}
        <a href="mailto:privacy@eventmediakit.com">privacy@eventmediakit.com</a>.
        Nous répondons dans un délai de 30 jours.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Nous mettons en place des mesures techniques et organisationnelles pour protéger vos
        données : chiffrement en transit (TLS), mots de passe hashés, accès restreint aux
        données de production, sauvegardes automatiques.
      </p>

      <h2>9. Cookies</h2>
      <p>
        EventMediaKit utilise uniquement des cookies techniques essentiels au fonctionnement
        du service (session d&apos;authentification). Aucun cookie publicitaire ou de tracking
        tiers n&apos;est utilisé.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative à cette politique :{" "}
        <a href="mailto:privacy@eventmediakit.com">privacy@eventmediakit.com</a>
      </p>
    </article>
  );
}
