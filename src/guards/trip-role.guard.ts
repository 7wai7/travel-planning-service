import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TRIP_ROLES_KEY } from 'src/decorators/trip-roles.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripRoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(TRIP_ROLES_KEY, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true; // якщо не вказані — дозволяємо

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Unauthorized');

    const tripId = Number(req.params.trip_id);
    if (!tripId) throw new ForbiddenException('Trip id is required');

    // Отримуємо роль з DB
    const participant = await this.prisma.tripParticipants.findUnique({
      where: { user_id_trip_id: { user_id: user.id, trip_id: tripId } },
      select: { role: true },
    });

    // Якщо немає запису — це "не-учасник" — роль undefined
    const role = participant?.role ?? null;

    if (!role) {
      // явно забороняємо не-учасникам, якщо вони не в allowed list
      throw new ForbiddenException('You are not a participant of this trip');
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException('Forbidden: insufficient role');
    }

    req.tripRole = role;
    return true;
  }
}
