import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2025': // Not found
            throw new HttpException('Place does not exist', 404);
        }
      }
      throw e;
    }
  }

  async delete(id: number) {
    try {
      return await this.prismaService.place.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2025': // Not found
            throw new HttpException('Place does not exist', 404);
        }
      }
      throw e;
    }
  }
}
