import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns enabled management modules for the restaurant profile', () => {
    const service = new SettingsService();

    const profile = service.getRestaurantProfile();

    expect(profile.brand).toBe('Restaurant Hotel Cactus');
    expect(profile.modules.some((entry) => entry.code === 'tables-floor')).toBe(true);
  });
});
