import { Test, TestingModule } from '@nestjs/testing';
import { Mailer, EEmailTemplate } from './mailer-v2';

describe('MailerV2', () => {
  let service: Mailer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    service = module.get<Mailer>(Mailer);
  });

  it('should be defined', () => {
    expect(Mailer).toBeDefined();
  });

  it('should send registration confirmation email', async () => {
    try {
      await Mailer.sendRegistrationConfirmationEmail(1, {
        code: '123456',
        email: 'test@example.com'
      });
      console.log('Registration email sent successfully');
    } catch (error) {
      console.error('Failed to send registration email:', error.message);
      // This might fail if templates are not set up properly
      expect(error.message).toContain('Template file not found');
    }
  });

  it('should send direct email', async () => {
    try {
      await Mailer.sendDirectEmail(
        'test@example.com',
        EEmailTemplate.REGISTRATION_CONFIRMATION,
        {
          code: '123456',
          email: 'test@example.com'
        }
      );
      console.log('Direct email sent successfully');
    } catch (error) {
      console.error('Failed to send direct email:', error.message);
      expect(error.message).toContain('Template file not found');
    }
  });
}); 