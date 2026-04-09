import { Injectable } from '@nestjs/common';
import { ModuleMetadata } from '../common/types';

@Injectable()
export class SettingsService {
  getRestaurantProfile() {
    const modules: ModuleMetadata[] = [
      {
        code: 'hero',
        enabled: true,
        title: 'Hero landing',
        description: 'Bloc d intro premium pour la page d accueil.'
      },
      {
        code: 'menu',
        enabled: true,
        title: 'Carte',
        description: 'Categories et items de la carte.'
      },
      {
        code: 'reservations',
        enabled: true,
        title: 'Reservations',
        description: 'Flux de contact et futur branchement POS.'
      },
      {
        code: 'events',
        enabled: true,
        title: 'Evenements',
        description: 'Brunchs, soirees et activations.'
      }
    ];

    return {
      brand: 'Restaurant Hotel Cactus',
      city: 'Cotonou',
      concept: 'Cuisine franco-beninoise',
      modules
    };
  }
}
