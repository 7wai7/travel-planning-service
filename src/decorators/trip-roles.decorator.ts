import { SetMetadata } from "@nestjs/common";

export const TRIP_ROLES_KEY = 'trip_roles';

// декоратор, який прикріплює ролі до методу/контролера
export const TripRoles = (...roles: string[]) => SetMetadata(TRIP_ROLES_KEY, roles);