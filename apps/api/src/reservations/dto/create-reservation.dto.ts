import { IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  guestName!: string;

  @IsEmail()
  email!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  guests!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
