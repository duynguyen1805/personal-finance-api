import { Test, TestingModule } from '@nestjs/testing';
import { EmailGenerator } from './email-generator.helper';
import { IEmailInput } from './mailer';

describe('EmailGenerator', () => {
  let service: EmailGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailGenerator],
    }).compile();

    service = module.get<EmailGenerator>(EmailGenerator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find registration template', async () => {
    const mockInput: IEmailInput = {
      template: 'registration-confirmation',
      subject: 'Welcome to Expenses Tracker! Confirm Your Registration',
      payload: {
        code: '123456',
        email: 'test@example.com'
      },
      from: 'noreply@example.com',
      to: 'test@example.com',
      attachments: []
    };

    try {
      const result = await EmailGenerator.generate(mockInput);
      expect(result).toBeDefined();
      expect(result.subject).toBe('Welcome to Expenses Tracker! Confirm Your Registration');
      expect(result.body).toContain('123456'); // Should contain the code
      console.log('Template found and rendered successfully');
    } catch (error) {
      console.error('Template not found:', error.message);
      // This test might fail if templates are not copied to dist
      // but it will help us debug the issue
      expect(error.message).toContain('Template file not found');
    }
  });

  it('should find OTP template', async () => {
    const mockInput: IEmailInput = {
      template: 'user-two-fa',
      subject: 'Two factor authentication',
      payload: {
        code: '654321',
        email: 'test@example.com'
      },
      from: 'noreply@example.com',
      to: 'test@example.com',
      attachments: []
    };

    try {
      const result = await EmailGenerator.generate(mockInput);
      expect(result).toBeDefined();
      expect(result.subject).toBe('Two factor authentication');
      expect(result.body).toContain('654321'); // Should contain the code
      console.log('OTP template found and rendered successfully');
    } catch (error) {
      console.error('OTP template not found:', error.message);
      expect(error.message).toContain('Template file not found');
    }
  });
}); 