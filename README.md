# Sellers API — практическая работа

Готовый REST API продавцов и товаров: NestJS 11, PostgreSQL, TypeORM 0.3, DTO, Swagger, миграции. Node.js 24. Схема никогда не синхронизируется автоматически: `synchronize: false` в приложении и CLI DataSource.

## Запуск

Требуются Node.js 24 и запущенный Docker Engine / Docker Desktop.
Откройте терминал в папке проекта:

```sh
npm ci
```

Создайте `.env` из `.env.example`:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```sh
# Linux / macOS
cp .env.example .env
```

Затем:

```sh
docker compose up -d --wait
npm run migration:run
npm run start:dev
```

Swagger: http://localhost:3000/api. OpenAPI JSON: http://localhost:3000/api-json.
В Swagger раскройте метод, нажмите **Try it out**, заполните данные и нажмите **Execute**.
`.env` и `node_modules` исключены из Git и архива. Пароль в `.env.example` предназначен для локальной учебной базы.
Если порт 5432 занят, установите, например, `DB_PORT=5433` в `.env`: Docker и приложение используют эту переменную.

## Эндпоинты

| Метод | Путь | Назначение |
| --- | --- | --- |
| POST | `/sellers` | Создать продавца |
| GET | `/sellers` | Продавцы с товарами, фильтром, сортировкой и пагинацией |
| GET | `/sellers/:id` | Продавец и его товары |
| PATCH | `/sellers/:id` | Частично изменить продавца |
| DELETE | `/sellers/:id` | Удалить продавца и его товары |
| POST | `/products` | Создать товар |
| GET | `/products` | Все товары с продавцами |
| GET | `/products/:id` | Товар с продавцом |
| PATCH | `/products/:id` | Частично изменить товар, включая продавца |
| DELETE | `/products/:id` | Удалить товар |

POST возвращает 201; GET/PATCH — 200; DELETE — 204 без тела. Несуществующий объект или продавец товара — 404; повторный email — 409; некорректный DTO — 400. Email приводится к нижнему регистру. Неизвестные поля отклоняются. PATCH допускает пропуск полей, но не `null`.

## Ручная самопроверка в Swagger

1. `POST /sellers`:

```json
{ "name": "Иван", "email": "ivan@example.com" }
```

2. Возьмите `id` из ответа и используйте его как `sellerId` в `POST /products`:

```json
{ "title": "Клавиатура", "description": "Механическая клавиатура", "price": 1999.99, "sellerId": 1 }
```

Создайте ещё один товар того же продавца. Цена — JSON-число от 0 до 9999999999.99, не более двух знаков после точки. В БД хранится точным `numeric(12,2)`.

3. Вызовите `GET /sellers?name=ив&sortBy=name&sortOrder=ASC&page=1&limit=10`.
Ответ имеет форму:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

При наличии совпадений `data` содержит продавцов с массивами `products`, `total` — число продавцов после фильтра. Продавцы без товаров также возвращаются благодаря LEFT JOIN. `name` ищется без учёта регистра, `%` и `_` экранируются как обычные символы.

| Параметр | По умолчанию | Ограничения |
| --- | --- | --- |
| page | 1 | целое 1–1000000 |
| limit | 10 | целое 1–100 |
| name | отсутствует | строка до 120 символов |
| sortBy | id | id, name, email |
| sortOrder | ASC | ASC, DESC |

4. Проверьте оба GET по id, PATCH продавца и товара, GET всех товаров, DELETE отдельного товара. Для PATCH товара можно создать второго продавца и передать его `sellerId`.
5. Удалите продавца с товарами через `DELETE /sellers/:id`. GET удалённого продавца и его товаров должен вернуть 404.
6. Проверьте неверный email, повторный email, отрицательную цену, `limit=101`, неизвестные поля и отсутствующий `sellerId`.

## Миграции и FK

Начальная миграция уже включена в `src/database/migrations/`; она сгенерирована CLI TypeORM из entity. При первом запуске достаточно `npm run migration:run`.

```sh
# После изменения entity сгенерировать новую миграцию:
npm run migration:generate -- src/database/migrations/DescribeYourChange
# Применить / посмотреть / откатить последнюю миграцию:
npm run migration:run
npm run migration:show
npm run migration:revert
```

Проверить внешний ключ в контейнере (если меняли имя пользователя/БД, замените их):

```sh
docker compose exec db psql -U sellers -d sellers_db -c "\d products"
```

Должно присутствовать ограничение `FK_products_seller`: `FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE`. Фактический вывод проверки при подготовке решения находится в `docs/fk-verification.txt`.

## N+1 и структура

Код «до» и «после»: **`docs/n-plus-one.ts`**. До: `1 + N` запросов. После: один SELECT с `leftJoinAndSelect` без пагинации. В реальном `GET /sellers` TypeORM использует до трёх SELECT для идентификаторов страницы, связанных данных и общего количества. Их число не растёт с числом продавцов; это не N+1. `skip/take` сохраняют целостность страницы продавцов, даже если у одного продавца много товаров.

```text
src/
  main.ts                    ValidationPipe, Swagger, запуск
  app.module.ts              ConfigService и TypeORM
  database/                  CLI DataSource и миграции
  seller/                    entity, DTO, controller, service, module
  product/                   entity, DTO, controller, service, module
  shared/                    обработка ошибок БД
docs/                        N+1, подтверждение FK, результаты проверки
test/api.e2e.cjs              автоматическая HTTP-проверка
```

## Проверки

```sh
npm run typecheck
npm run build
# В отдельном терминале при работающем приложении и применённых миграциях:
npm run test:e2e
# Проверка реального количества SQL-запросов N+1 и внешнего ключа:
npm run test:database
```

Тест создаёт уникальные тестовые записи и удаляет их в конце. Проверяет CRUD, валидацию, конфликт email, ILIKE, сортировку, пагинацию продавцов с несколькими товарами, смену продавца, каскадное удаление, Swagger UI и OpenAPI. Для другого адреса задайте переменную окружения `API_URL`.

Остановка контейнера с сохранением данных: `docker compose down`.
Для сдачи передайте архив проекта либо загрузите содержимое папки в репозиторий.

Документация: [NestJS — базы данных](https://docs.nestjs.com/techniques/database), [TypeORM — QueryBuilder](https://typeorm.io/docs/query-builder/select-query-builder/).

