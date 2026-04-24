import { ChefHat, Flower2, Martini, Sparkles } from 'lucide-react';

export const siteContent = {
  restaurant: {
    name: 'Le Cactus',
    tagline: 'Cuisine franco-beninoise dans une adresse elegante de Cotonou.',
    logo: '/logo.png',
    footerNote: 'Un site vitrine clair, relie a un back office restaurant moderne et evolutif.'
  },
  pages: [
    {
      slug: '/',
      label: 'Accueil',
      title: 'Bienvenue au Cactus',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Restaurant signature',
          title: 'Une table raffinee pour les dejeuners, les diners et les moments a celebrer.',
          description:
            'Le Cactus propose une cuisine soignee, un service attentif et une ambiance premium pensee pour les clients de l hotel comme pour les visiteurs de passage.',
          primaryCta: { label: 'Reserver une table', href: '/reservation' },
          secondaryCta: { label: 'Decouvrir la carte', href: '/menu' },
          stats: [
            { label: 'Cuisine', value: 'Signature' },
            { label: 'Cadre', value: 'Elegant' },
            { label: 'Service', value: 'Fluide' }
          ],
          image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1920&q=80'
        },
        {
          type: 'story',
          eyebrow: 'Notre promesse',
          title: 'Une experience pensee pour bien manger, bien recevoir et revenir.',
          paragraphs: [
            'La carte valorise les produits locaux, les cuissons justes et une presentation contemporaine.',
            'Le lieu accompagne aussi bien un repas d affaires, un diner en couple, un brunch de weekend ou une reservation de groupe.'
          ],
          image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'features',
          eyebrow: 'Les essentiels',
          title: 'Ce qui fait la signature du Cactus',
          items: [
            {
              title: 'Cuisine d auteur',
              description: 'Des assiettes lisibles, gourmandes et regulierement renouvelees.',
              icon: ChefHat
            },
            {
              title: 'Produits du terroir',
              description: 'Une place forte accordee aux saveurs du Benin et aux arrivages de saison.',
              icon: Flower2
            },
            {
              title: 'Bar et accords',
              description: 'Cocktails, vins et boissons maison pour accompagner chaque service.',
              icon: Martini
            },
            {
              title: 'Accueil sur mesure',
              description: 'Reservations, groupes, anniversaires et besoins particuliers traites avec soin.',
              icon: Sparkles
            }
          ]
        },
        {
          type: 'testimonials',
          eyebrow: 'Avis clients',
          title: 'Une adresse qui marque les esprits',
          items: [
            {
              quote: 'Le cadre est magnifique et le service est au niveau du lieu.',
              author: 'Felicite K.',
              role: 'Cliente'
            },
            {
              quote: 'Une carte courte mais tres bien executee, avec une vraie identite.',
              author: 'Marc S.',
              role: 'Voyageur'
            }
          ]
        },
        {
          type: 'reservation-cta',
          eyebrow: 'Evenements',
          title: 'Privatisations, diners d affaires et grandes tables',
          description:
            'Notre equipe peut organiser vos receptions privees, repas de groupe ou rendez-vous professionnels avec une formule adaptee.',
          bullets: [
            'Salons VIP',
            'Terrasse amenagee',
            'Menus personnalises'
          ]
        },
        {
          type: 'contact',
          eyebrow: 'Infos pratiques',
          title: 'Nous rendre visite',
          address: 'Hotel Cactus, Cotonou, Benin',
          phone: '+229 01 95 95 95 95',
          email: 'reservation@lecactushotel.bj',
          schedule: [
            'Lundi - Samedi : 12h00 - 15h00 / 19h00 - 23h00',
            'Dimanche : brunch de 11h30 a 16h00',
            'Reservations groupe sur demande'
          ]
        }
      ]
    },
    {
      slug: '/menu',
      label: 'Carte',
      title: 'Notre carte',
      sections: [
        {
          type: 'hero',
          eyebrow: 'La carte',
          title: 'Des plats signatures, des boissons choisies et une presentation soignee.',
          description:
            'La carte s adapte au rythme du restaurant et du chef. Vous y retrouvez des entrees, plats, desserts et boissons presentes de facon claire et appetissante.',
          primaryCta: { label: 'Reserver maintenant', href: '/reservation' },
          secondaryCta: { label: 'Vivre l experience', href: '/experience' },
          stats: [
            { label: 'Format', value: 'Court' },
            { label: 'Cuisine', value: 'Mixte' },
            { label: 'Boissons', value: 'Selection' }
          ],
          image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'menu-showcase',
          eyebrow: 'Selection',
          title: 'Une carte vivante, alimentee par la cuisine',
          categories: [
            {
              title: 'Entrees',
              description: 'Pour ouvrir le repas.',
              items: [
                { name: 'Tartare de daurade', description: 'Agrumes, herbes et huile pimentee douce.', price: '9 500 FCFA' },
                { name: 'Accras de crevettes', description: 'Sauce verte et basilic africain.', price: '7 500 FCFA' }
              ]
            },
            {
              title: 'Plats',
              description: 'Les incontournables de la maison.',
              items: [
                { name: 'Poulet bicyclette facon yassa', description: 'Riz coco, oignons confits et citron vert.', price: '11 000 FCFA' },
                { name: 'Filet de boeuf au poivre de Penja', description: 'Puree lisse et legumes rotis.', price: '15 000 FCFA' }
              ]
            }
          ]
        }
      ]
    },
    {
      slug: '/experience',
      label: 'Experience',
      title: 'Experience',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Moments a vivre',
          title: 'Brunch, diner, cocktails et rendez-vous memorables.',
          description:
            'Le Cactus ne se limite pas a un repas. C est aussi une ambiance, une qualite de service et une facon de recevoir qui valorise chaque occasion.',
          primaryCta: { label: 'Reserver une table', href: '/reservation' },
          secondaryCta: { label: 'Voir la carte', href: '/menu' },
          stats: [
            { label: 'Brunch', value: 'Week-end' },
            { label: 'Afterwork', value: 'Possible' },
            { label: 'VIP', value: 'Sur demande' }
          ],
          image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'features',
          eyebrow: 'Formats',
          title: 'Des usages utiles et bien identifies',
          items: [
            {
              title: 'Dejeuner d affaires',
              description: 'Un service rapide, un cadre calme et une carte lisible.',
              icon: Sparkles
            },
            {
              title: 'Diner signature',
              description: 'Pour les clients en quete de saveur, de cadre et de detail.',
              icon: ChefHat
            },
            {
              title: 'Cocktails et terrasse',
              description: 'Une respiration elegante pour l afterwork ou la soiree.',
              icon: Martini
            }
          ]
        },
        {
          type: 'gallery',
          eyebrow: 'Ambiance',
          title: 'Quelques scenes du lieu',
          images: [
            { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80', alt: 'Service en salle' },
            { src: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80', alt: 'Dressage de plat' },
            { src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80', alt: 'Soiree au restaurant' }
          ]
        }
      ]
    },
    {
      slug: '/reservation',
      label: 'Reservation',
      title: 'Reservation',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Reservation',
          title: 'Reservez votre table en quelques instants.',
          description:
            'Indiquez simplement vos coordonnees, le nombre de couverts, la date et la zone souhaitee. Notre equipe confirme ensuite votre demande dans les meilleurs delais.',
          primaryCta: { label: 'Appeler directement', href: 'tel:+2290195959595' },
          secondaryCta: { label: 'Nous ecrire', href: 'mailto:reservation@lecactushotel.bj' },
          stats: [
            { label: 'Zones', value: 'Salle / Terrasse / VIP' },
            { label: 'Groupes', value: 'Possible' },
            { label: 'Reponse', value: 'Rapide' }
          ],
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80'
        }
      ]
    }
  ]
} as const;
