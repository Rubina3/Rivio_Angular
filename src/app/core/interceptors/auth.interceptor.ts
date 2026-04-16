import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Grab the token from local storage (or your state management)
  const token = localStorage.getItem('rivio_token');

  // Clone the request to add the authentication header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Pass it on if there's no token (e.g., login request)
  return next(req);
};