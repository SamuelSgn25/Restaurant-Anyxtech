import { Body, Controller, Get, Post, Patch, Req } from '@nestjs/common';
import { Public } from './auth.decorators';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './change-password.dto';
import { UpdateProfileDto } from './update-profile.dto';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload.email, payload.password);
  }

  @Get('me')
  me(@Req() request: { user: unknown }) {
    return request.user;
  }

  @Post('change-password')
  changePassword(
    @Req() request: { user: { id: string } },
    @Body() payload: ChangePasswordDto
  ) {
    return this.authService.changePassword(request.user.id, payload.currentPassword, payload.newPassword);
  }

  @Patch('profile')
  updateProfile(
    @Req() request: { user: { id: string } },
    @Body() payload: UpdateProfileDto
  ) {
    return this.authService.updateProfile(request.user.id, payload);
  }
}
