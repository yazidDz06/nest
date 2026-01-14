import { UseGuards } from '@nestjs/common';
import { WebSocketGateway,WebSocketServer,OnGatewayConnection,OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './ws.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  origin: 'http://localhost:5500',//frontend
  credentials: true,
})
@UseGuards(WsJwtGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  //créer une instance de server ws
  @WebSocketServer() 
  private server: Server;
//utiliser jwtService pour extraire facilement l'utilisateur connecté sans réécrire toute la logique
 constructor(private readonly jwtService: JwtService) {}
 handleConnection(client: Socket) {
  // Lire cookie depuis handshake
  const cookieHeader = client.handshake.headers.cookie;
  //autoriser la connexion uniquement si un cookie est la
  if (!cookieHeader) {
    console.log('Connexion refusée : pas de cookie');
    client.disconnect();
    return;
  }
  //extraire le cookie 
  const token = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('access_token='))
    ?.split('=')[1];
  //si y'a pas , on autorise pas
  if (!token) {
    console.log('Connexion refusée : pas de token');
    client.disconnect();
    return;
  }
  //vérifier le token depuis payload
  try {
    const payload = this.jwtService.verify(token);
    client.data.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    console.log('Nouvel utilisateur connecté:', client.data.user.id);

    // notification à tous
    this.server.emit('notification', {
      type: 'USER_CONNECTED',
      clientId: client.id,
      userId: client.data.user.id,
    });
  } catch (err) {
    console.log('Connexion refusée : token invalide');
    client.disconnect();
  }
}


  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);

    this.server.emit('notification', {
      type: 'USER_DISCONNECTED',
      clientId: client.id,
    });
  }
}

