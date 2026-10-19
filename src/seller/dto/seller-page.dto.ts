import { ApiProperty } from '@nestjs/swagger';
import { Seller } from '../entities/seller.entity';
class PageMeta {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
  @ApiProperty() totalPages: number;
}
export class SellerPageDto {
  @ApiProperty({ type: () => [Seller] }) data: Seller[];
  @ApiProperty({ type: () => PageMeta }) meta: PageMeta;
}
