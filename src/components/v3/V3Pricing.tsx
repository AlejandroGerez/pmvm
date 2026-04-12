"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import plans from "@/data/plans.json";
import Link from "next/link";

type Locale = "es" | "en" | "pt";

export default function V3Pricing() {
  const t = useTranslations("v3.pricing");
  const locale = useLocale() as Locale;

  const checkoutLink = `/${locale}/checkout?plan=monthly`;

  return (
    <section id="v3-pricing" className="py-24 md:py-32 px-6 bg-brand-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="inline-flex items-center gap-3 text-brand-accent text-[11px] font-bold tracking-[0.2em] uppercase mb-3">
            <span className="w-5 h-px bg-brand-accent inline-block" />
            {t("label")}
            <span className="w-5 h-px bg-brand-accent inline-block" />
          </p>
          <h2
            className="v3-heading leading-none"
            style={{ fontSize: "clamp(48px, 5.5vw, 72px)" }}
          >
            {t("title")}{" "}
            <span className="text-brand-accent">{t("highlight")}</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-px bg-white/6 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const isPremium = i === 1;
            // Items exclusive to premium (not in basic)
            const basicCount = plans[0].items.length;
            const premiumExtra = isPremium ? plan.items.slice(basicCount) : [];

            return (
              <motion.div
                key={plan.title[locale]}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`relative flex flex-col p-10 xl:p-12 ${
                  isPremium ? "bg-[#141414]" : "bg-[#111]"
                }`}
              >
                {/* Popular badge */}
                {isPremium && (
                  <div className="absolute top-0 right-8 -translate-y-1/2">
                    <span className="bg-brand-accent text-brand-black text-[10px] font-black tracking-[0.15em] uppercase px-4 py-1.5">
                      {t("popular")}
                    </span>
                  </div>
                )}

                {/* Top border accent on premium */}
                {isPremium && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-accent" />
                )}

                {/* Plan name */}
                <div className="mb-2">
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/40">
                    Plan
                  </span>
                  <h3 className="v3-heading text-3xl md:text-4xl mt-1 leading-none">
                    {plan.title[locale]}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mb-6 mt-4">
                  <span
                    className="v3-heading text-brand-accent leading-none"
                    style={{ fontSize: "clamp(40px, 4vw, 56px)" }}
                  >
                    {plan.price[locale].split(" / ")[0].split("/")[0].trim()}
                  </span>
                  <span className="text-white/35 text-sm font-light mb-1.5">
                    {t("per_month")}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm font-light text-white/55 leading-relaxed mb-8 pb-8 border-b border-white/8">
                  {plan.description[locale]}
                </p>

                {/* Items */}
                <div className="flex flex-col gap-3 flex-1 mb-10">
                  {isPremium ? (
                    <>
                      {/* Show "all from basic" label */}
                      <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/35 mb-1">
                        {t("all_from_basic")}
                      </p>
                      {premiumExtra.map((item) => (
                        <div key={item[locale]} className="flex items-start gap-3">
                          <Check
                            size={14}
                            className="text-brand-accent mt-0.5 flex-shrink-0"
                          />
                          <span className="text-sm font-light text-white/70">
                            {item[locale]}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    plan.items.map((item) => (
                      <div key={item[locale]} className="flex items-start gap-3">
                        <Check
                          size={14}
                          className="text-brand-accent mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm font-light text-white/70">
                          {item[locale]}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={checkoutLink}
                  className={`block text-center py-4 text-[13px] font-bold tracking-[0.1em] uppercase transition-all duration-200 ${
                    isPremium
                      ? "bg-brand-accent text-brand-black hover:bg-white hover:-translate-y-px"
                      : "border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-black hover:-translate-y-px"
                  }`}
                >
                  {t("cta")}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
