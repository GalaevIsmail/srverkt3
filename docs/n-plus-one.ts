// Демонстрационный код. Не подключается к HTTP-маршрутам.
import { DataSource } from 'typeorm';
import { Seller } from '../src/seller/entities/seller.entity';
import { Product } from '../src/product/entities/product.entity';

// ДО: 1 запрос продавцов + N запросов товаров = 1 + N.
export async function before(db: DataSource) {
  const sellers = await db.getRepository(Seller).find();
  for (const seller of sellers) {
    seller.products = await db.getRepository(Product).findBy({ sellerId: seller.id });
  }
  return sellers;
}

// ПОСЛЕ: ровно 1 SELECT с LEFT JOIN, без пагинации и отдельного COUNT.
export async function after(db: DataSource) {
  return db.getRepository(Seller).createQueryBuilder('seller')
    .leftJoinAndSelect('seller.products', 'product').getMany();
}

// В GET /sellers дополнительно используются skip/take и getManyAndCount.
// TypeORM может выполнить SELECT идентификаторов страницы, SELECT с JOIN
// и COUNT(DISTINCT seller.id): до 3 SELECT, а не 1 + N.
// Так пагинация считает продавцов, а не строки произведения JOIN,
// и возвращает все товары каждого продавца на странице.
