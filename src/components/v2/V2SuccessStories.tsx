"use client";

import Image from "next/image";
import transformations from "@/data/transformations.json";
import { useLocale } from "next-intl";
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

function StoryCard({
  story,
}: {
  story: {
    name: string;
    result?: string;
    quote: string;
    beforeImg: string;
    afterImg: string;
  };
}) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-6 group overflow-hidden">
        <div className="relative overflow-hidden aspect-[4/5] bg-brand-gray">
          <Image
            alt="Antes"
            className="object-cover grayscale opacity-70 group-hover:opacity-100 transition-all duration-700"
            src={story.beforeImg}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute bottom-3 left-3 bg-brand-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/10">
            Antes
          </div>
        </div>
        <div className="relative overflow-hidden aspect-[4/5] bg-brand-gray">
          <Image
            alt="Después"
            className="object-cover group-hover:scale-105 transition-all duration-700"
            src={story.afterImg}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute bottom-3 right-3 bg-brand-accent px-3 py-1 text-brand-black text-[10px] font-bold uppercase tracking-widest">
            Después
          </div>
        </div>
      </div>
      <div className="border-l-2 border-brand-accent pl-6 py-2">
        <div className="flex justify-between items-baseline mb-2">
          <h4 className="text-2xl font-heading font-bold uppercase tracking-tight text-white">
            {story.name}
          </h4>
          {story.result ? (
            <p className="text-brand-accent font-heading font-black text-3xl">
              {story.result}
            </p>
          ) : null}
        </div>
        <blockquote className="text-brand-text/60 font-light italic text-base leading-relaxed">
          {story.quote}
        </blockquote>
      </div>
    </div>
  );
}

function extractKg(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d{1,3})\s*kg/i);
  if (!match) return undefined;
  return `${match[1]}kg`;
}

type LocaleKey = "es" | "en" | "pt";
function toLocaleKey(locale: string): LocaleKey {
  if (locale === "es" || locale === "en" || locale === "pt") return locale;
  return "es";
}

export default function V2SuccessStories() {
  const locale = toLocaleKey(useLocale());
  const localizedStories = transformations.map((item) => ({
    name: item.clientName,
    result: extractKg(item.clientTestimonial?.[locale]),
    quote: item.clientDetail?.[locale] ?? "",
    beforeImg: item.beforeImage,
    afterImg: item.afterImage,
  }));

  return (
    <section className="py-20 bg-brand-black scroll-mt-32" id="success-stories">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h3 className="text-brand-accent font-heading font-bold tracking-[0.4em] uppercase text-xs mb-4">
              Transformaciones Reales
            </h3>
            <h2 className="text-4xl md:text-6xl font-heading font-black uppercase leading-none">
              TESTIMONIOS <span className="text-stroke">PMVM</span>
            </h2>
          </div>
          <p className="text-brand-text/40 font-light text-right max-w-xs italic text-sm leading-relaxed">
            Evidencia tangible de un sistema diseñado para la excelencia física
            y mental.
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="flex gap-6">
            {localizedStories.map((story) => (
              <CarouselItem
                key={story.name}
                className="basis-full md:basis-1/2 lg:basis-1/3 flex-shrink-0"
              >
                <StoryCard story={story} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-between items-center mt-6">
            <CarouselPrevious className="static translate-x-0 translate-y-0" />
            <CarouselNext className="static translate-x-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
