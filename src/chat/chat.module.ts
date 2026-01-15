import { Module } from '@nestjs/common';
import { NotificationsService } from './chat.service';
import { ChatGateway} from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { WsJwtGuard } from './ws.guard';
import { SocketIoService } from './ws.service';


@Module({
  providers: [ChatGateway, NotificationsService, WsJwtGuard, SocketIoService],
 imports: [AuthModule]
})
export class NotificationsModule {}
