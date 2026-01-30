import { Injectable } from '@nestjs/common';
import { MailerService as MailService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailService) {}
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject,
        html: body,
      });
      return;
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }
}
