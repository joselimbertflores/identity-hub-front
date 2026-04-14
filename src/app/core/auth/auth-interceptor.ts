import { type HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithHeader = req.clone({
    withCredentials: true,
  });
  return next(reqWithHeader).pipe();
};
