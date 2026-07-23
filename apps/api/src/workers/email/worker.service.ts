import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import mjml2html from 'mjml';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { z } from 'zod';

import EmailConfig from '@/config/email.config';

const emailSchema = z.string().email();

type EmailTemplate = {
  render: HandlebarsTemplateDelegate;
  engine: 'html' | 'mjml';
};

type EmailAttachment = {
  contentBase64: string;
  contentType: string;
  filename: string;
};

@Injectable()
export class WorkerEmailService implements OnModuleInit {
  private readonly logger = new Logger(WorkerEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly templateCache = new Map<string, EmailTemplate>();

  constructor(
    @Inject(EmailConfig.KEY)
    private readonly emailConfig: ConfigType<typeof EmailConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.secure,
      auth: {
        user: this.emailConfig.user,
        pass: this.emailConfig.pass,
      },
      ...({ family: 4 } as any), // Force IPv4 to prevent IPv6 timeouts on cloud providers
    });
  }

  async onModuleInit() {
    this.logger.log(
      `Initializing Email Worker with SMTP: ${this.emailConfig.host}:${this.emailConfig.port} (secure: ${this.emailConfig.secure})`,
    );
    // Verify transporter on initialization
    await this.verifyTransporter();
  }

  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter verified successfully');
    } catch (error) {
      this.logger.error(
        `Email transporter verification failed: ${error.message}`,
      );
      throw new Error('Email transporter configuration is invalid');
    }
  }

  private getCompiledTemplate(templateName: string): EmailTemplate {
    if (!this.templateCache.has(templateName)) {
      const sourceMjmlTemplatePath = path.join(
        process.cwd(),
        this.emailConfig.templatesPath,
        `${templateName}.mjml.hbs`,
      );
      let templatePath = sourceMjmlTemplatePath;
      let engine: EmailTemplate['engine'] = 'mjml';

      if (!fs.existsSync(templatePath)) {
        templatePath = path.join(
          process.cwd(),
          this.emailConfig.templatesPath,
          `${templateName}.hbs`,
        );
        engine = 'html';
      }

      if (!fs.existsSync(templatePath)) {
        // Fallback for production where we might be running from dist/workers/email.
        const distMjmlFallbackPath = path.join(
          __dirname,
          '..',
          '..',
          'modules',
          'email',
          'templates',
          `${templateName}.mjml.hbs`,
        );
        if (fs.existsSync(distMjmlFallbackPath)) {
          templatePath = distMjmlFallbackPath;
          engine = 'mjml';
        } else {
          const distHtmlFallbackPath = path.join(
            __dirname,
            '..',
            '..',
            'modules',
            'email',
            'templates',
            `${templateName}.hbs`,
          );
          if (fs.existsSync(distHtmlFallbackPath)) {
            templatePath = distHtmlFallbackPath;
            engine = 'html';
          } else {
            throw new Error(
              `Email template '${templateName}' not found at ${sourceMjmlTemplatePath}, ${templatePath}, ${distMjmlFallbackPath}, or ${distHtmlFallbackPath}`,
            );
          }
        }
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      this.templateCache.set(templateName, {
        render: Handlebars.compile(templateSource),
        engine,
      });
    }
    return this.templateCache.get(templateName)!;
  }

  private async renderTemplate(
    template: EmailTemplate,
    context: Record<string, unknown>,
  ) {
    const output = template.render(context);

    if (template.engine === 'html') {
      return output;
    }

    const result = await mjml2html(output, {
      minify: true,
      validationLevel: 'soft',
    });

    if (result.errors.length > 0) {
      this.logger.warn(
        `MJML rendered with ${result.errors.length} warning(s): ${result.errors
          .map((error) => error.formattedMessage)
          .join(' | ')}`,
      );
    }

    return result.html;
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments: EmailAttachment[] = [],
  ): Promise<void> {
    // Validate email
    emailSchema.parse(to);

    try {
      const result = await this.transporter.sendMail({
        from: this.emailConfig.from,
        to,
        subject,
        text,
        html,
        attachments: attachments.map((attachment) => ({
          content: Buffer.from(attachment.contentBase64, 'base64'),
          contentType: attachment.contentType,
          filename: attachment.filename,
        })),
      });

      this.logger.log(
        `Email sent successfully to ${to} with messageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendTemplatedEmail(
    to: string,
    templateName: string,
    context: Record<string, unknown>,
    options: {
      attachments?: EmailAttachment[];
      subject?: string;
      text?: string;
    } = {},
  ): Promise<void> {
    // Validate email
    emailSchema.parse(to);

    try {
      const template = this.getCompiledTemplate(templateName);
      const renderContext = {
        year: new Date().getFullYear(),
        to,
        ...context,
      };
      const html = await this.renderTemplate(template, renderContext);

      // Generate subject from template or use default
      const subject =
        options.subject ??
        (typeof context.subject === 'string'
          ? context.subject
          : `Message from ${this.emailConfig.from}`);

      await this.sendEmail(
        to,
        subject,
        options.text ?? '',
        html,
        options.attachments,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send templated email to ${to}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    code: string,
    ttl: Date,
  ): Promise<void> {
    await this.sendTemplatedEmail(to, 'verification', {
      code,
      ttl: ttl.toISOString(),
      subject: 'Verify your email',
    });
  }

  async sendForgotPasswordEmail(
    to: string,
    code: string,
    ttl: Date,
  ): Promise<void> {
    await this.sendTemplatedEmail(to, 'forgot-password', {
      code,
      ttl: ttl.toISOString(),
      subject: 'Reset your password',
    });
  }
}
