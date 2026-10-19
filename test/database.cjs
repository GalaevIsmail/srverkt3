require('dotenv/config');
require('reflect-metadata');
const assert = require('node:assert/strict');
const { DataSource } = require('typeorm');
const { Seller } = require('../dist/seller/entities/seller.entity');
const { Product } = require('../dist/product/entities/product.entity');

async function main() {
  const queries = [];
  const db = new DataSource({
    type: 'postgres', host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, entities: [Seller, Product], synchronize: false,
    logging: ['query'], logger: {
      logQuery: sql => queries.push(sql), logQueryError() {}, logQuerySlow() {},
      logSchemaBuild() {}, logMigration() {}, log() {},
    },
  });
  await db.initialize();
  const ids = [];
  try {
    for (let i = 0; i < 3; i++) {
      const seller = await db.getRepository(Seller).save({ name: 'N+1 demo', email: `nplus-${Date.now()}-${i}@example.com` });
      ids.push(seller.id);
      await db.getRepository(Product).save({ title: 'Demo', description: '', price: 10, sellerId: seller.id });
    }
    queries.length = 0;
    const before = await db.getRepository(Seller).find();
    for (const seller of before) seller.products = await db.getRepository(Product).findBy({ sellerId: seller.id });
    const beforeCount = queries.length;
    assert.equal(beforeCount, before.length + 1);
    queries.length = 0;
    const after = await db.getRepository(Seller).createQueryBuilder('seller').leftJoinAndSelect('seller.products', 'product').getMany();
    assert.equal(queries.length, 1);
    assert.equal(after.length, before.length);
    console.log(`N+1: ${before.length} sellers; before=${beforeCount} SELECT; after=${queries.length} SELECT. PASS`);
    const [fk] = await db.query("SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conname = 'FK_products_seller' AND conrelid = 'products'::regclass");
    assert.match(fk.definition, /FOREIGN KEY \(seller_id\) REFERENCES sellers\(id\) ON DELETE CASCADE/);
    console.log(`FK: ${fk.definition}. PASS`);
  } finally {
    if (ids.length) await db.getRepository(Seller).delete(ids);
    await db.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
