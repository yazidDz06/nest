import { Controller, Get, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { PurchasesService } from './purschases.service';
import { GetCurrentUser } from 'src/auth/decorators/getCurrentUser.decorator';


@Controller('achats')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  
  @Get('mes-achats')
  @UseGuards(AccessTokenGuard)
  async getMyPurchases(@GetCurrentUser() user: any) {
    return this.purchasesService.findByUser(user.userId);
  }
}