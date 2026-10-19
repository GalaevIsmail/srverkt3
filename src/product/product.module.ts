import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Seller } from '../seller/entities/seller.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
@Module({ imports: [TypeOrmModule.forFeature([Product, Seller])], controllers: [ProductController], providers: [ProductService] })
export class ProductModule {}
