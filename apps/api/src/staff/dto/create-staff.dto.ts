import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/types';

const roles: UserRole[] = ['super_admin', 'admin', 'server', 'chef', 'cashier'];

export class CreateStaffDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(roles)
  role!: UserRole;

  @IsString()
  @MinLength(8)
  password!: string;
}
