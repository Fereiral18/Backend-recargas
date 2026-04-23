import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

/**
 * Decorator to set required roles for a route
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
