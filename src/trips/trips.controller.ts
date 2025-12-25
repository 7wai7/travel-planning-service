import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import CreateTripDto from './dto/create-trip.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ReqUser } from 'src/decorators/ReqUser';
import type { TokenUserData } from 'src/auth/types/tokenUserData';
import { TripRoleGuard } from 'src/guards/trip-role.guard';
import { TripRole } from '@prisma/client';
import { TripRoles } from 'src/decorators/trip-roles.decorator';

@Controller('trips')
@UseGuards(AuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('/by-id/:id')
  async getTrip(
    @Param('id') id: string,
    @Query('include') include: string[] = [],
  ) {
    const trip = await this.tripsService.findOne(
      { id: +id },
      this.getPrismaInclude(include),
    );

    if (!trip) throw new NotFoundException('Trip does not exist');
    return trip;
  }

  @Get('/my/trips')
  async myTrips(
    @ReqUser() user: TokenUserData,
    @Query('include') include: string[] = [],
  ) {
    return await this.tripsService.findMany(
      {
        owner_id: user.id,
      },
      this.getPrismaInclude(include),
    );
  }

  @Get('/my/trips/participating')
  async myTripsParticipates(
    @ReqUser() user: TokenUserData,
    @Query('include') include: string[] = [],
  ) {
    return await this.tripsService.findMany(
      {
        tripParticipants: {
          some: {
            user_id: user.id,
          },
        },
      },
      {
        ...this.getPrismaInclude(include),
        tripParticipants: {
          where: { user_id: user.id },
          select: { role: true },
        },
      },
    );
  }

  @Get('/invite')
  async invite(@ReqUser() user: TokenUserData, @Query('token') token: string) {
    return await this.tripsService.invite(user.id, token);
  }

  @Post()
  async create(
    @ReqUser() user: TokenUserData,
    @Body() createTripDto: CreateTripDto,
  ) {
    return await this.tripsService.create({
      ...createTripDto,
      owner: { connect: { id: user.id } },
    });
  }

  @Post('/edit/:trip_id')
  async edit(
    @ReqUser() user: TokenUserData,
    @Body() createTripDto: CreateTripDto,
  ) {
    return await this.tripsService.create({
      ...createTripDto,
      owner: { connect: { id: user.id } },
    });
  }

  @Post('/:trip_id/collaborator')
  @UseGuards(TripRoleGuard)
  @TripRoles(TripRole.OWNER)
  async addCollaborator(
    @Param('trip_id') tripId: number,
    @Query('userId') userId: number,
  ) {
    return await this.tripsService.addCollaborator(userId, tripId);
  }

  @Post('/:trip_id/access')
  @UseGuards(TripRoleGuard)
  @TripRoles(TripRole.OWNER)
  async access(
    @ReqUser() user: TokenUserData,
    @Param('trip_id', ParseIntPipe) trip_id: number, // trip id
    @Query('email') email: string, // who to invite
  ) {
    return await this.tripsService.access(trip_id, user.email, email);
  }

  @Delete('/:trip_id')
  @UseGuards(TripRoleGuard)
  @TripRoles(TripRole.OWNER)
  async delete(
    @ReqUser() user: TokenUserData,
    @Param('trip_id', ParseIntPipe) trip_id: number,
  ) {
    return await this.tripsService.deleteById(user.id, trip_id);
  }

  getPrismaInclude(include: string[]) {
    const allowedIncludes = ['owner', 'tripParticipants', 'places'];

    return Object.fromEntries(
      allowedIncludes.map((key) => [key, include.includes(key)]),
    );
  }
}
