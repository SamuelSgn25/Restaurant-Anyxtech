import { RestaurantDataService } from './restaurant-data.service';

describe('RestaurantDataService', () => {
  it('tracks table occupancy when an order is created and closed', () => {
    const service = new RestaurantDataService();

    const created = service.createOrder({
      tableId: 'tbl-1',
      tableLabel: 'Table 01',
      customerName: 'Client test',
      serverId: 'usr-server-1',
      items: [
        {
          menuItemId: 'menu-1',
          name: 'Tartare de daurade au gingembre',
          quantity: 1,
          unitPrice: 9500
        }
      ]
    });

    expect(service.getTables().find((table) => table.id === 'tbl-1')?.status).toBe('occupied');

    service.updateOrderStatus(created.id, 'closed');

    expect(service.getTables().find((table) => table.id === 'tbl-1')?.status).toBe('cleaning');
  });
});
