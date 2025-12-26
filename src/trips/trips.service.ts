import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TripRole } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { randomUUID } from 'crypto';
import { mapPrismaError } from 'src/utils/mapPrismaError';
import 'dotenv/config';

@Injectable()
export class TripsService {
  private ownerSelect = {
    select: {
      id: true,
      username: true,
      hash_password: false,
    },
  };

  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

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
        include: {
          owner: this.ownerSelect,
          places: true,
          tripParticipants: {
            where: { user_id: ownerId },
            select: { role: true },
          },
        },
      });
    } catch (e) {
      mapPrismaError(e);
    }
  }

  async update(id: number, data: Prisma.TripUpdateInput) {
    const start = this.resolveDate(data.startDate);
    const end = this.resolveDate(data.endDate);

    if (start && end) {
      this.checkDateRange(start, end);
    }

    const ownerId = data.owner?.connect?.id;

    try {
      return await this.prismaService.trip.update({
        where: {
          id,
        },
        data,
        include: {
          owner: this.ownerSelect,
          places: true,
          tripParticipants: {
            where: { user_id: ownerId },
            select: { role: true },
          },
        },
      });
    } catch (e) {
      mapPrismaError(e);
    }
  }

  async addCollaborator(userId: number, tripId: number) {
    try {
      return await this.prismaService.tripParticipants.create({
        data: {
          trip: { connect: { id: tripId } },
          user: { connect: { id: userId } },
          role: TripRole.COLLABORATOR,
        },
      });
    } catch (e) {
      mapPrismaError(e);
    }
  }

  async findOne(
    data: Partial<Prisma.TripWhereInput>,
    include: Prisma.TripInclude,
  ) {
    return await this.prismaService.trip.findFirst({
      where: data,
      include,
    });
  }

  async findMany(where: Prisma.TripWhereInput, include: Prisma.TripInclude) {
    return await this.prismaService.trip.findMany({
      where,
      include,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private tokens: Set<string> = new Set();

  async invite(userId: number, token: string) {
    if (this.tokens.has(token)) {
      const tripId = token.split('-').pop();
      if (!tripId) throw new HttpException('Trip does not exist', 404);
      const res = await this.addCollaborator(userId, +tripId);
      this.tokens.delete(token);
      return res;
    } else throw new HttpException({ message: 'Token not found' }, 400);
  }

  async access(tripId: number, smtpFrom: string, smtpTo: string) {
    if (smtpFrom === smtpTo)
      throw new HttpException(
        { message: 'You cannot send an invitation to yourself' },
        400,
      );

    const user = await this.userService.findOne({ email: smtpTo });
    if (!user) throw new NotFoundException('User not found');

    const trip = await this.prismaService.trip.findUnique({
      where: { id: tripId },
    });
    if (!trip) throw new NotFoundException('Trip not found');

    const token = `${randomUUID()}-${tripId}`;
    this.tokens.add(token);

    const baseUrl =
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      `http://localhost:${process.env.PORT || 4000}`;

    const inviteLink = `${baseUrl}/trips/invite?token=${encodeURIComponent(token)}`;

    await this.mailService.sendEmail({
      smtpFrom,
      smtpTo,
      subject: `Invite to trip: ${trip.title}`,
      template: 'invite-trip-email',
      context: {
        name: user.username || user.email || 'friend',
        trip,
        inviteLink,
      },
    });

    return {
      token,
      inviteLink,
    };
  }

  async deleteById(owner: number, id: number) {
    try {
      await this.prismaService.trip.delete({
        where: { owner_id: owner, id },
      });
    } catch (e) {
      mapPrismaError(e);
    }
  }

  resolveDate(
    value?:
      | string
      | Date
      | Prisma.NullableDateTimeFieldUpdateOperationsInput
      | null,
  ): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    if ('set' in value) {
      return value.set ? new Date(value.set) : null;
    }

    return null;
  }

  checkDateRange(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getTime() > end.getTime())
      throw new HttpException({ message: 'Invalid date range' }, 400);
  }
}
