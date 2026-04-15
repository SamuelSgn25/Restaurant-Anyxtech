import { RestaurantDataService } from './restaurant-data.service';

describe('RestaurantDataService', () => {
  const mockEventsGateway = { broadcast: jest.fn() } as any;

  it('tracks table occupancy when an order is created and closed', () => {
    const service = new RestaurantDataService(mockEventsGateway);

    const created = service.createOrder({
      tableId: 'tbl-1',
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
