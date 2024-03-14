import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  label: string;

  @IsOptional()
  parentId: number;
}
