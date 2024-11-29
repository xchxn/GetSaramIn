import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() req: any): Promise<any> {
    const result = await this.authService.login(req);

    return {
      message: 'Login Success',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: result.userId,
      username: result.username,
    };
  }

  @Post('register')
  async register(@Body() req: any): Promise<any> {
    return this.authService.register(req);
  }
}
