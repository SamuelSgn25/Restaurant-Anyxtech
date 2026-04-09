import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  getEvents() {
    return [
      {
        id: 'brunch-tropical',
        title: 'Brunch tropical du dimanche',
        enabled: true,
        cadence: 'weekly'
      },
      {
        id: 'chef-table',
        title: 'Chef table degustation',
        enabled: true,
        cadence: 'monthly'
      }
    ];
  }
}
