
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
//rxjs posséde sa propre documentation, possede plusieurs méthodes pour gestion de streaming asynchrones
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  //executionContext pour lire contexte de req ou res ou ..
  //next donne reference au callhandler qui retourne un observable depuis route handler
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    const now = Date.now();
    return next
      .handle().pipe( tap(() => console.log(`After... ${Date.now() - now}ms`)) );
  }
}
  //interceptor pour logger temps de reponse d'une route