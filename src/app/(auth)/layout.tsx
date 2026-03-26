import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[oklch(0.2_0.04_264)] p-12 text-white lg:flex relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.488_0.243_264.376)]/10 to-transparent" />
        {/* Decorative circles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[oklch(0.488_0.243_264.376)]/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[oklch(0.488_0.243_264.376)]/6 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.488_0.243_264.376)] shadow-lg shadow-[oklch(0.488_0.243_264.376)]/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">EventMediaKit</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-[1.15] tracking-tight">
            Créez des kits média
            <br />
            <span className="text-[oklch(0.75_0.15_264)]">personnalisables</span> pour
            <br />
            vos événements
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-white/50">
            Vos participants génèrent leurs propres visuels
            en respectant votre charte graphique.
          </p>
          <div className="flex gap-8 pt-2">
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-white/40">Événements créés</p>
            </div>
            <div>
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-sm text-white/40">Visuels générés</p>
            </div>
            <div>
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm text-white/40">Satisfaction</p>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/25">
          EventMediaKit — SaaS pour organisateurs d&apos;événements
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
