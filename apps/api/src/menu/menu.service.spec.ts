import { RestaurantDataService } from '../data/restaurant-data.service';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  const mockEventsGateway = { broadcast: jest.fn() } as any;

  it('returns menu categories', () => {
    const service = new MenuService(new RestaurantDataService(mockEventsGateway));
    const categories = service.getMenu();

    expect(categories.length).toBeGreaterThan(1);
    expect(categories[0].items[0].name).toContain('Tartare');
  });
});
