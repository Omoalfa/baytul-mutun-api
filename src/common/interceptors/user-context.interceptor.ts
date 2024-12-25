import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.user) {
      const contentType = request.headers['content-type'];
      
      // Add user to request params
      if (!request.params) request.params = {};
      Object.defineProperty(request.params, 'currentUser', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: request.user
      });
      
      if (contentType && contentType.includes('multipart/form-data')) {
        // For multipart/form-data, add user to the parsed body
        if (!request.body) request.body = {};
        Object.defineProperty(request.body, 'currentUser', {
          configurable: true,
          enumerable: true,
          writable: true,
          value: request.user
        });
      } else {
        // For JSON requests
        if (typeof request.body === 'object') {
          Object.defineProperty(request.body, 'currentUser', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: request.user
          });
        }
      }
    }

    return next.handle().pipe(
      map(data => {
        return data;
      }),
    );
  }
}
