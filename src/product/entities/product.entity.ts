import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Seller } from '../../seller/entities/seller.entity';

@Entity('products')
@Check('CHK_products_price_nonnegative', '"price" >= 0')
export class Product {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) title: string;
  @ApiProperty() @Column({ type: 'text' }) description: string;
  @ApiProperty({ example: 1999.99 })
  @Column({ type: 'numeric', precision: 12, scale: 2,
    transformer: { to: (value: number) => value, from: (value: string) => Number(value) } })
  price: number;
  @ApiProperty() @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @ApiProperty() @Index('IDX_products_seller_id')
  @Column({ name: 'seller_id', type: 'integer' }) sellerId: number;
  @ApiProperty({ type: () => Seller })
  @ManyToOne(() => Seller, (seller) => seller.products, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id', foreignKeyConstraintName: 'FK_products_seller' })
  seller: Seller;
}
