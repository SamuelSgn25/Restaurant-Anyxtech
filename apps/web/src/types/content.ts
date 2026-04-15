import { LucideIcon } from 'lucide-react';

export type SectionType =
  | 'hero'
  | 'story'
  | 'highlights'
  | 'menu-showcase'
  | 'gallery'
  | 'reservation-cta'
  | 'testimonials'
  | 'contact';

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroSection {
  type: 'hero';
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  stats: readonly { label: string; value: string }[];
  image: string;
}

export interface StorySection {
  type: 'story';
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  image: string;
}

export interface HighlightItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface HighlightsSection {
  type: 'highlights';
  eyebrow: string;
  title: string;
  items: readonly HighlightItem[];
}

export interface MenuCategory {
  title: string;
  description: string;
  items: readonly { name: string; description: string; price: string }[];
}

export interface MenuShowcaseSection {
  type: 'menu-showcase';
  eyebrow: string;
  title: string;
  categories: readonly MenuCategory[];
}

export interface GallerySection {
  type: 'gallery';
  eyebrow: string;
  title: string;
  images: readonly { src: string; alt: string }[];
}

export interface ReservationCtaSection {
  type: 'reservation-cta';
  eyebrow: string;
  title: string;
  description: string;
  bullets: readonly string[];
}

export interface TestimonialsSection {
  type: 'testimonials';
  eyebrow: string;
  title: string;
  items: readonly { quote: string; author: string; role: string }[];
}

export interface ContactSection {
  type: 'contact';
  eyebrow: string;
  title: string;
  address: string;
  phone: string;
  email: string;
  schedule: readonly string[];
}

export type PageSection =
  | HeroSection
  | StorySection
  | HighlightsSection
  | MenuShowcaseSection
  | GallerySection
  | ReservationCtaSection
  | TestimonialsSection
  | ContactSection;

export interface SitePage {
  slug: string;
  label: string;
  title: string;
  sections: readonly PageSection[];
}

export interface SiteContent {
  restaurant: {
    name: string;
    tagline: string;
    logo: string;
    footerNote: string;
  };
  pages: readonly SitePage[];
}
