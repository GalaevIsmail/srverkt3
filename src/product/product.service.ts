import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Seller } from '../seller/entities/seller.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Seller) private readonly sellers: Repository<Seller>,
  ) {}
  private async checkSeller(id: number) {
    if (!await this.sellers.existsBy({ id })) throw new NotFoundException('Продавец не найден');
  }
  async create(dto: CreateProductDto) {
    await this.checkSeller(dto.sellerId);
    const product = await this.products.save(this.products.create(dto));
    return this.findOne(product.id);
  }
  findAll() { return this.products.find({ relations: { seller: true }, order: { id: 'ASC' } }); }
  async findOne(id: number) {
    const product = await this.products.findOne({ where: { id }, relations: { seller: true } });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }
  async update(id: number, dto: UpdateProductDto) {
    // Load without the old seller relation so changing sellerId cannot be overwritten.
    const product = await this.products.findOneBy({ id });
    if (!product) throw new NotFoundException('Товар не найден');
    if (dto.sellerId !== undefined) await this.checkSeller(dto.sellerId);
    await this.products.save(this.products.merge(product, dto));
    return this.findOne(id);
  }
  async remove(id: number) {
    const result = await this.products.delete(id);
    if (!result.affected) throw new NotFoundException('Товар не найден');
  }
}
