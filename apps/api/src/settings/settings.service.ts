import { Injectable } from '@nestjs/common';
import { ModuleMetadata } from '../common/types';

@Injectable()
export class SettingsService {
  getRestaurantProfile() {
    const modules: ModuleMetadata[] = [
      {
        code: 'public-site',
        enabled: true,
        title: 'Site public',
        description: 'Presentation du restaurant, carte et prise de reservation.'
      },
      {
        code: 'auth-roles',
        enabled: true,
        title: 'Authentification et roles',
        description: 'Acces differencies pour super admin, admin, serveur et chef.'
      },
      {
        code: 'orders-kitchen',
        enabled: true,
        title: 'Commandes et cuisine',
        description: 'Creation, suivi de production et remise au service.'
      },
      {
        code: 'payments',
        enabled: true,
        title: 'Paiements caisse',
        description: 'Historique des encaissements et suivi du chiffre.'
      }
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
