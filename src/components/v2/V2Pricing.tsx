"use client";

import pricingData from "@/data/plans.json";
import Link from "next/link";
import { useLocale } from "next-intl";

type PlanJsonItem = { es: string };
type PlanJson = {
  title: { es: string };
  price: { es: string };
  items: PlanJsonItem[];
};

type V2Plan = {
  id: number;
  name: string;
  price: string;
  highlighted: boolean;
  features: string[];
  cta: string;
  ctaClass: string;
};

const plans: V2Plan[] = (pricingData as PlanJson[]).map((plan, index) => ({
  id: index,
  name: plan.title.es,
  price: plan.price.es,
  highlighted: index === 1,
  features: plan.items.map((item) => item.es),
  cta: "Quiero empezar",
  ctaClass:
    index === 1
      ? "w-full py-5 bg-brand-accent text-brand-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-lg block text-center"
      : "w-full py-5 border border-white/10 font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-brand-black transition-all block text-center",
}));

export default function V2Pricing() {
  const locale = useLocale();
  return (
    <section className="py-32 bg-brand-black scroll-mt-32" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-heading font-black uppercase mb-6 tracking-tight">
            Nuestros <span className="text-brand-accent">Planes</span>
          </h2>
          <p className="text-brand-text/40 max-w-xl mx-auto text-lg font-light italic">
            Inversión estratégica en tu activo más valioso: tú mismo.
          </p>
        </div>

        <div
          className={`grid gap-10 ${
            plans.length === 2
              ? "grid-cols-1 md:grid-cols-2 justify-items-center items-stretch"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.highlighted
                  ? "bg-brand-gray p-12 border-t-4 border-brand-accent relative flex flex-col justify-between z-10 shadow-[0_40px_80px_-15px_rgba(255,209,30,0.1)] h-full w-full max-w-[520px]"
                  : "bg-brand-dark p-12 border border-white/5 relative flex flex-col justify-between hover:border-brand-accent/30 transition-all duration-500 group h-full w-full max-w-[520px]"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-accent text-brand-black text-[10px] font-black uppercase px-6 py-2 tracking-widest">
                  Más Popular
                </div>
              )}
              <div className="flex-1">
                <h3
                  className={`text-xl font-heading font-bold uppercase mb-4 tracking-widest ${
                    plan.highlighted ? "text-brand-accent" : ""
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="text-5xl font-heading font-black mb-10">
                  {plan.price}
                  <span className="text-sm font-light text-white/30 italic ml-2">
                    /mes
                  </span>
                </div>
                <ul
                  className={`space-y-6 mb-12 text-sm ${
                    plan.highlighted ? "text-brand-text/80" : "text-brand-text/50"
                  }`}
                >
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center">
                      <span className="text-brand-accent mr-4 text-lg">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={`/${locale}/checkout?plan=monthly`} className={plan.ctaClass}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
