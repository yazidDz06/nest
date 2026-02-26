import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway} from './chat.gateway';
import { AuthenticationModule } from 'src/auth/auth.module';
import { WsJwtGuard } from './ws.guard';
import { SocketIoService } from './ws.service';
import { JwtModule } from '@nestjs/jwt';


@Module({
  providers: [ChatGateway, ChatService, WsJwtGuard, SocketIoService],
 imports: [AuthenticationModule,JwtModule],
 exports: [SocketIoService,WsJwtGuard]
})
export class ChatModule {}
