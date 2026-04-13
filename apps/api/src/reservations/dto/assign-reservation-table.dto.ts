import { IsOptional, IsString } from 'class-validator';

export class AssignReservationTableDto {
  @IsOptional()
  @IsString()
  tableId?: string;
}
