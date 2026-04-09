import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuService {
  getMenu() {
    return [
      {
        category: 'Entrees',
        active: true,
        items: [
          {
            name: 'Tartare de daurade au gingembre',
            price: 9500,
            tags: ['poisson', 'signature']
          },
          {
            name: 'Accras de crevettes du golfe',
            price: 7500,
            tags: ['fruits de mer']
          }
        ]
      },
      {
        category: 'Plats',
        active: true,
        items: [
          {
            name: 'Poulet bicyclette facon yassa',
            price: 11000,
            tags: ['volaille', 'benin']
          }
        ]
      }
    ];
  }
}
