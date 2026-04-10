import { IsBoolean } from 'class-validator';

export class UpdateMenuItemDto {
  @IsBoolean()
  available!: boolean;
}
