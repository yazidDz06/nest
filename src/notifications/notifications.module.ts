import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { WsJwtGuard } from './ws.guard';


@Module({
  providers: [NotificationsGateway, NotificationsService, WsJwtGuard],
 imports: [AuthModule]
})
export class NotificationsModule {}
