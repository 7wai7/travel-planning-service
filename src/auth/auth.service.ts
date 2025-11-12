import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import RegisterDto from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import LoginDto from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    return this.generateToken({
        id: 1,
        username: registerDto.username
    });
  }

  async login(loginDto: LoginDto) {
    return this.generateToken({
        id: 1,
        username: loginDto.username
    });
  }

  logout(res: Response) {
    res.clearCookie("token");
    res.end();
  }

  generateToken(user: {
    id: number,
    username: string
  }) {
    const userData = { id: user.id, username: user.username };
    return this.jwtService.sign(userData);
  }
}
