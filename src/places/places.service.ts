import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { mapPrismaError } from 'src/utils/mapPrismaError';

@Injectable()
export class PlacesService {
  constructor(private prismaService: PrismaService) {}

  async create(data: Prisma.PlaceCreateInput) {
    return await this.prismaService.place.create({ data });
  }

  async update(id: number, data: Prisma.PlaceUpdateInput) {
    try {
      return await this.prismaService.place.update({
        where: { id },
        data,
      });
    } catch (e) {
      mapPrismaError(e);
    }
  }

  async delete(id: number) {
    try {
      return await this.prismaService.place.delete({
        where: { id },
      });
    } catch (e) {
      mapPrismaError(e);
    }
  }
}
