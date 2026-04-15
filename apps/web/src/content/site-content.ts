import { Martini, Utensils, Flower2, Sparkles, ChefHat, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const siteContent = {
  restaurant: {
    name: 'Le Cactus',
    tagline: 'L’élégance culinaire au cœur de Cotonou',
    logo: '/logo.png'
  },
  pages: [
    {
      slug: '/',
      label: 'Accueil',
      title: 'Bienvenue au Cactus',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Gastronomie & Raffinement',
          title: 'Une Odyssée culinaire entre Terre et Mer.',
          description:
            'Le restaurant Le Cactus vous invite à découvrir une cuisine d’auteur, où les produits locaux du Bénin rencontrent les techniques de la haute gastronomie internationale. Un cadre d’exception pour vos moments les plus précieux.',
          primaryCta: { label: 'Réserver une table', href: '/reservation' },
          secondaryCta: { label: 'Découvrir la carte', href: '/menu' },
          stats: [
            { label: 'Cuisine', value: 'Signature' },
            { label: 'Cadre', value: 'Prestige' },
            { label: 'Service', value: 'Dédié' }
          ],
          image:
            'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1920&q=80'
        },
        {
          type: 'features',
          eyebrow: 'Nos Engagements',
          title: 'L’Excellence dans chaque détail',
          items: [
            {
              title: 'Produits Locaux',
              description: 'Nous collaborons avec les meilleurs producteurs du Bénin pour garantir une fraîcheur absolue.',
              icon: Flower2
            },
            {
              title: 'Art Culinaire',
              description: 'Chaque plat est une œuvre pensée par notre Chef pour surprendre vos sens.',
              icon: ChefHat
            },
            {
              title: 'Service Sur-Mesure',
              description: 'Une équipe attentive et discrète pour faire de votre repas un souvenir inoubliable.',
              icon: Sparkles
            }
          ]
        },
        {
          type: 'testimonials',
          eyebrow: 'Avis de nos hôtes',
          title: 'Ce que disent nos clients',
          items: [
            {
              quote: 'Une expérience transcendante. Le mélange des saveurs locales et du raffinement moderne est tout simplement magistral.',
              author: 'Marc-Antoine S.',
              role: 'Critique Gastronomique'
            },
            {
              quote: 'Le meilleur spot de Cotonou pour un dîner d’affaires. Calme, élégant et une carte des vins impressionnante.',
              author: 'Félicité K.',
              role: 'Entrepreneure'
            }
          ]
        },
        {
          type: 'reservation-cta',
          eyebrow: 'Privatisation',
          title: 'Célébrez vos événements dans un cadre prestigieux',
          description:
            "Que ce soit pour un mariage, un séminaire ou un dîner privé, Le Cactus met à votre disposition ses salons et sa terrasse pour des moments d’exception.",
          bullets: [
            'Salons VIP climatisés',
            'Terrasse avec vue jardin',
            'Menus personnalisés sur demande'
          ]
        },
        {
          type: 'contact',
          eyebrow: 'Infos pratiques',
          title: 'Nous rendre visite',
          address: "Hôtel Cactus, Zone Résidentielle, Cotonou, Bénin",
          phone: '+229 01 95 95 95 95',
          email: 'reservation@lecactushotel.bj',
          schedule: [
            'Lundi - Samedi : 12h00 - 15h00 / 19h00 - 23h00',
            'Dimanche : Brunch de 11h30 à 16h00',
            'Fermé le Dimanche soir'
          ]
        }
      ]
    },
    {
      slug: '/menu',
      label: 'La Carte',
      title: 'Notre Carte Gastronomique',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Saveurs Authentiques',
          title: 'La rencontre des saisons et de la passion.',
          description:
            'Notre carte évolue au fil des arrivages et de l’inspiration de notre Chef. Découvrez une sélection de plats raffinés célébrant le terroir béninois.',
          primaryCta: { label: 'Réserver maintenant', href: '/reservation' },
          secondaryCta: { label: 'Voir les boissons', href: '#' },
          stats: [
            { label: 'Menu', value: 'Saisonnier' },
            { label: 'Vins', value: 'Grands Crus' },
            { label: 'Chef', value: 'Exécutif' }
          ],
          image:
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'menu-showcase',
          eyebrow: 'La Sélection',
          title: 'Signature du Chef',
          categories: [
            {
              title: 'Entrées Subtiles',
              description: 'Pour éveiller votre curiosité.',
              items: [
                {
                  name: 'Tartare de Daurade au Gingembre',
                  description: 'Zestes de combava, huile de coco vierge et jeunes pousses.',
                  price: '9 500 FCFA'
                },
                {
                  name: 'Accras de Crevettes du Golfe',
                  description: 'Sauce verte au basilic africain et piment doux.',
                  price: '7 500 FCFA'
                }
              ]
            },
            {
              title: 'Plats d’Exception',
              description: 'Le cœur de notre savoir-faire.',
              items: [
                {
                  name: 'Poulet Bicyclette en deux cuissons',
                  description: 'Fumé puis braisé, écrasé de manioc au beurre de baratte.',
                  price: '14 000 FCFA'
                },
                {
                  name: 'Filet de Bœuf au Poivre de Penja',
                  description: 'Jus corsé, mille-feuille de patate douce et légumes rôtis.',
                  price: '18 000 FCFA'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      slug: '/reservation',
      label: 'Réservation',
      title: 'Réserver une table au Cactus',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Un Moment Privilégié',
          title: 'L’assurance d’une table à la hauteur de vos attentes.',
          description:
            'Réservez votre table en quelques clics et laissez-nous préparer votre accueil. Notre équipe se tient prête à rendre votre venue exceptionnelle.',
          primaryCta: { label: 'Appeler Directement', href: 'tel:+2290195959595' },
          secondaryCta: { label: 'Nous Écrire', href: 'mailto:reservation@lecactushotel.bj' },
          stats: [
            { label: 'Capacité', value: 'Jusqu’à 80 pers.' },
            { label: 'VIP', value: 'Sur Réservation' },
            { label: 'Réponse', value: '< 30 min' }
          ],
          image:
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80'
        }
      ]
    }
  ]
};
