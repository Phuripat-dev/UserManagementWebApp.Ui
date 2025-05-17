import { PermissionDto } from './PermissionDto.model';
import { RoleDto } from './RoleDto.model';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userName: string;
  password: string;
  role: RoleDto;
  permissions: PermissionDto[];
}
