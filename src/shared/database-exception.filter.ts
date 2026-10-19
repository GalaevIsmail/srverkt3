import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const code = (exception.driverError as { code?: string }).code;
    const status = code === '23505' ? 409 : code === '23503' ? 400 : 500;
    const message = code === '23505' ? 'Продавец с таким email уже существует'
      : code === '23503' ? 'Указанный продавец не существует'
      : 'Ошибка базы данных';
    host.switchToHttp().getResponse().status(status).json({ statusCode: status, message });
  }
}
