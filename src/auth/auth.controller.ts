import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';

@Controller('auth')
export class AuthController {
  tokenAge = 1000 * 60 * 60 * 24;

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Res() res: Response, @Body() registerDto: RegisterDto) {
    const token = await this.authService.register(registerDto);
    return this.setCookieToken(res, token);
  }

  @Post('login')
  async login(@Res() res: Response, @Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return this.setCookieToken(res, token);
  }

  @Post('/logout')
  logout(@Res() res: Response) {
    this.authService.logout(res);
  }

  private setCookieToken(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: this.tokenAge, // Cookie expiration in milliseconds (e.g., 1 hour)
    });

    return res.status(200).end();
  }
}
