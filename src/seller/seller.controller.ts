import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { QuerySellersDto } from './dto/query-sellers.dto';
import { SellerPageDto } from './dto/seller-page.dto';
import { Seller } from './entities/seller.entity';

@ApiTags('sellers')
@ApiBadRequestResponse({ description: 'Ошибка валидации' })
@Controller('sellers')
export class SellerController {
  constructor(private readonly service: SellerService) {}
  @Post() @ApiOperation({ summary: 'Создать продавца' })
  @ApiCreatedResponse({ type: Seller }) @ApiConflictResponse({ description: 'Email уже занят' })
  create(@Body() dto: CreateSellerDto) { return this.service.create(dto); }
  @Get() @ApiOperation({ summary: 'Продавцы с товарами, фильтром, сортировкой и пагинацией' })
  @ApiOkResponse({ type: SellerPageDto })
  findAll(@Query() query: QuerySellersDto) { return this.service.findAll(query); }
  @Get(':id') @ApiOkResponse({ type: Seller }) @ApiNotFoundResponse()
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Patch(':id') @ApiOkResponse({ type: Seller }) @ApiNotFoundResponse() @ApiConflictResponse()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSellerDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(204) @ApiNoContentResponse({ description: 'Продавец и его товары удалены' }) @ApiNotFoundResponse()
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
