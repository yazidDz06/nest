import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PurschasesService {
    constructor (private prisma: PrismaService) {}
}
