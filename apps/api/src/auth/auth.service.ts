import { Injectable, UnauthorizedException } from '@nestjs/common';
import { StaffUser } from '../common/types';
import { RestaurantDataService } from '../data/restaurant-data.service';

@Injectable()
export class AuthService {
  constructor(private readonly restaurantDataService: RestaurantDataService) {}

  login(email: string, password: string) {
    const user = this.restaurantDataService.getUsers().find((entry) => entry.email === email && entry.password === password && entry.active);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return {
      accessToken: this.createToken(user),
      user: this.sanitizeUser(user)
    };
  }

  validateToken(token: string) {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const [userId, role] = decoded.split(':');
      const user = this.restaurantDataService.getUsers().find((entry) => entry.id === userId && entry.role === role && entry.active);

      if (!user) {
        throw new UnauthorizedException('Session invalide');
      }

      return this.sanitizeUser(user);
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }

  changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.restaurantDataService.updateUserPassword(userId, currentPassword, newPassword);
  }

  private createToken(user: StaffUser) {
    return Buffer.from(`${user.id}:${user.role}`, 'utf8').toString('base64url');
  }

  private sanitizeUser(user: StaffUser) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
