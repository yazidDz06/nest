import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketIoService } from './ws.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private socketIoService: SocketIoService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    //guard de protection : si utilisateur reconnue, permettre l'accès, sinon refuser
    try {
      this.socketIoService.authenticateClient(client);
      return true;
    } catch (err) {
      console.error('WS Guard error:', err.message);
      throw err;
    }
  }
}