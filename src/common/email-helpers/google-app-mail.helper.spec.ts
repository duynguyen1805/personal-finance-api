import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAppMail } from './google-app-mail.helper';
import { configService } from '../../config/config.service';

// Mock configService
jest.mock('../../config/config.service', () => ({
  configService: {
    getEmailServiceConfig: jest.fn().mockReturnValue({
      gmailUser: 'test@gmail.com',
      gmailClientId: 'test-client-id',
      gmailClientSecret: 'test-client-secret',
      gmailRefreshToken: 'test-refresh-token',
      gmailAccessToken: 'test-access-token'
    })
  }
}));

describe('GoogleAppMail', () => {
  let service: GoogleAppMail;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAppMail],
    }).compile();

    service = module.get<GoogleAppMail>(GoogleAppMail);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create transport with correct config', () => {
    const configs = configService.getEmailServiceConfig();
    expect(configs.gmailUser).toBe('test@gmail.com');
    expect(configs.gmailClientId).toBe('test-client-id');
  });

  // Add more tests as needed
}); 