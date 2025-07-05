import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { multiUploadMiddleware } from '../middleware/upload-multi.middleware';

@Injectable()
export class SingleUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return new Observable(observer => {
      uploadMiddleware(request, response, (error) => {
        if (error) {
          observer.error(error);
          return;
        }
        next.handle().subscribe({
          next: (data) => observer.next(data),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
}

@Injectable()
export class MultiUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return new Observable(observer => {
      multiUploadMiddleware(request, response, (error) => {
        if (error) {
          observer.error(error);
          return;
        }
        next.handle().subscribe({
          next: (data) => observer.next(data),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }
} 