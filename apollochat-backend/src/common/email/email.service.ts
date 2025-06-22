import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    // Create a transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.example.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: this.configService.get<boolean>('SMTP_SECURE') || false,
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'user@example.com',
        pass: this.configService.get<string>('SMTP_PASSWORD') || 'password',
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.logger.log(
        'Email service in development mode - emails will be logged',
      );
      return;
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error occurred';
      this.logger.error(`SMTP connection failed: ${errorMessage}`);
    }
  }

  /**
   * Send an email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - HTML content of the email
   * @returns Promise resolving to success status
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // // In development, just log the email
      // if (this.configService.get('NODE_ENV') !== 'production') {
      //   this.logger.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
      //   this.logger.log(`[DEV EMAIL] Content: ${html}`);
      //   return true;
      // }

      // In production, actually send the email
      const info = (await this.transporter.sendMail({
        from:
          this.configService.get<string>('EMAIL_FROM') ||
          'Apollo Chat <noreply@apollochat.com>',
        to,
        subject,
        html,
      })) as { messageId?: string };

      this.logger.log(`Email sent to ${to}: ${info.messageId || 'unknown'}`);
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error occurred';
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send an OTP verification email
   * @param to - Recipient email address
   * @param otp - The OTP code
   * @returns Promise resolving to success status
   */
  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    const subject = 'Your Apollo Chat Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Apollo Chat Verification</h2>
        <p>Hello,</p>
        <p>Your verification code for Apollo Chat is:</p>
        <div style="background-color: #edf2f7; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2d3748; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Thank you,<br>The Apollo Chat Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send a password reset email with OTP
   * @param to - Recipient email address
   * @param otp - The OTP code
   * @returns Promise resolving to success status
   */
  async sendPasswordResetEmail(to: string, otp: string): Promise<boolean> {
    const subject = 'Apollo Chat Password Reset';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Apollo Chat Password Reset</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. To proceed, use the verification code below:</p>
        <div style="background-color: #edf2f7; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2d3748; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Thank you,<br>The Apollo Chat Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send a welcome email
   * @param to - Recipient email address
   * @param username - User's username
   * @returns Promise resolving to success status
   */
  async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const subject = 'Welcome to Apollo Chat!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Welcome to Apollo Chat!</h2>
        <p>Hello ${username},</p>
        <p>Thank you for joining Apollo Chat! We're excited to have you as part of our community.</p>
        <p>With Apollo Chat, you can:</p>
        <ul>
          <li>Connect with friends and colleagues</li>
          <li>Create public and private chat rooms</li>
          <li>Share messages in real-time</li>
          <li>Customize your profile and status</li>
        </ul>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        <p>Happy chatting!</p>
        <p>Best regards,<br>The Apollo Chat Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}
