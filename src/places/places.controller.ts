import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import CreatePlaceDto from './dto/create-place.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { TripRoleGuard } from 'src/guards/trip-role.guard';
import { TripRoles } from 'src/decorators/trip-roles.decorator';
import { TripRole } from '@prisma/client';

@Controller('places/:trip_id')
@UseGuards(AuthGuard)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseGuards(TripRoleGuard)
  @TripRoles(TripRole.OWNER, TripRole.COLLABORATOR)
  async create(
    @Param('trip_id', ParseIntPipe) tripId: number,
    @Body() placeDto: CreatePlaceDto,
  ) {
    return await this.placesService.create({
      ...placeDto,
      trip: { connect: { id: tripId } },
    });
  }

  @Put('/:id')
  @UseGuards(TripRoleGuard)
  @TripRoles(TripRole.OWNER, TripRole.COLLABORATOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() placeDto: CreatePlaceDto,
  ) {
    return await this.placesService.update(id, placeDto);
  }

  @Delete('/:id')
  @UseGuards(TripRoleGuard)
  @TripRoles(TripRole.OWNER, TripRole.COLLABORATOR)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.placesService.delete(id);
  }
}
