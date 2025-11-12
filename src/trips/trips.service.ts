import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prismaService: PrismaService) {}

  async create(data: Prisma.TripCreateInput) {
    if (data.startDate && data.endDate)
      this.checkDateRange(data.startDate, data.endDate);

    const ownerId = data.owner.connect?.id;

    try {
      return await this.prismaService.trip.create({
        data: {
          ...data,
          tripParticipants: {
            create: [{ user: { connect: { id: ownerId } }, role: 'OWNER' }],
          },
        },
        include: { tripParticipants: true },
      });
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

  async addCollaborator(userId: number, tripId: number) {
    try {
      return await this.prismaService.tripParticipants.create({
        data: {
          trip: { connect: { id: tripId } },
          user: { connect: { id: userId } },
          role: 'COLLABORATOR',
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002':
            // Duplicate
            throw new HttpException('User is already a collaborator', 400);
          case 'P2003':
            // Foreign key
            throw new HttpException('User or Trip does not exist', 400);
        }
      }
      throw e;
    }
  }

  async findMany(data: Partial<Prisma.TripWhereInput>) {
    return await this.prismaService.trip.findMany({
      where: data,
      include: { tripParticipants: true },
    });
  }

  checkDateRange(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getTime() > end.getTime())
      throw new HttpException({ message: 'Invalid date range' }, 400);
  }
}
