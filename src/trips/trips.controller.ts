import { Body, Controller, Get, Post } from '@nestjs/common';
import { TripsService } from './trips.service';
import CreateTripDto from './dto/create-trip.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get('/my')
  async myTrips() {}

  @Post()
  async create(@Body() createTripDto: CreateTripDto) {
    return await this.tripsService.create({
      ...createTripDto,
      owner: { connect: { id: 1 } }, // TODO: add guard
    });
  }
}
