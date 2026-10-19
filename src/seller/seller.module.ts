import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
@Module({ imports: [TypeOrmModule.forFeature([Seller])], controllers: [SellerController], providers: [SellerService] })
export class SellerModule {}
