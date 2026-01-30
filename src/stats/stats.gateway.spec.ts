import { Test, TestingModule } from '@nestjs/testing';
import { StatsGateway } from './stats.gateway';
import { StatsService } from './stats.service';

describe('StatsGateway', () => {
  let gateway: StatsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsGateway, StatsService],
    }).compile();

    gateway = module.get<StatsGateway>(StatsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
