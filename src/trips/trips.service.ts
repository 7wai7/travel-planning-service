import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prismaService: PrismaService) {}

  async create(data: Prisma.TripCreateInput) {
    if (data.startDate && data.endDate)
      this.checkDateRange(data.startDate, data.endDate);

    try {
      return await this.prismaService.trip.create({ data });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const fields = (e.meta?.target as string[]).join(', ');
        throw new HttpException(`Duplicate value in field(s): ${fields}`, 400);
      }
      throw e;
    }
  }

  async findMany(data: Partial<Prisma.TripWhereInput>) {
    return await this.prismaService.trip.findMany({
      where: data,
    });
  }

  checkDateRange(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getTime() > end.getTime())
      throw new HttpException({ message: 'Invalid date range' }, 400);
  }
}
