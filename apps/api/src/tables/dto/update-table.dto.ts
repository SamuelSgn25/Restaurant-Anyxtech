import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TableShape, TableStatus } from '../../common/types';

const shapes: TableShape[] = ['round', 'square', 'booth'];
const statuses: TableStatus[] = ['available', 'occupied', 'reserved', 'cleaning'];

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsIn(shapes)
  shape?: TableShape;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  posX?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  posY?: number;

  @IsOptional()
  @IsNumber()
  @Min(6)
  @Max(30)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(6)
  @Max(30)
  height?: number;

  @IsOptional()
  @IsIn(statuses)
  status?: TableStatus;
}
