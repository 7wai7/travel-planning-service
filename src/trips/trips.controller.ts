import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import CreateTripDto from './dto/create-trip.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('/my')
  async myTrips() {
    return await this.tripsService.findMany({
      owner_id: 1,
    });
  }

  @Post()
  async create(@Body() createTripDto: CreateTripDto) {
    return await this.tripsService.create({
      ...createTripDto,
      owner: { connect: { id: 1 } }, // TODO: add guard
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
