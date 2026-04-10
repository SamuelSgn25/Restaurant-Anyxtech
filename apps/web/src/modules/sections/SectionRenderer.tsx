import { PageSection } from '../../types/content';
import { ContactSection } from './components/ContactSection';
import { GallerySection } from './components/GallerySection';
import { HeroSection } from './components/HeroSection';
import { HighlightsSection } from './components/HighlightsSection';
import { MenuShowcaseSection } from './components/MenuShowcaseSection';
import { ReservationCtaSection } from './components/ReservationCtaSection';
import { StorySection } from './components/StorySection';
import { TestimonialsSection } from './components/TestimonialsSection';

export function SectionRenderer({ section }: { section: PageSection }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />;
    case 'story':
      return <StorySection section={section} />;
    case 'highlights':
      return <HighlightsSection section={section} />;
    case 'menu-showcase':
      return <MenuShowcaseSection section={section} />;
    case 'gallery':
      return <GallerySection section={section} />;
    case 'reservation-cta':
      return <ReservationCtaSection section={section} />;
    case 'testimonials':
      return <TestimonialsSection section={section} />;
    case 'contact':
      return <ContactSection section={section} />;
    default:
      return null;
  }
}
