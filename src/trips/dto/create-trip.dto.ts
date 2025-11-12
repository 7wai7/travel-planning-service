import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export default class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  readonly title: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  readonly description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly startDate?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly endDate?: string;
}
