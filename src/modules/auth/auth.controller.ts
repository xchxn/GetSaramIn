import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';

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

  @Post('refresh')
  async refreshToken(@Body() req: any): Promise<any> {
    return this.authService.refreshToken(req.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Body() req: any): Promise<any> {
    return this.authService.updateProfile(req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('quit')
  async quit(@Body() req: any): Promise<any> {
    return this.authService.quit(req);
  }
}
