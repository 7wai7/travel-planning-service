import {
  Body,
  Controller,
  Get,
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

  @Get('/my')
  @UseGuards(AuthGuard)
  async myTrips(@ReqUser() user: TokenUserData) {
    return await this.tripsService.findMany({
      owner_id: user.id,
    });
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

  @Post('/collaborator')
  async addCollaborator(
    @Query('userId') userId: number,
    @Query('tripId') tripId: number,
  ) {
    return await this.tripsService.addCollaborator(userId, tripId);
  }
}
