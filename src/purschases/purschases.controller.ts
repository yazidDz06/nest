import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchasesService } from './purschases.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';


@Controller('achats')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  
  @Get('mes-achats')
  @UseGuards(JwtAuthGuard)
  async getMyPurchases(@GetUser() user: any) {
    return this.purchasesService.findByUser(user.userId);
  }
}