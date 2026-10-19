import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class QuerySellersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number) @IsInt() @Min(1) @Max(1000000) page = 1;
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 10;
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(120)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name?: string;
  @ApiPropertyOptional({ enum: ['id', 'name', 'email'], default: 'id' })
  @IsIn(['id', 'name', 'email']) sortBy: 'id' | 'name' | 'email' = 'id';
  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsIn(['ASC', 'DESC']) sortOrder: 'ASC' | 'DESC' = 'ASC';
}
