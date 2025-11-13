import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import dotenv from "dotenv";
import { TokenUserData } from './types/tokenUserData';
dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token =
      req.cookies ? req.cookies['token'] : req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    try {
      const user = this.jwtService.verify(token, {
        secret: process.env.SECRET_TOKEN_KEY
      });
      req['user'] = user as TokenUserData;
    } catch (err) {
      console.log(err)
      throw new UnauthorizedException(err.message);
    }

    return true;
  }
}
