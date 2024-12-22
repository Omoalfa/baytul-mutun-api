import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

const Roles = (...value: UserRole[]) => SetMetadata(ROLES_KEY, value)

export default Roles;
