import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    try {
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) throw new UnauthorizedException('No cookie');

      // Extraire le cookie "access_token"
      const token = cookieHeader
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('access_token='))
        ?.split('=')[1];

      if (!token) throw new UnauthorizedException('No token');

      // Vérifier et décoder le JWT
      const payload = this.jwtService.verify(token);

      // Stocker le payload dans client.data.user pour que le gateway l'utilise
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (err) {
      console.error('WS Guard error:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
