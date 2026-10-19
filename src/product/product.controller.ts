import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@ApiTags('products') @ApiBadRequestResponse({ description: 'Ошибка валидации' })
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}
  @Post() @ApiOperation({ summary: 'Создать товар существующего продавца' })
  @ApiCreatedResponse({ type: Product }) @ApiNotFoundResponse()
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }
  @Get() @ApiOkResponse({ type: Product, isArray: true })
  findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOkResponse({ type: Product }) @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') @ApiOkResponse({ type: Product }) @ApiNotFoundResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(204) @ApiNoContentResponse() @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
