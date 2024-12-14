import { Body, Controller, Post, Put, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QuitDto } from './dto/quit.dto';
import { ApiExceptionDto } from 'src/dto/api-exception.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login Success' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            userId: { type: 'string', example: 'john.doe' },
            username: { type: 'string', example: 'John Doe' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid credentials',
    type: ApiExceptionDto
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.userId,
        username: result.username,
      }
    };
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Registration successful' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'john.doe' },
            username: { type: 'string', example: 'John Doe' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request - ID already in use',
    type: ApiExceptionDto
  })
  @Post('register')
  async register(@Body() data: RegisterDto): Promise<any> {
    const result = await this.authService.register(data);
    return {
      success: true,
      message: 'Registration successful',
      data: {
        userId: result.userId,
        username: result.username,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      }
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Token refreshed successfully' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid refresh token',
    type: ApiExceptionDto
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    };
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profile updated successfully' },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'john.doe' },
            username: { type: 'string', example: 'John Doe' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized',
    type: ApiExceptionDto
  })
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.authService.updateProfile(updateProfileDto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: result
    };
  }

  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Account deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Account deleted successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized',
    type: ApiExceptionDto
  })
  @UseGuards(JwtAuthGuard)
  @Post('quit')
  async quit(@Body() quitDto: QuitDto) {
    await this.authService.quit(quitDto);
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  }
}
