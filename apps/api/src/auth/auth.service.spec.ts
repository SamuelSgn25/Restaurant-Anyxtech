import { RestaurantDataService } from '../data/restaurant-data.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('returns a token and safe user payload on login', () => {
    const service = new AuthService(new RestaurantDataService());

    const result = service.login('admin@cactus.bj', 'Admin123!');

    expect(result.accessToken).toBeTruthy();
    expect(result.user.role).toBe('admin');
    expect('password' in result.user).toBe(false);
  });
});
