import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../product/entities/product.entity';

@Entity('sellers')
export class Seller {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 120 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 254, unique: true }) email: string;
  @ApiProperty({ type: () => [Product] })
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];
}
