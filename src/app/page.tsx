"use client";

import Link from "next/link";
import { useI18n, LanguageToggle } from "@/lib/i18n/context";
import {
  Sparkles,
  Palette,
  Globe,
  Eye,
  Download,
  ArrowRight,
  Check,
  Zap,
  Shield,
} from "lucide-react";

export default function Home() {
  const { t, locale } = useI18n();

  const PLANS = [
    {
      name: "Starter",
      price: "49",
      description: t("pricing", "starterDesc"),
      features:
        locale === "en"
          ? [
              "1 active event",
              "3 templates",
              "500 generations / month",
              "HD Export (PNG)",
              "Email support",
            ]
          : [
              "1 événement actif",
              "3 templates",
              "500 générations / mois",
              "Export HD (PNG)",
              "Support email",
            ],
      cta: t("pricing", "start"),
      highlighted: false,
    },
    {
      name: "Growth",
      price: "149",
      description: t("pricing", "growthDesc"),
      features:
        locale === "en"
          ? [
              "5 active events",
              "15 templates",
              "5,000 generations / month",
              "HD Export (PNG + PDF)",
              "Custom public page",
              "Priority support",
            ]
          : [
              "5 événements actifs",
              "15 templates",
              "5 000 générations / mois",
              "Export HD (PNG + PDF)",
              "Page publique personnalisée",
              "Support prioritaire",
            ],
      cta: t("pricing", "chooseGrowth"),
      highlighted: true,
    },
    {
      name: "Pro",
      price: "349",
      description: t("pricing", "proDesc"),
      features:
        locale === "en"
          ? [
              "Unlimited events",
              "Unlimited templates",
              "25,000 generations / month",
              "All export formats",
              "Full white label",
              "API & webhooks",
              "Dedicated account manager",
            ]
          : [
              "Événements illimités",
              "Templates illimités",
              "25 000 générations / mois",
              "Export tous formats",
              "White label complet",
              "API & webhooks",
              "Account manager dédié",
            ],
      cta: t("pricing", "choosePro"),
      highlighted: false,
    },
  ];

  const FEATURES = [
    {
      icon: Palette,
      title: t("features", "editor"),
      description: t("features", "editorDesc"),
    },
    {
      icon: Globe,
      title: t("features", "publicPage"),
      description: t("features", "publicPageDesc"),
    },
    {
      icon: Eye,
      title: t("features", "preview"),
      description: t("features", "previewDesc"),
    },
    {
      icon: Download,
      title: t("features", "download"),
      description: t("features", "downloadDesc"),
    },
  ];

  const STEPS = [
    {
      number: "01",
      title: t("howItWorks", "step1Title"),
      description: t("howItWorks", "step1Desc"),
    },
    {
      number: "02",
      title: t("howItWorks", "step2Title"),
      description: t("howItWorks", "step2Desc"),
    },
    {
      number: "03",
      title: t("howItWorks", "step3Title"),
      description: t("howItWorks", "step3Desc"),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EventMediaKit",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Plateforme SaaS de kits média personnalisables pour les organisateurs d'événements.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "49",
      highPrice: "349",
      priceCurrency: "EUR",
      offerCount: "3",
    },
  };

  return (
    <div className="min-h-screen bg-white text-[oklch(0.17_0.02_260)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[oklch(0.91_0.01_264)] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.488_0.243_264.376)] text-white shadow-lg shadow-[oklch(0.488_0.243_264.376)]/25">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              EventMediaKit
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-[oklch(0.5_0.02_264)] transition-colors hover:text-[oklch(0.17_0.02_260)]"
            >
              {t("nav", "features")}
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-[oklch(0.5_0.02_264)] transition-colors hover:text-[oklch(0.17_0.02_260)]"
            >
              {t("nav", "howItWorks")}
            </a>
            <a
              href="#pricing"
              className="text-sm text-[oklch(0.5_0.02_264)] transition-colors hover:text-[oklch(0.17_0.02_260)]"
            >
              {t("nav", "pricing")}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[oklch(0.5_0.02_264)] transition-colors hover:text-[oklch(0.17_0.02_260)] sm:block"
            >
              {t("nav", "login")}
            </Link>
            <LanguageToggle />
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[oklch(0.488_0.243_264.376)] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[oklch(0.488_0.243_264.376)]/25 transition-all hover:shadow-lg hover:brightness-110"
            >
              <span className="hidden sm:inline">{t("nav", "ctaDesktop")}</span>
              <span className="sm:hidden">{t("nav", "ctaMobile")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full bg-[oklch(0.488_0.243_264.376)]/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[oklch(0.75_0.15_290)]/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pb-32 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.488_0.243_264.376)]/20 bg-[oklch(0.488_0.243_264.376)]/5 px-4 py-1.5 text-sm font-medium text-[oklch(0.488_0.243_264.376)]">
              <Zap className="h-3.5 w-3.5" />
              {t("hero", "badge")}
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero", "title1")}{" "}
              <span className="bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] to-[oklch(0.6_0.2_290)] bg-clip-text text-transparent">
                {t("hero", "titleHighlight")}
              </span>{" "}
              {t("hero", "title2")}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[oklch(0.5_0.02_264)] sm:text-xl">
              {t("hero", "subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.488_0.243_264.376)] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[oklch(0.488_0.243_264.376)]/30 transition-all hover:shadow-xl hover:brightness-110"
              >
                {t("hero", "cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-[oklch(0.91_0.01_264)] px-7 py-3.5 text-base font-semibold text-[oklch(0.3_0.06_264)] transition-all hover:border-[oklch(0.488_0.243_264.376)]/30 hover:bg-[oklch(0.488_0.243_264.376)]/5"
              >
                {t("hero", "ctaSecondary")}
              </a>
            </div>
          </div>

          {/* Hero mockup placeholder */}
          <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
            <div className="overflow-hidden rounded-2xl border border-[oklch(0.91_0.01_264)] bg-gradient-to-b from-[oklch(0.96_0.008_264)] to-white shadow-2xl shadow-[oklch(0.488_0.243_264.376)]/10">
              <div className="flex items-center gap-2 border-b border-[oklch(0.91_0.01_264)] bg-white px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.91_0.01_264)]" />
                <div className="h-3 w-3 rounded-full bg-[oklch(0.91_0.01_264)]" />
                <div className="h-3 w-3 rounded-full bg-[oklch(0.91_0.01_264)]" />
                <div className="ml-4 flex-1 rounded-md bg-[oklch(0.96_0.008_264)] px-3 py-1.5 text-xs text-[oklch(0.5_0.02_264)]">
                  app.eventmediakit.com/editor
                </div>
              </div>
              <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[oklch(0.96_0.008_264)] to-[oklch(0.93_0.03_264)]">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[oklch(0.488_0.243_264.376)]/10">
                    <Palette className="h-8 w-8 text-[oklch(0.488_0.243_264.376)]" />
                  </div>
                  <p className="text-sm font-medium text-[oklch(0.5_0.02_264)]">
                    {t("hero", "mockupLabel")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-[oklch(0.91_0.01_264)] bg-[oklch(0.985_0.002_260)]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-[oklch(0.5_0.02_264)]">
            {t("social", "usedBy")}
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: t("social", "events") },
              { value: "50K+", label: t("social", "visuals") },
              { value: "98%", label: t("social", "satisfaction") },
              { value: "< 30s", label: t("social", "genTime") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-[oklch(0.488_0.243_264.376)] lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[oklch(0.5_0.02_264)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition — Visibility & Engagement */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.488_0.243_264.376)]/10 px-4 py-1.5 text-sm font-medium text-[oklch(0.488_0.243_264.376)]">
            <Zap className="h-3.5 w-3.5" />
            {t("value", "badge")}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("value", "title1")}
            <span className="bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] to-[oklch(0.6_0.2_290)] bg-clip-text text-transparent">
              {t("value", "titleHighlight")}
            </span>{" "}
            {t("value", "title2")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[oklch(0.5_0.02_264)]">
            {t("value", "subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-[oklch(0.91_0.01_264)] bg-white p-8 transition-all hover:border-[oklch(0.488_0.243_264.376)]/30 hover:shadow-lg hover:shadow-[oklch(0.488_0.243_264.376)]/5">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.488_0.243_264.376)]/15 to-[oklch(0.6_0.2_290)]/10">
              <Globe className="h-6 w-6 text-[oklch(0.488_0.243_264.376)]" />
            </div>
            <div className="mb-2 text-3xl font-bold text-[oklch(0.488_0.243_264.376)]">x10</div>
            <h3 className="text-lg font-bold">{t("value", "reach")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[oklch(0.5_0.02_264)]">
              {t("value", "reachDesc")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-[oklch(0.91_0.01_264)] bg-white p-8 transition-all hover:border-[oklch(0.488_0.243_264.376)]/30 hover:shadow-lg hover:shadow-[oklch(0.488_0.243_264.376)]/5">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.488_0.243_264.376)]/15 to-[oklch(0.6_0.2_290)]/10">
              <Shield className="h-6 w-6 text-[oklch(0.488_0.243_264.376)]" />
            </div>
            <div className="mb-2 text-3xl font-bold text-[oklch(0.488_0.243_264.376)]">100%</div>
            <h3 className="text-lg font-bold">{t("value", "brand")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[oklch(0.5_0.02_264)]">
              {t("value", "brandDesc")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-[oklch(0.91_0.01_264)] bg-white p-8 transition-all hover:border-[oklch(0.488_0.243_264.376)]/30 hover:shadow-lg hover:shadow-[oklch(0.488_0.243_264.376)]/5">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.488_0.243_264.376)]/15 to-[oklch(0.6_0.2_290)]/10">
              <Zap className="h-6 w-6 text-[oklch(0.488_0.243_264.376)]" />
            </div>
            <div className="mb-2 text-3xl font-bold text-[oklch(0.488_0.243_264.376)]">0</div>
            <h3 className="text-lg font-bold">{t("value", "effort")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[oklch(0.5_0.02_264)]">
              {t("value", "effortDesc")}
            </p>
          </div>
        </div>

        {/* Impact quote */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] to-[oklch(0.55_0.22_280)] p-8 text-center text-white lg:p-12">
          <p className="text-xl font-bold leading-relaxed lg:text-2xl">
            {t("value", "quote")}
          </p>
          <p className="mt-4 text-sm text-white/60">
            {t("value", "quoteNote")}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="border-y border-[oklch(0.91_0.01_264)] bg-[oklch(0.985_0.002_260)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("features", "title1")}
              <span className="text-[oklch(0.488_0.243_264.376)]">
                {t("features", "titleHighlight")}
              </span>
              {t("features", "title2")}
            </h2>
            <p className="mt-4 text-lg text-[oklch(0.5_0.02_264)]">
              {t("features", "subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[oklch(0.91_0.01_264)] bg-white p-6 transition-all hover:border-[oklch(0.488_0.243_264.376)]/30 hover:shadow-lg hover:shadow-[oklch(0.488_0.243_264.376)]/5"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.488_0.243_264.376)]/10 text-[oklch(0.488_0.243_264.376)] transition-colors group-hover:bg-[oklch(0.488_0.243_264.376)] group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[oklch(0.5_0.02_264)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("howItWorks", "title")}
          </h2>
          <p className="mt-4 text-lg text-[oklch(0.5_0.02_264)]">
            {t("howItWorks", "subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative">
              {index < STEPS.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-[oklch(0.488_0.243_264.376)]/30 to-transparent lg:block" />
              )}
              <div className="relative rounded-2xl border border-[oklch(0.91_0.01_264)] bg-white p-8">
                <span className="text-4xl font-bold text-[oklch(0.488_0.243_264.376)]/15">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[oklch(0.5_0.02_264)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-y border-[oklch(0.91_0.01_264)] bg-[oklch(0.985_0.002_260)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("pricing", "title1")}
              <span className="text-[oklch(0.488_0.243_264.376)]">
                {t("pricing", "titleHighlight")}
              </span>
              {t("pricing", "title2")}
            </h2>
            <p className="mt-4 text-lg text-[oklch(0.5_0.02_264)]">
              {t("pricing", "subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.highlighted
                    ? "border-[oklch(0.488_0.243_264.376)] bg-white shadow-xl shadow-[oklch(0.488_0.243_264.376)]/10 ring-1 ring-[oklch(0.488_0.243_264.376)]"
                    : "border-[oklch(0.91_0.01_264)] bg-white hover:border-[oklch(0.488_0.243_264.376)]/30 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[oklch(0.488_0.243_264.376)] px-4 py-1 text-xs font-semibold text-white">
                    {t("pricing", "popular")}
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-[oklch(0.5_0.02_264)]">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}&#8364;</span>
                  <span className="text-sm text-[oklch(0.5_0.02_264)]">
                    {" "}
                    {t("pricing", "perMonth")}
                  </span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-[oklch(0.488_0.243_264.376)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-[oklch(0.488_0.243_264.376)] text-white shadow-md shadow-[oklch(0.488_0.243_264.376)]/25 hover:brightness-110"
                      : "border border-[oklch(0.91_0.01_264)] text-[oklch(0.3_0.06_264)] hover:border-[oklch(0.488_0.243_264.376)]/30 hover:bg-[oklch(0.488_0.243_264.376)]/5"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[oklch(0.488_0.243_264.376)]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("cta", "title")}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[oklch(0.5_0.02_264)]">
            {t("cta", "subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.488_0.243_264.376)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[oklch(0.488_0.243_264.376)]/30 transition-all hover:shadow-xl hover:brightness-110"
            >
              {t("cta", "button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-[oklch(0.5_0.02_264)]">
            {t("cta", "note")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[oklch(0.91_0.01_264)] bg-[oklch(0.2_0.04_264)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.488_0.243_264.376)] shadow-lg shadow-[oklch(0.488_0.243_264.376)]/25">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  EventMediaKit
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                {t("footer", "tagline")}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {t("footer", "product")}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: t("nav", "features"), href: "#features" },
                  { label: t("nav", "pricing"), href: "#pricing" },
                  { label: t("nav", "howItWorks"), href: "#how-it-works" },
                ].map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-white/50 transition-colors hover:text-white">{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {t("footer", "company")}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: t("footer", "about"), href: "/about" },
                  { label: t("footer", "contact"), href: "/contact" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/50 transition-colors hover:text-white">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {t("footer", "legal")}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: t("footer", "legalNotice"), href: "/legal" },
                  { label: t("footer", "terms"), href: "/terms" },
                  { label: t("footer", "privacy"), href: "/privacy" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/50 transition-colors hover:text-white">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/30">
              &copy; {new Date().getFullYear()} EventMediaKit. {t("footer", "rights")}
            </p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-white/30" />
              <span className="text-sm text-white/30">
                {t("footer", "rgpd")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
