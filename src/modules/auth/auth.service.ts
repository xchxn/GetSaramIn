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

@Injectable()
export class AuthService {
  private saltOrRounds = 10;
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configServcie: ConfigService,
  ) {}

  async register(req: any): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { id: req.id },
    });

    if (existingUser) {
      throw new BadRequestException('ID already in use.');
    }

    const hashedPassword = await bcrypt.hash(req.password, this.saltOrRounds);

    const newUser = await this.userRepository.save({
      id: req.id,
      username: req.username,
      password: hashedPassword,
    });

    // 회원가입 즉시 토큰 발급
    const payload = { sub: newUser.id, username: newUser.username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // 리프레시 토큰 저장
    await this.userRepository.update(
      { id: newUser.id },
      { refreshToken: refreshToken },
    );

    return {
      accessToken,
      refreshToken,
      userId: newUser.id,
      username: newUser.username,
    };
  }

  async login(req: any): Promise<any> {
    const login = await this.userRepository
      .createQueryBuilder()
      .select()
      .where('id = :id', { id: req.id })
      .getOne();
    if (login === null) {
      throw new Error('There is no login information, register first please');
    }
    const check = await bcrypt.compare(req.password, login.password);
    if (check) {
      // JWT 인증 토큰 발급 추가
      const payload = { sub: login.id, username: login.username };

      login.accessToken = await this.jwtService.signAsync(payload);
      login.refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      await this.userRepository.save(login);

      return {
        accessToken: login.accessToken,
        refreshToken: login.refreshToken,
        userId: login.id,
        username: login.username,
      };
    } else throw new UnauthorizedException();
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      // 리프레시 토큰 검증
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userRepository.findOne({
        where: {
          id: payload.sub,
          refreshToken: refreshToken,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 새로운 토큰 발급
      const newPayload = { sub: user.id, username: user.username };
      const newAccessToken = await this.jwtService.signAsync(newPayload);
      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });

      // 새로운 리프레시 토큰 저장
      await this.userRepository.update(
        { id: user.id },
        { refreshToken: newRefreshToken },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userId: user.id,
        username: user.username,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateProfile(req: any): Promise<any> {
    return this.userRepository.update(req.id, req);
  }
}
