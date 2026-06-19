import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import {
  buildCourseBookingEmailTemplate,
  buildRegistrationEmailTemplate,
  buildMentorBookingNotificationEmailTemplate,
  MentorBookingEmailInput,
} from '../templates/mail.templates';

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type RegistrationMailInput = {
  to: string;
  recipientName: string;
};

type CourseBookingMailInput = {
  to: string;
  recipientName: string;
  courseTitle: string;
  mentorName?: string | null;
  meetingTimeLabel: string;
  status: 'pending' | 'confirmed';
};

type MentorBookingMailInput = {
  to: string;
  recipientName: string;
  menteeName: string;
  courseTitle: string;
  meetingTimeLabel: string;
  status: 'pending' | 'confirmed';
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly enabled: boolean;
  private readonly transporter: Transporter | null;
  private readonly fromName: string;
  private readonly fromEmail: string;
  private readonly replyTo?: string;
  private readonly frontendBaseUrl: string;
  private readonly publicAssetBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('mail.enabled') ?? false;
    this.fromName = this.configService.get<string>('mail.fromName') || 'HocTuThien';
    this.fromEmail = this.configService.get<string>('mail.fromEmail') || '';
    this.replyTo = this.configService.get<string>('mail.replyTo') || undefined;
    this.frontendBaseUrl = this.trimTrailingSlash(
      this.configService.get<string>('mail.frontendBaseUrl') || '',
    );
    this.publicAssetBaseUrl = this.trimTrailingSlash(
      this.configService.get<string>('mail.publicAssetBaseUrl') ||
        this.frontendBaseUrl,
    );

    if (!this.enabled) {
      this.transporter = null;
      this.logger.log('Mail service is disabled. Email delivery will be skipped.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port') || 587,
      secure: this.configService.get<boolean>('mail.secure') || false,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async sendRegistrationEmail(input: RegistrationMailInput) {
    const template = buildRegistrationEmailTemplate({
      recipientName: input.recipientName,
      frontendBaseUrl: this.frontendBaseUrl,
      logoUrl: this.getLogoUrl(),
    });

    await this.sendMail({
      to: input.to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendCourseBookingEmail(input: CourseBookingMailInput) {
    const template = buildCourseBookingEmailTemplate({
      recipientName: input.recipientName,
      courseTitle: input.courseTitle,
      mentorName: input.mentorName,
      meetingTimeLabel: input.meetingTimeLabel,
      status: input.status,
      frontendBaseUrl: this.frontendBaseUrl,
      logoUrl: this.getLogoUrl(),
    });

    await this.sendMail({
      to: input.to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendMentorBookingNotificationEmail(input: MentorBookingMailInput) {
    const template = buildMentorBookingNotificationEmailTemplate({
      recipientName: input.recipientName,
      menteeName: input.menteeName,
      courseTitle: input.courseTitle,
      meetingTimeLabel: input.meetingTimeLabel,
      status: input.status,
      frontendBaseUrl: this.frontendBaseUrl,
      logoUrl: this.getLogoUrl(),
    });

    await this.sendMail({
      to: input.to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  async sendMail(input: SendMailInput) {
    if (!this.enabled || !this.transporter) {
      this.logger.debug(`Skipped email "${input.subject}" to ${input.to} because mail is disabled.`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.formatFromAddress(),
        to: input.to,
        replyTo: this.replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      this.logger.log(`Sent email "${input.subject}" to ${input.to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send email "${input.subject}" to ${input.to}: ${error?.message || error}`,
      );
      throw error;
    }
  }

  private formatFromAddress() {
    return this.fromName ? `${this.fromName} <${this.fromEmail}>` : this.fromEmail;
  }

  private getLogoUrl() {
    if (!this.publicAssetBaseUrl) {
      return null;
    }

    return `${this.publicAssetBaseUrl}/images/logo.png`;
  }

  private trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
  }
}
