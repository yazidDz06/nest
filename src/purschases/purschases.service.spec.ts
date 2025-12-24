import { Test, TestingModule } from '@nestjs/testing';
import { PurschasesService } from './purschases.service';

describe('PurschasesService', () => {
  let service: PurschasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurschasesService],
    }).compile();

    service = module.get<PurschasesService>(PurschasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
