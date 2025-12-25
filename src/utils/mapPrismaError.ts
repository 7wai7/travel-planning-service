import {
  HttpException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function mapPrismaError(e: unknown): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2000':
      case 'P2005':
      case 'P2006':
      case 'P2007':
        throw new BadRequestException();

      case 'P2002':
        throw new HttpException('Unique constraint failed', 400);

      case 'P2003':
      case 'P2014':
        throw new BadRequestException('Relation constraint violation');

      case 'P2025':
        throw new NotFoundException();

      case 'P2037':
        throw new BadRequestException('Database overloaded');

      default:
        throw new InternalServerErrorException();
    }
  }

  if (e instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('Bad input');
  }

  throw new InternalServerErrorException();
}

/**
 * === Prisma error codes ===
 *
 * P2000 — Value too long
 * P2001 — Record not found (where condition)
 * P2002 — Unique constraint failed
 * P2003 — Foreign key constraint failed
 * P2004 — Constraint failed
 * P2005 — Invalid value for field
 * P2006 — Invalid value
 * P2007 — Data validation error
 * P2014 — Relation violation
 * P2015 — Related record not found
 * P2016 — Query interpretation error
 * P2017 — Records for relation not connected
 * P2025 — Record not found
 * P2034 — Transaction failed
 * P2037 — Too many connections
 */
