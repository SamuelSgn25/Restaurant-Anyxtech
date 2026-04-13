import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';

export class CreateReservationDto {
  @IsString()
  guestName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  guests!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  tableId?: string;
}
