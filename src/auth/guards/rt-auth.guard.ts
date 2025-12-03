import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//  Le nom "jwt-refresh" doit être EXACTEMENT le même que celui donné dans RefreshStrategy
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    // Appelle le constructor d’AuthGuard
    super();
  }
}
