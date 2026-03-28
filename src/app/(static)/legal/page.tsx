import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — EventMediaKit",
  description: "Mentions légales du site EventMediaKit.",
};

export default function LegalPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Mentions légales</h1>
      <p className="lead">Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004.</p>

      <h2>Éditeur du site</h2>
      <p>
        Le site EventMediaKit est édité par :<br />
        <strong>EventMediaKit SAS</strong><br />
        Capital social : 1 000 EUR<br />
        Siège social : Paris, France<br />
        Email : <a href="mailto:contact@eventmediakit.com">contact@eventmediakit.com</a>
      </p>

      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est le représentant légal de la société EventMediaKit SAS.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        <strong>Hetzner Online GmbH</strong><br />
        Industriestr. 25, 91710 Gunzenhausen, Allemagne<br />
        via la plateforme Coolify.
      </p>
      <p>
        Les données sont stockées par :<br />
        <strong>Supabase Inc.</strong><br />
        970 Toa Payoh North #07-04, Singapore 318992
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site EventMediaKit (textes, images, logos, logiciels)
        est protégé par le droit d&apos;auteur et le droit de la propriété intellectuelle.
        Toute reproduction, même partielle, est interdite sans autorisation préalable.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Les informations collectées sur ce site font l&apos;objet d&apos;un traitement informatique
        destiné à fournir nos services. Conformément au RGPD, vous disposez d&apos;un droit
        d&apos;accès, de rectification et de suppression de vos données.
        Consultez notre <a href="/privacy">politique de confidentialité</a> pour en savoir plus.
      </p>

      <h2>Cookies</h2>
      <p>
        Le site utilise des cookies techniques nécessaires à son fonctionnement (authentification,
        préférences). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
      </p>
    </article>
  );
}
