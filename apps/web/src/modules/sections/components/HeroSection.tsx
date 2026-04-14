import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroSection as HeroSectionType } from '../../../types/content';

export function HeroSection({ section }: { section: HeroSectionType }) {
  return (
    <section className="section-shell grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">{section.eyebrow}</p>
          <h1 className="section-title max-w-3xl">{section.title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-ink/85">{section.description}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to={section.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink"
          >
            {section.primaryCta.label}
            <ArrowRight size={16} />
          </Link>
          <Link
            to={section.secondaryCta.href}
            className="inline-flex items-center rounded-full border border-forest/20 bg-white/70 px-6 py-3 text-sm font-semibold text-forest transition hover:border-forest/50"
          >
            {section.secondaryCta.label}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {section.stats.map((stat) => (
            <div key={stat.label} className="surface-card p-5">
              <p className="text-2xl font-semibold text-forest">{stat.value}</p>
              <p className="mt-1 text-sm text-ink/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 rounded-[2.5rem] bg-clay/10 blur-2xl" />
        <img
          src={section.image}
          alt={section.title}
          className="relative h-[420px] w-full rounded-[2.5rem] object-cover shadow-card sm:h-[520px]"
        />
      </div>
    </section>
  );
}
