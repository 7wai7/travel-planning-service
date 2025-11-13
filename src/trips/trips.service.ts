import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TripsService {
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
          owner: {
            select: {
              id: true,
              username: true,
              hash_password: false,
            },
          },
        },
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
          case 'P2002': // Duplicate
            throw new HttpException('User is already a collaborator', 400);
          case 'P2003': // Foreign key
          case 'P2025': // Not found
            throw new HttpException('User or Trip does not exist', 404);
        }
      }
      throw e;
    }
  }

  async findOne(
    data: Partial<Prisma.TripWhereInput>,
    options: {
      owner?: boolean;
      participants?: boolean;
    } = {},
  ) {
    try {
      return await this.prismaService.trip.findFirst({
        where: data,
        include: {
          tripParticipants: options.participants
            ? { include: { user: true } }
            : false,
          owner: options.owner,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2025': // Not found
            throw new HttpException('Trip does not exist', 404);
        }
      }
      throw e;
    }
  }

  async findMany(
    data: Partial<Prisma.TripWhereInput>,
    options: {
      owner?: boolean;
      participants?: boolean;
    } = {},
  ) {
    return await this.prismaService.trip.findMany({
      where: data,
      include: {
        tripParticipants: options.participants
          ? { include: { user: true } }
          : false,
        owner: options.owner,
      },
    });
  }

  async findUserParticipates(
    userId: number,
    options: {
      owner?: boolean;
      participants?: boolean;
    } = {},
  ) {
    return await this.prismaService.trip.findMany({
      where: {
        tripParticipants: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        // за потреби підвантажити учасників і власника
        tripParticipants: options.participants
          ? { include: { user: true } }
          : false,
        owner: options.owner,
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
      'http://localhost:3000';
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

    return token;
  }

  async deleteById(owner: number, id: number) {
    try {
      await this.prismaService.trip.delete({
        where: { owner_id: owner, id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2025': // Not found
            throw new HttpException('Trip does not exist', 404);
        }
      }
      throw e;
    }
  }

  checkDateRange(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getTime() > end.getTime())
      throw new HttpException({ message: 'Invalid date range' }, 400);
  }
}
