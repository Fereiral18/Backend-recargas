import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserStatus } from '../../common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * The token only proves who the caller is — role and status are always
   * re-read from the DB, never trusted from the payload. Otherwise a user
   * who gets blocked, or an admin who gets demoted, would keep their old
   * access until the token expires.
   */
  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { uuid: payload.sub },
      select: ['uuid', 'email', 'role', 'status'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    return {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    };
  }
}
