import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('returns enabled modules for the restaurant profile', () => {
    const service = new SettingsService();

    const profile = service.getRestaurantProfile();

    expect(profile.brand).toBe('Restaurant Hotel Cactus');
    expect(profile.modules.every((entry) => entry.enabled)).toBe(true);
  });
});
