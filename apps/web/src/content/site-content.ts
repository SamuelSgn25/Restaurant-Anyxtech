import {
  CalendarRange,
  ChefHat,
  Flower2,
  Martini,
  Music4,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { SiteContent } from '../types/content';

export const siteContent: SiteContent = {
  brand: {
    name: 'Restaurant Hotel Cactus',
    tagline: 'Cuisine beninoise et francaise dans un decor vegetal et solaire.',
    footerNote:
      "Une base modulaire pour faire evoluer le restaurant, les offres, les equipes et l'exploitation sans rework global."
  },
  navigation: [
    { label: 'Accueil', href: '/' },
    { label: 'Carte', href: '/menu' },
    { label: 'Experience', href: '/experience' },
    { label: 'Reservation', href: '/reservation' }
  ],
  pages: [
    {
      slug: '/',
      label: 'Accueil',
      title: 'Un restaurant de destination a Cotonou',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Hotel Cactus',
          title: 'Une table qui marie finesse francaise et chaleur beninoise.',
          description:
            "Pense comme une adresse signature de l'hotel, le restaurant accueille les voyageurs, les dejeuners d'affaires et les diners d'exception dans une ambiance elegante et depaysante.",
          primaryCta: { label: 'Reserver une table', href: '/reservation' },
          secondaryCta: { label: 'Voir la carte', href: '/menu' },
          stats: [
            { label: 'Signature', value: 'Cuisine mixte' },
            { label: 'Service', value: 'Midi et soir' },
            { label: 'Ambiance', value: 'Jardin lounge' }
          ],
          image:
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'story',
          eyebrow: 'Inspiration',
          title: 'Un lieu pense pour les sejours, les rendez-vous et les grandes tablees.',
          paragraphs: [
            "Le site s'inspire de l'univers de l'Hotel Cactus: vegetal, lumineux, accueillant et premium sans rigidite.",
            "Le coeur digital prepare aussi l'exploitation quotidienne: connexions par roles, reservations, commandes, cuisine et caisse."
          ],
          image:
            'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'highlights',
          eyebrow: 'Atouts',
          title: 'Un restaurant premium, et une exploitation fluide en coulisses',
          items: [
            {
              title: 'Cuisine signature',
              description: 'Recettes de saison, dressage soigne et produits locaux valorises.',
              icon: ChefHat
            },
            {
              title: 'Gestion multi-roles',
              description: 'Super admin, gerants, serveurs et chef disposent chacun de leur acces.',
              icon: ShieldCheck
            },
            {
              title: 'Bar botanique',
              description: 'Cocktails maison, infusions fraiches et accords mets-boissons.',
              icon: Martini
            },
            {
              title: 'Privatisation',
              description: 'Formats corporate, anniversaires et cocktails modulables.',
              icon: CalendarRange
            }
          ]
        },
        {
          type: 'menu-showcase',
          eyebrow: 'Selection',
          title: 'Quelques signatures de la maison',
          categories: [
            {
              title: 'Entrees',
              description: 'Ouverture tout en fraicheur.',
              items: [
                {
                  name: 'Tartare de daurade au gingembre',
                  description: 'Agrumes, herbes fraiches et huile pimentee douce.',
                  price: '9 500 FCFA'
                },
                {
                  name: 'Accras de crevettes du golfe',
                  description: 'Sauce verte au basilic africain.',
                  price: '7 500 FCFA'
                }
              ]
            },
            {
              title: 'Plats',
              description: 'Entre tradition et table contemporaine.',
              items: [
                {
                  name: 'Filet de boeuf, jus au poivre de Penja',
                  description: 'Puree lisse et legumes rotis.',
                  price: '15 000 FCFA'
                },
                {
                  name: 'Poulet bicyclette facon yassa',
                  description: 'Riz coco, oignons confits et citron vert.',
                  price: '11 000 FCFA'
                }
              ]
            },
            {
              title: 'Desserts',
              description: 'Final delicat et solaire.',
              items: [
                {
                  name: 'Ananas roti, creme legere vanille',
                  description: 'Tuile croustillante et caramel epice.',
                  price: '5 500 FCFA'
                },
                {
                  name: 'Mousse chocolat grand cru',
                  description: 'Fleur de sel et eclats de kankankan.',
                  price: '6 000 FCFA'
                }
              ]
            }
          ]
        },
        {
          type: 'gallery',
          eyebrow: 'Atmosphere',
          title: 'Une identite visuelle chaude, gourmande et respirante',
          images: [
            {
              src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
              alt: 'Salle de restaurant chic'
            },
            {
              src: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80',
              alt: 'Table gastronomique'
            },
            {
              src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
              alt: 'Service de cocktails'
            }
          ]
        },
        {
          type: 'testimonials',
          eyebrow: 'Avis',
          title: 'Ce que les clients viennent chercher',
          items: [
            {
              quote: 'Un cadre tres apaisant, ideal pour un diner professionnel qui veut aussi marquer les esprits.',
              author: 'A. Mensah',
              role: 'Client corporate'
            },
            {
              quote: 'On sent le souci du detail dans le service comme dans la carte.',
              author: 'S. Moreau',
              role: 'Voyageuse'
            }
          ]
        },
        {
          type: 'reservation-cta',
          eyebrow: 'Operations',
          title: 'Une vitrine premium, deja reliee a un vrai back office restaurant',
          description:
            "Le site public peut maintenant cohabiter avec un espace de gestion: reservations, commandes, production cuisine, caisse et future integration POS type Hamster.",
          bullets: [
            'Acces securises par role',
            'Flux salle-cuisine-caisse',
            'Architecture extensible'
          ]
        },
        {
          type: 'contact',
          eyebrow: 'Infos pratiques',
          title: 'Nous trouver',
          address: "Hotel Cactus, Cotonou, Benin",
          phone: '+229 01 00 00 00 00',
          email: 'restaurant@lecactushotel.bj',
          schedule: [
            'Lundi - Jeudi : 12h00 - 22h30',
            'Vendredi - Samedi : 12h00 - 23h30',
            'Dimanche : brunch et diner'
          ]
        }
      ]
    },
    {
      slug: '/menu',
      label: 'Carte',
      title: 'Carte et boissons',
      sections: [
        {
          type: 'hero',
          eyebrow: 'La carte',
          title: 'Une proposition courte, lisible et adaptable.',
          description:
            'Cette page peut etre enrichie avec plus de categories, des menus du jour, une cave ou des tags allergenes sans toucher aux autres pages.',
          primaryCta: { label: 'Reserver', href: '/reservation' },
          secondaryCta: { label: 'Acceder a la gestion', href: '/login' },
          stats: [
            { label: 'Format', value: 'Modulaire' },
            { label: 'Cuisine', value: 'Franco-beninoise' },
            { label: 'Evolution', value: 'Par modules' }
          ],
          image:
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'menu-showcase',
          eyebrow: 'Cuisine',
          title: 'Des familles de plats simples a administrer',
          categories: [
            {
              title: 'Terre & mer',
              description: 'Les incontournables de la maison.',
              items: [
                {
                  name: 'Lotte snackee, creme de patate douce',
                  description: 'Sauce combava et jeunes pousses.',
                  price: '14 500 FCFA'
                },
                {
                  name: 'Magret laque au miel local',
                  description: 'Legumes glaces et reduction acidulee.',
                  price: '16 000 FCFA'
                }
              ]
            },
            {
              title: 'Vegetal',
              description: 'Des assiettes lumineuses et genereuses.',
              items: [
                {
                  name: 'Riz parfume aux legumes braises',
                  description: 'Noix de cajou et herbes fraiches.',
                  price: '8 000 FCFA'
                },
                {
                  name: 'Gnocchis au pesto de moringa',
                  description: 'Parmesan et tomates confites.',
                  price: '9 500 FCFA'
                }
              ]
            }
          ]
        },
        {
          type: 'reservation-cta',
          eyebrow: 'Service',
          title: 'Menus groupes, afterwork et cartes saisonnieres',
          description:
            'Le meme moteur de sections peut aussi servir pour des cartes evenementielles, sans dupliquer les composants.',
          bullets: [
            'Carte midi',
            'Carte diner',
            'Menu degustation'
          ]
        }
      ]
    },
    {
      slug: '/experience',
      label: 'Experience',
      title: 'Experience client',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Experience',
          title: 'Plus qu un repas, un vrai parcours de marque.',
          description:
            'La page experience raconte les usages: brunch, soirees live, afterwork, celebration et privatisation.',
          primaryCta: { label: 'Voir reservation', href: '/reservation' },
          secondaryCta: { label: 'Revenir a l accueil', href: '/' },
          stats: [
            { label: 'Brunch', value: 'Week-end' },
            { label: 'Events', value: 'A theme' },
            { label: 'Privatisation', value: 'Sur demande' }
          ],
          image:
            'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'highlights',
          eyebrow: 'Moments',
          title: 'Des formats que vous pouvez activer ou desactiver',
          items: [
            {
              title: 'Brunch tropical',
              description: 'Une formule weekend avec live cooking et buffet.',
              icon: Flower2
            },
            {
              title: 'Chef table',
              description: 'Menu en plusieurs temps au comptoir ou en salon prive.',
              icon: Sparkles
            },
            {
              title: 'Soirees accords',
              description: 'Vins, cocktails, musique et menus a theme.',
              icon: Martini
            }
          ]
        },
        {
          type: 'gallery',
          eyebrow: 'Scenes',
          title: 'Dejeuner, sunset, diner, evenement',
          images: [
            {
              src: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=900&q=80',
              alt: 'Brunch raffine'
            },
            {
              src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80',
              alt: 'Soiree conviviale'
            },
            {
              src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
              alt: 'Cocktails lounge'
            }
          ]
        }
      ]
    },
    {
      slug: '/reservation',
      label: 'Reservation',
      title: 'Reserver une table',
      sections: [
        {
          type: 'hero',
          eyebrow: 'Contact rapide',
          title: 'Le point d entree ideal pour une future reservation connectee.',
          description:
            'Cette page prepare le terrain pour brancher ensuite une API de disponibilite, une caisse, ou un CRM restaurant.',
          primaryCta: { label: 'Appeler', href: 'tel:+2290100000000' },
          secondaryCta: { label: 'Envoyer un email', href: 'mailto:restaurant@lecactushotel.bj' },
          stats: [
            { label: 'Tables', value: '2 a 20 personnes' },
            { label: 'Privatisation', value: 'Possible' },
            { label: 'Reponse', value: 'Rapide' }
          ],
          image:
            'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1200&q=80'
        },
        {
          type: 'reservation-cta',
          eyebrow: 'Comment ca marche',
          title: 'Une structure deja prete pour evoluer',
          description:
            'Aujourd hui: vitrine premium. Demain: moteur de reservations, formulaires avances, gestion de creneaux et synchronisation POS.',
          bullets: [
            'Coordonnees claires',
            'Flux extensible',
            'Architecture decouplee'
          ]
        },
        {
          type: 'contact',
          eyebrow: 'Coordonnees',
          title: 'Par telephone, email ou a la reception',
          address: "Hotel Cactus, Cotonou, Benin",
          phone: '+229 01 00 00 00 00',
          email: 'restaurant@lecactushotel.bj',
          schedule: [
            'Reservations traitees tous les jours',
            'Confirmation selon disponibilite',
            'Groupes et privatisations sur devis'
          ]
        }
      ]
    }
  ]
};
