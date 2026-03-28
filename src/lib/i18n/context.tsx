"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface I18nContext {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (section: string, key: string) => string;
}

const I18nCtx = createContext<I18nContext>({
  locale: "en",
  setLocale: () => {},
  t: () => "",
});

function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language?.toLowerCase() ?? "";
  return lang.startsWith("fr") ? "fr" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale") as Locale | null;
      if (stored) return stored;
      return detectBrowserLocale();
    }
    return "en";
  });

  // Load locale from org settings if authenticated
  useEffect(() => {
    const stored = localStorage.getItem("locale");
    if (stored) return; // User already chose manually

    fetch("/api/organization")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.organization?.locale) {
          const orgLocale = data.data.organization.locale as Locale;
          if (orgLocale === "en" || orgLocale === "fr") {
            setLocaleState(orgLocale);
          }
        }
      })
      .catch(() => {});
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", l);
    }
    // Persist to org if authenticated
    fetch("/api/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: l }),
    }).catch(() => {});
  }, []);

  const t = useCallback(
    (section: string, key: string): string => {
      const sec = (translations as Record<string, Record<string, Record<Locale, string>>>)[section];
      if (!sec) return key;
      const entry = sec[key];
      if (!entry) return key;
      return entry[locale] || entry.en || key;
    },
    [locale]
  );

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  return useContext(I18nCtx);
}

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "fr" : "en")}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-black/[0.04] ${className ?? ""}`}
      title={locale === "en" ? "Passer en français" : "Switch to English"}
    >
      <span className="text-base leading-none">{locale === "en" ? "🇫🇷" : "🇬🇧"}</span>
      <span className="text-xs font-medium text-muted-foreground">
        {locale === "en" ? "FR" : "EN"}
      </span>
    </button>
  );
}
