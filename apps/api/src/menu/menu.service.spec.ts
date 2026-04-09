import { MenuService } from './menu.service';

describe('MenuService', () => {
  it('returns menu categories', () => {
    const service = new MenuService();
    const categories = service.getMenu();

    expect(categories).toHaveLength(2);
    expect(categories[0].items[0].name).toContain('Tartare');
  });
});
