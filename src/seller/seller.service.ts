import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { QuerySellersDto } from './dto/query-sellers.dto';

@Injectable()
export class SellerService {
  constructor(@InjectRepository(Seller) private readonly sellers: Repository<Seller>) {}
  create(dto: CreateSellerDto) { return this.sellers.save(this.sellers.create(dto)); }

  async findAll(query: QuerySellersDto) {
    const { page, limit, name, sortBy, sortOrder } = query;
    const qb = this.sellers.createQueryBuilder('seller')
      .leftJoinAndSelect('seller.products', 'product');
    if (name) {
      const escaped = name.replace(/[\\%_]/g, '\\$&');
      qb.where('seller.name ILIKE :name', { name: `%${escaped}%` });
    }
    // sortBy / sortOrder are restricted by the validated DTO.
    qb.orderBy(`seller.${sortBy}`, sortOrder);
    if (sortBy !== 'id') qb.addOrderBy('seller.id', 'ASC');
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findOne(id: number) {
    const seller = await this.sellers.findOne({ where: { id }, relations: { products: true } });
    if (!seller) throw new NotFoundException('Продавец не найден');
    return seller;
  }
  async update(id: number, dto: UpdateSellerDto) {
    const seller = await this.sellers.findOneBy({ id });
    if (!seller) throw new NotFoundException('Продавец не найден');
    await this.sellers.save(this.sellers.merge(seller, dto));
    return this.findOne(id);
  }
  async remove(id: number) {
    const result = await this.sellers.delete(id);
    if (!result.affected) throw new NotFoundException('Продавец не найден');
  }
}
