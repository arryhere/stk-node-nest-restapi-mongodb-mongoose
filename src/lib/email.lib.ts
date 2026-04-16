import { HttpStatus, Injectable, Module } from '@nestjs/common';
import nodemailer from 'nodemailer';

import { appConfig } from '../config/appConfig.js';
import { AppException } from '../exception/appException.exception.js';

@Injectable()
export class EmailLibService {
  async sendEmail(subject: string, html: string, to_email: string): Promise<void> {
    try {
      const mail_transport = nodemailer.createTransport({
        host: appConfig.smtp.SMTP_HOST,
        port: appConfig.smtp.SMTP_PORT,
        auth: { user: appConfig.smtp.SMTP_USER, pass: appConfig.smtp.SMTP_PASSWORD },
      });

      const res = await mail_transport.sendMail({
        from: `stk-node-nest-restapi-mongodb-mongoose <${appConfig.email.EMAIL_FROM}>`,
        to: to_email,
        replyTo: appConfig.email.EMAIL_FROM,
        subject: subject,
        html: html,
      });

      const { accepted, envelope, messageId, response } = res;

      console.log('[EmailService] - sendEmail - log:', { accepted, envelope, messageId, response });
    } catch (error: unknown) {
      console.error('[EmailService] - sendEmail - error:', error);
      throw new AppException({ message: 'Fail to send email', error: error }, HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
        description: '[EmailService] - sendEmail - error',
      });
    }
  }
}

@Module({
  imports: [],
  controllers: [],
  providers: [EmailLibService],
  exports: [EmailLibService],
})
export class EmailLibModule {}
