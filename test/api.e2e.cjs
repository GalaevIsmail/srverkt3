const { test } = require('node:test');
const assert = require('node:assert/strict');
const base = process.env.API_URL || 'http://localhost:3000';

async function request(method, path, body, status = 200) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.status, status, `${method} ${path}: ${text}`);
  return text ? JSON.parse(text) : undefined;
}

test('CRUD, validation, join, pagination, reassignment and cascade on PostgreSQL', async () => {
  const token = `test-${Date.now()}`;
  const ids = [];
  try {
    const s1 = await request('POST', '/sellers', { name: `${token} Alpha`, email: `${token}-a@example.com` }, 201);
    const s2 = await request('POST', '/sellers', { name: `${token} Beta`, email: `${token}-b@example.com` }, 201);
    ids.push(s1.id, s2.id);
    await request('POST', '/sellers', { name: 'Duplicate', email: s1.email.toUpperCase() }, 409);
    await request('POST', '/sellers', { name: ' ', email: 'invalid' }, 400);
    await request('POST', '/sellers', { name: 'Valid', email: 'valid@example.com', extra: 1 }, 400);
    await request('PATCH', `/sellers/${s1.id}`, { name: null }, 400);
    await request('PATCH', `/sellers/${s2.id}`, { email: s1.email }, 409);
    const changed = await request('PATCH', `/sellers/${s1.id}`, { name: `${token} Alpha updated` });
    assert.equal(changed.name, `${token} Alpha updated`);
    const payload = { title: 'Keyboard', description: 'Mechanical', price: 1299.99, sellerId: s1.id };
    const p1 = await request('POST', '/products', payload, 201);
    const p2 = await request('POST', '/products', { ...payload, title: 'Mouse', price: 0 }, 201);
    assert.equal(p1.price, 1299.99);
    assert.ok(Date.parse(p1.createdAt));
    await request('POST', '/products', { ...payload, sellerId: 2147483647 }, 404);
    for (const invalid of [{ price: -1 }, { price: 1.001 }, { price: null }, { sellerId: '1' }, { title: '' }]) {
      await request('POST', '/products', { ...payload, ...invalid }, 400);
    }
    await request('PATCH', `/products/${p1.id}`, { sellerId: 2147483647 }, 404);
    await request('PATCH', `/products/${p1.id}`, { sellerId: null }, 400);
    assert.equal((await request('GET', `/products/${p1.id}`)).seller.id, s1.id);
    assert.ok((await request('GET', '/products')).some(p => p.id === p1.id));
    const page = await request('GET', `/sellers?name=${token.toUpperCase()}&page=1&limit=1&sortBy=name&sortOrder=ASC`);
    assert.deepEqual(page.meta, { page: 1, limit: 1, total: 2, totalPages: 2 });
    assert.equal(page.data.length, 1);
    assert.equal(page.data[0].id, s1.id);
    assert.equal(page.data[0].products.length, 2);
    const second = await request('GET', `/sellers?name=${token}&page=2&limit=1&sortBy=name`);
    assert.equal(second.data[0].id, s2.id);
    assert.deepEqual(second.data[0].products, []);
    const beyond = await request('GET', `/sellers?name=${token}&page=9&limit=1`);
    assert.equal(beyond.meta.total, 2);
    assert.deepEqual(beyond.data, []);
    assert.equal((await request('GET', `/sellers?name=${token}&sortBy=email&sortOrder=DESC`)).data[0].id, s2.id);
    for (const query of ['page=0', 'limit=101', 'page=1.5', 'sortBy=price', 'sortOrder=bad', 'unknown=1']) {
      await request('GET', `/sellers?${query}`, undefined, 400);
    }
    assert.equal((await request('GET', `/sellers/${s1.id}`)).products.length, 2);
    const moved = await request('PATCH', `/products/${p1.id}`, { sellerId: s2.id, title: 'Updated', price: 12.5 });
    assert.equal(moved.sellerId, s2.id);
    assert.equal(moved.seller.id, s2.id);
    assert.equal(moved.price, 12.5);
    await request('DELETE', `/products/${p2.id}`, undefined, 204);
    await request('GET', `/products/${p2.id}`, undefined, 404);
    await request('DELETE', `/products/${p2.id}`, undefined, 404);
    await request('DELETE', `/sellers/${s2.id}`, undefined, 204);
    await request('GET', `/products/${p1.id}`, undefined, 404);
    await request('GET', `/sellers/${s2.id}`, undefined, 404);
    await request('PATCH', `/sellers/${s2.id}`, { name: 'Missing' }, 404);
    await request('PATCH', `/products/${p1.id}`, { title: 'Missing' }, 404);
    await request('GET', '/sellers/not-a-number', undefined, 400);
    const swagger = await request('GET', '/api-json');
    assert.ok(swagger.paths['/sellers'].get);
    assert.ok(swagger.paths['/products/{id}'].patch);
    assert.equal((await fetch(base + '/api')).status, 200);
  } finally {
    for (const id of ids) await fetch(`${base}/sellers/${id}`, { method: 'DELETE' });
  }
});
