import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  Notifications,
  NotificationType,
  NotificationStatus
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Mailer } from '../../common/email-helpers/mailer-v2';
import { EEmailTemplate } from '../../common/email-helpers/mailer-v2';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepository: Repository<Notifications>
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notifications> {
    const notification = this.notificationRepository.create(dto);
    return await this.notificationRepository.save(notification);
  }

  async sendNotification(notification: Notifications): Promise<boolean> {
    try {
      switch (notification.type) {
        case NotificationType.EMAIL:
          return await this.sendEmailNotification(notification);
        case NotificationType.PUSH:
          return await this.sendPushNotification(notification);
        case NotificationType.IN_APP:
          return await this.sendInAppNotification(notification);
        default:
          this.logger.warn(`Unknown notification type: ${notification.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      await this.updateNotificationStatus(
        notification.notificationId,
        NotificationStatus.FAILED
      );
      return false;
    }
  }

  private async sendEmailNotification(
    notification: Notifications
  ): Promise<boolean> {
    try {
      // Get user email from metadata or use default
      const userEmail = notification.metadata?.email || 'user@example.com';

      // Use financial goal reminder template if available, otherwise fallback to registration template
      const template = notification.metadata?.goalName
        ? EEmailTemplate.FINANCIAL_GOAL_REMINDER
        : EEmailTemplate.REGISTRATION_CONFIRMATION;

      await Mailer.sendDirectEmail(userEmail, template, {
        title: notification.title,
        message: notification.message,
        goalName: notification.metadata?.goalName || 'Mục tiêu tài chính',
        deadline: notification.metadata?.deadline
          ? new Date(notification.metadata.deadline).toLocaleDateString('vi-VN')
          : 'Chưa xác định',
        targetAmount: notification.metadata?.targetAmount || 0,
        daysUntilDeadline: notification.metadata?.daysUntilDeadline || 0,
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
      });

      await this.updateNotificationStatus(
        notification.notificationId,
        NotificationStatus.SENT
      );
      this.logger.log(
        `Email notification sent successfully to user ${notification.userId}`
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      return false;
    }
  }

  private async sendPushNotification(
    notification: Notifications
  ): Promise<boolean> {
    try {
      // TODO: Implement Firebase Cloud Messaging
      // For now, just log the notification
      this.logger.log(
        `Push notification would be sent: ${notification.title} - ${notification.message}`
      );

      await this.updateNotificationStatus(
        notification.notificationId,
        NotificationStatus.SENT
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  private async sendInAppNotification(
    notification: Notifications
  ): Promise<boolean> {
    try {
      // In-app notifications are already stored in database
      // Just mark as sent
      await this.updateNotificationStatus(
        notification.notificationId,
        NotificationStatus.SENT
      );
      this.logger.log(
        `In-app notification created for user ${notification.userId}`
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to create in-app notification: ${error.message}`
      );
      return false;
    }
  }

  private async updateNotificationStatus(
    notificationId: number,
    status: NotificationStatus
  ): Promise<void> {
    const updateData: any = { status };
    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    }

    await this.notificationRepository.update(notificationId, updateData);
  }

  async getUserNotifications(
    userId: number,
    limit: number = 50
  ): Promise<Notifications[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async markAsRead(
    notificationId: number,
    userId: number
  ): Promise<UpdateResult> {
    return await this.notificationRepository.update(
      { notificationId, userId },
      {
        status: NotificationStatus.READ,
        readAt: new Date()
      }
    );
  }

  async getUnreadCount(userId: number): Promise<number> {
    const count = await this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.SENT
      }
    });
    console.log('count', count);

    return count;
  }

  async deleteNotification(
    notificationId: number,
    userId: number
  ): Promise<DeleteResult> {
    return await this.notificationRepository.delete({ notificationId, userId });
  }

  async getScheduledNotifications(): Promise<Notifications[]> {
    const now = new Date();
    return await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: LessThanOrEqual(now)
      }
    });
  }
}
