import { IsString, MaxLength, MinLength } from 'class-validator';

export default class LoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  readonly username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  readonly password: string;
}
