import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Клавиатура', maxLength: 200 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @ApiProperty({ example: 'Механическая клавиатура' })
  @IsString() @MaxLength(10000) description: string;
  @ApiProperty({ example: 1999.99, minimum: 0, maximum: 9999999999.99 })
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999999999.99) price: number;
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt() @Min(1) @Max(2147483647) sellerId: number;
}
