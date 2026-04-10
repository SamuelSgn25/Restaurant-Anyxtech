import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Public } from './auth.decorators';
import { AuthService } from './auth.service';
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
}
