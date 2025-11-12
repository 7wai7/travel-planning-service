import { IsEmail } from 'class-validator';
import LoginDto from './login.dto';

export default class RegisterDto extends LoginDto {
  @IsEmail()
  readonly email: string;
}
