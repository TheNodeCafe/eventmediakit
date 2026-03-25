import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[oklch(0.2_0.04_264)] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.488_0.243_264.376)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">EventMediaKit</span>
        </div>
        <div>
          <h2 className="mb-4 text-3xl font-bold leading-tight">
            Créez des kits média
            <br />
            personnalisables pour
            <br />
            vos événements
          </h2>
          <p className="text-lg text-white/60">
            Vos participants génèrent leurs propres visuels
            <br />
            en respectant votre charte graphique.
          </p>
        </div>
        <p className="text-sm text-white/30">
          EventMediaKit — SaaS pour organisateurs d&apos;événements
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
