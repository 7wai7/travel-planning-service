import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('/by-id/:id')
  @UseGuards(AuthGuard)
  async getTrip(
    @Param('id') id: string,
    @Query('owner', new ParseBoolPipe({ optional: true }))
    owner = false,
    @Query('participants', new ParseBoolPipe({ optional: true }))
    participants = false,
    @Query('places', new ParseBoolPipe({ optional: true }))
    places = false,
  ) {
    return await this.tripsService.findOne(
      { id: +id },
      { owner, participants, places },
    );
  }

  @Get('/my/trips')
  @UseGuards(AuthGuard)
  async myTrips(
    @ReqUser() user: TokenUserData,
    @Query('owner', new ParseBoolPipe({ optional: true }))
    owner = false,
    @Query('participants', new ParseBoolPipe({ optional: true }))
    participants = false,
    @Query('places', new ParseBoolPipe({ optional: true }))
    places = false,
  ) {
    return await this.tripsService.findMany(
      {
        owner_id: user.id,
      },
      { owner, participants, places },
    );
  }

  @Get('/my/trips/participating')
  @UseGuards(AuthGuard)
  async myTripsParticipates(
    @ReqUser() user: TokenUserData,
    @Query('owner', new ParseBoolPipe({ optional: true }))
    owner = false,
    @Query('participants', new ParseBoolPipe({ optional: true }))
    participants = false,
    @Query('places', new ParseBoolPipe({ optional: true }))
    places = false,
  ) {
    return await this.tripsService.findUserParticipates(user.id, {
      owner,
      participants,
      places
    });
  }

  @Get('/invite')
  @UseGuards(AuthGuard)
  async invite(@ReqUser() user: TokenUserData, @Query('token') token: string) {
    return await this.tripsService.invite(user.id, token);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @ReqUser() user: TokenUserData,
    @Body() createTripDto: CreateTripDto,
  ) {
    return await this.tripsService.create({
      ...createTripDto,
      owner: { connect: { id: user.id } },
    });
  }

  @Post('/collaborator')
  @UseGuards(AuthGuard)
  async addCollaborator(
    @Query('userId') userId: number,
    @Query('tripId') tripId: number,
  ) {
    return await this.tripsService.addCollaborator(userId, tripId);
  }

  @Post('/:id/access')
  @UseGuards(AuthGuard)
  async access(
    @ReqUser() user: TokenUserData,
    @Param('id', ParseIntPipe) id: number, // trip id
    @Query('email') email: string, // who to invite
  ) {
    return await this.tripsService.access(id, user.email, email);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async delete(
    @ReqUser() user: TokenUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.tripsService.deleteById(user.id, id);
  }
}
