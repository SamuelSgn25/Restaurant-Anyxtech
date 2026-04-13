import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TableShape, TableStatus } from '../../common/types';

const shapes: TableShape[] = ['round', 'square', 'booth'];
const statuses: TableStatus[] = ['available', 'occupied', 'reserved', 'cleaning'];

export class CreateTableDto {
  @IsString()
  label!: string;

  @IsString()
  zone!: string;

  @IsInt()
  @Min(1)
  seats!: number;

  @IsIn(shapes)
  shape!: TableShape;

  @IsNumber()
  @Min(0)
  @Max(100)
  posX!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  posY!: number;

  @IsNumber()
  @Min(6)
  @Max(30)
  width!: number;

  @IsNumber()
  @Min(6)
  @Max(30)
  height!: number;

  @IsOptional()
  @IsIn(statuses)
  status?: TableStatus;
}
