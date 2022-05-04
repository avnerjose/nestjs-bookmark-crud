import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp({ email, password }: AuthDTO) {
    const hash = await argon.hash(password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
        },
      });

      return {
        access_token: await this.signToken(user.id, user.email),
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials already taken');
        }
      }
      throw err;
    }
  }

  async signIn({ email, password }: AuthDTO) {
    const userAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userAlreadyExists) throw new ForbiddenException('Invalid credentials');

    const valid = await argon.verify(userAlreadyExists.hash, password);

    if (!valid) throw new ForbiddenException('Invalid credentials');

    delete userAlreadyExists.hash;

    return {
      access_token: await this.signToken(
        userAlreadyExists.id,
        userAlreadyExists.email,
      ),
    };
  }
  async signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
