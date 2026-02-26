import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketIoService } from './ws.service';
import { WsJwtGuard } from './ws.guard';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() 
  private server: Server;//initialiser un serveur ws

  constructor(private readonly socketIoService: SocketIoService) {}

  // L'utilisateur se connecte
  handleConnection(client: Socket) {
    try {
      //identifier user connecté
      const user = this.socketIoService.authenticateClient(client);
      console.log(` ${user.email} vient de se connecter`);
      
      // Notifier tout le monde
      this.server.emit('userJoined', {
        userId: user.id,
        email: user.email,
      });
    } catch (err) {
      console.log(' Connexion refusée:', err.message);
      client.disconnect();
    }
  }

  //  L'utilisateur envoie un message
  @UseGuards(WsJwtGuard)//uniqument users connectés
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket
  ) {
    const user = client.data.user;
    console.log(` Message de ${user.email}: ${data.text}`);
    
    // Diffuser à tous les clients
    this.server.emit('newMessage', {
      userId: user.id,
      email: user.email,
      text: data.text,
      timestamp: new Date(),
    });
  }

  //  L'utilisateur tape
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    // Notifier les autres 
    client.broadcast.emit('userTyping', {
      userId: user.id,
      email: user.email,
    });
  }

  //  Envoyer une notification
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendNotification')
  handleNotification(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: Socket
  ) {
    const user = client.data.user;
    
    this.server.emit('notification', {
      from: user.email,
      message: data.message,
      timestamp: new Date(),
    });
  }

  //  : L'utilisateur se déconnecte
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      console.log(` ${user.email} s'est déconnecté`);
      
      this.server.emit('userLeft', {
        userId: user.id,
        email: user.email,
      });
    }
  }
}