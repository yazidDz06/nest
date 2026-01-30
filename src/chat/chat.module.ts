import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway} from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { WsJwtGuard } from './ws.guard';
import { SocketIoService } from './ws.service';


@Module({
  providers: [ChatGateway, ChatService, WsJwtGuard, SocketIoService],
 imports: [AuthModule],
 exports: [SocketIoService,WsJwtGuard]
})
export class ChatModule {}
