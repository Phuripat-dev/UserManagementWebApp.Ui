import { RoleDto } from './RoleDto.model';
import { PermissionDto } from './PermissionDto.model';

export interface UserDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userName: string;
  password: string;
  role: RoleDto;
  permissions: PermissionDto[];
}
