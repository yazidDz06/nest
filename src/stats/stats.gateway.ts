import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketIoService } from '../chat/ws.service';
import { StatsService } from './stats.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class StatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private logger = new Logger('StatsGateway');
  private statsInterval: NodeJS.Timeout;

  constructor(
    private readonly socketIoService: SocketIoService,
    private readonly statsService: StatsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Stats Gateway initialized');

    // Envoyer les stats automatiquement toutes les 5 secondes
    this.statsInterval = setInterval(async () => {
      await this.sendStats();
    }, 5000);
  }

  // L'admin se connecte au dashboard
  handleConnection(client: Socket) {
    try {
      const user = this.socketIoService.authenticateClient(client);
      this.logger.log(`${user.email} connecté au dashboard`);

      // Envoyer les stats immédiatement
      this.sendStats();
    } catch (err) {
      this.logger.error(' Connexion refusée:', err.message);
      client.disconnect();
    }
  }

  // Envoyer les stats à tous les clients connectés
  private async sendStats() {
    try {
      const stats = await this.statsService.getStats();
      this.server.emit('statsUpdate', stats);
    } catch (error) {
      this.logger.error('Erreur envoi stats:', error);
      this.server.emit('statsError', {
        message: 'Erreur lors de la récupération des statistiques',
      });
    }
  }

  // L'admin demande un refresh manuel
  @SubscribeMessage('requestStats')
  async handleStatsRequest(@ConnectedSocket() client: Socket) {
    this.logger.log('Refresh manuel des stats');
    await this.sendStats();
  }

  // L'admin se déconnecte
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`${user.email} déconnecté du dashboard`);
    }
  }

  // Nettoyer l'interval lors de la destruction
  onModuleDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.logger.log('Stats interval cleared');
    }
  }
}