import { Injectable } from '@nestjs/common';
import { ModuleMetadata } from '../common/types';

@Injectable()
export class SettingsService {
  getRestaurantProfile() {
    const modules: ModuleMetadata[] = [
      { code: 'public-site', enabled: true, title: 'Site public', description: 'Presentation du restaurant et reservation client en ligne.' },
      { code: 'auth-roles', enabled: true, title: 'Authentification et roles', description: 'Acces differencies pour super admin, admin, serveur, chef et caisse.' },
      { code: 'tables-floor', enabled: true, title: 'Plan de salle interactif', description: 'Vue graphique des zones, tables, affectations et deplacements drag and drop.' },
      { code: 'orders-kitchen', enabled: true, title: 'Commandes et cuisine', description: 'Creation, production, rotation et remise au service.' },
      { code: 'notifications', enabled: true, title: 'Notifications', description: 'Alertes sur reservations, commandes, paiements et modifications structurelles.' }
    ];

    return {
      brand: 'Restaurant Hotel Cactus',
      city: 'Cotonou',
      concept: 'Cuisine franco-beninoise et operations restaurant connectees',
      modules,
      recommendedPosBridge: 'Hamster POS inspired integration layer'
    };
  }
}

