import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — EventMediaKit",
  description: "Découvrez EventMediaKit, la plateforme SaaS de kits média personnalisables pour les organisateurs d'événements.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1>À propos d&apos;EventMediaKit</h1>

      <p className="lead">
        EventMediaKit est la plateforme de référence pour créer des kits média personnalisables
        destinés aux organisateurs d&apos;événements professionnels.
      </p>

      <h2>Notre mission</h2>
      <p>
        Nous simplifions la communication visuelle des événements. Les organisateurs de salons,
        conférences et festivals perdent un temps considérable à créer des visuels personnalisés
        pour chaque speaker, exposant ou partenaire. EventMediaKit automatise ce processus en
        permettant aux participants de générer eux-mêmes leurs visuels, tout en respectant la
        charte graphique de l&apos;événement.
      </p>

      <h2>Comment ça marche</h2>
      <ol>
        <li>
          <strong>L&apos;organisateur</strong> crée un événement et design des templates visuels
          avec des zones personnalisables (nom, photo, titre, entreprise...).
        </li>
        <li>
          <strong>Un lien public</strong> est généré pour chaque événement. L&apos;organisateur
          le partage avec ses participants.
        </li>
        <li>
          <strong>Les participants</strong> accèdent au lien, remplissent leurs informations et
          téléchargent instantanément leurs visuels personnalisés en haute définition.
        </li>
      </ol>

      <h2>Nos valeurs</h2>
      <ul>
        <li><strong>Simplicité</strong> — Aucune compétence technique requise. Tout se fait dans le navigateur.</li>
        <li><strong>Qualité</strong> — Des visuels HD prêts pour les réseaux sociaux et l&apos;impression.</li>
        <li><strong>Respect de la marque</strong> — La charte graphique est verrouillée, seuls les champs autorisés sont modifiables.</li>
        <li><strong>RGPD</strong> — Les données des participants sont traitées avec le plus grand soin, conformément au règlement européen.</li>
      </ul>

      <h2>L&apos;équipe</h2>
      <p>
        EventMediaKit est développé par une équipe passionnée par l&apos;événementiel et la technologie.
        Nous travaillons quotidiennement avec des organisateurs d&apos;événements pour améliorer
        notre plateforme et répondre à leurs besoins spécifiques.
      </p>

      <h2>Contact</h2>
      <p>
        Une question ? Une suggestion ? N&apos;hésitez pas à nous contacter à{" "}
        <a href="mailto:contact@eventmediakit.com">contact@eventmediakit.com</a>.
      </p>
    </article>
  );
}
