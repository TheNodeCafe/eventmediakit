import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — EventMediaKit",
  description: "Contactez l'équipe EventMediaKit. Support, questions commerciales ou partenariats.",
};

export default function ContactPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Une question ? Nous sommes là pour vous aider.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border p-6">
          <Mail className="mb-3 h-6 w-6 text-primary" />
          <h3 className="font-semibold">Email</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pour toute question générale
          </p>
          <a href="mailto:contact@eventmediakit.com" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            contact@eventmediakit.com
          </a>
        </div>

        <div className="rounded-xl border p-6">
          <MessageSquare className="mb-3 h-6 w-6 text-primary" />
          <h3 className="font-semibold">Support</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Assistance technique et aide
          </p>
          <a href="mailto:support@eventmediakit.com" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            support@eventmediakit.com
          </a>
        </div>

        <div className="rounded-xl border p-6">
          <Clock className="mb-3 h-6 w-6 text-primary" />
          <h3 className="font-semibold">Horaires</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Du lundi au vendredi
          </p>
          <p className="mt-3 text-sm font-medium">9h — 18h (CET)</p>
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-muted/30 p-8">
        <h2 className="text-xl font-bold">Questions fréquentes</h2>
        <div className="mt-6 space-y-4">
          {[
            {
              q: "Puis-je tester gratuitement ?",
              a: "Oui, vous pouvez créer un compte et tester la plateforme avec le plan Starter. Aucune carte bancaire n'est requise.",
            },
            {
              q: "Combien de temps pour configurer un événement ?",
              a: "Un événement peut être configuré en moins de 30 minutes : création, design des templates et partage du lien.",
            },
            {
              q: "Les visuels sont-ils en haute définition ?",
              a: "Oui, tous les exports sont en résolution HD (1080px minimum), optimisés pour les réseaux sociaux et l'impression.",
            },
            {
              q: "Comment fonctionne la facturation ?",
              a: "La facturation est mensuelle, basée sur le nombre de générations (téléchargements de visuels). Vous pouvez changer de plan à tout moment.",
            },
          ].map((faq) => (
            <details key={faq.q} className="group rounded-lg border bg-white px-5 py-4">
              <summary className="cursor-pointer text-sm font-semibold">{faq.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">Prêt à commencer ?</p>
        <Link href="/register" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:brightness-110">
          Créer un compte gratuitement
        </Link>
      </div>
    </div>
  );
}
