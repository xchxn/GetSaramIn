import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QuitDto } from './dto/quit.dto';

@Injectable()
export class AuthService {
  private saltOrRounds = 10;
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configServcie: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { id: registerDto.id },
    });

    if (existingUser) {
      throw new BadRequestException('ID already in use.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, this.saltOrRounds);

    const newUser = await this.userRepository.save({
      id: registerDto.id,
      username: registerDto.username,
      password: hashedPassword,
    });

    // Generate tokens immediately after registration
    const payload = { sub: newUser.id, username: newUser.username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Save refresh token
    await this.userRepository.update(
      { id: newUser.id },
      { accessToken: accessToken, refreshToken: refreshToken },
    );

    return {
      message: 'Registration successful',
      accessToken,
      refreshToken,
      userId: newUser.id,
      username: newUser.username,
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: loginDto.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.userRepository.update(
      { id: user.id },
      { refreshToken: refreshToken },
    );

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      username: user.username,
    };
  }

  async refreshToken(token: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { refreshToken: token },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { sub: user.id, username: user.username };
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      await this.userRepository.update(
        { id: user.id },
        { refreshToken: refreshToken },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: updateProfileDto.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updateData: any = {};

    if (updateProfileDto.username) {
      updateData.username = updateProfileDto.username;
    }

    if (updateProfileDto.password) {
      updateData.password = await bcrypt.hash(
        updateProfileDto.password,
        this.saltOrRounds,
      );
    }

    await this.userRepository.update({ id: updateProfileDto.id }, updateData);

    return {
      message: 'Profile updated successfully',
    };
  }

  async quit(quitDto: QuitDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: quitDto.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.userRepository.delete({ id: quitDto.id });

    return {
      message: 'Account deleted successfully',
    };
  }
}
