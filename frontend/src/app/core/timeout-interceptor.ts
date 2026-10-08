import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

export const timeoutInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(timeout(10_000));