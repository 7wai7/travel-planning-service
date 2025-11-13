import { HttpException, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import RegisterDto from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import LoginDto from './dto/login.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hash = await bcrypt.hash(registerDto.password, 5);
    const data = {
      ...registerDto,
      hash_password: registerDto.password,
      password: undefined,
    };
    const user = await this.userService.create({
      ...data,
      hash_password: hash,
    });

    return this.generateToken({
      id: user.id,
      username: registerDto.username,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findOne({
      username: loginDto.username,
    });
    if (!user) throw new HttpException({ message: 'User not found' }, 404);

    return this.generateToken({
      id: user.id,
      username: loginDto.username,
    });
  }

  logout(res: Response) {
    res.clearCookie('token');
    res.end();
  }

  generateToken(user: { id: number; username: string }) {
    const userData = { id: user.id, username: user.username };
    return {
      user: userData,
      token: this.jwtService.sign(userData),
    };
  }
}
