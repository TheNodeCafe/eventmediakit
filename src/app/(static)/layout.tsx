import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">EventMediaKit</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            Commencer
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} EventMediaKit</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-foreground">À propos</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/legal" className="hover:text-foreground">Mentions légales</Link>
            <Link href="/terms" className="hover:text-foreground">CGU</Link>
            <Link href="/privacy" className="hover:text-foreground">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
