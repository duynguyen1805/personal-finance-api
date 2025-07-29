import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { FinancialGoalsService } from '../financial-goals/financial-goals.service';
import { NotificationType } from './entities/notification.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly financialGoalsService: FinancialGoalsService,
    private readonly userService: UserService
  ) {}

  /**
   * Check for upcoming financial goals deadlines and send notifications
   * Runs every day at 9:00 AM
   */
  @Cron('0 9 * * *')
  async checkFinancialGoalsDeadlines() {
    this.logger.log('Checking financial goals deadlines...');
    
    try {
      // Get all users (simplified - in production, you'd want to batch this)
      const usersResult = await this.userService.findAll({ isGetAll: true });
      const users = usersResult.data;
      
      for (const user of users) {
        await this.checkUserFinancialGoals(user.id);
      }
      
      this.logger.log('Financial goals deadline check completed');
    } catch (error) {
      this.logger.error(`Error checking financial goals deadlines: ${error.message}`);
    }
  }

  /**
   * Send reminder notifications for goals due in 7 days
   * Runs every day at 10:00 AM
   */
  @Cron('0 10 * * *')
  async sendWeeklyReminders() {
    this.logger.log('Sending weekly financial goals reminders...');
    
    try {
      const usersResult = await this.userService.findAll({ isGetAll: true });
      const users = usersResult.data;
      
      for (const user of users) {
        await this.sendWeeklyRemindersForUser(user.id);
      }
      
      this.logger.log('Weekly reminders sent successfully');
    } catch (error) {
      this.logger.error(`Error sending weekly reminders: ${error.message}`);
    }
  }

  /**
   * Send urgent notifications for goals due in 1 day
   * Runs every day at 2:00 PM
   */
  @Cron('0 14 * * *')
  async sendUrgentReminders() {
    this.logger.log('Sending urgent financial goals reminders...');
    
    try {
      const usersResult = await this.userService.findAll({ isGetAll: true });
      const users = usersResult.data;
      
      for (const user of users) {
        await this.sendUrgentRemindersForUser(user.id);
      }
      
      this.logger.log('Urgent reminders sent successfully');
    } catch (error) {
      this.logger.error(`Error sending urgent reminders: ${error.message}`);
    }
  }

  private async checkUserFinancialGoals(userId: number) {
    try {
      // Get goals due in the next 30 days
      const upcomingGoals = await this.financialGoalsService.getUpcomingDeadlines(userId, 30);
      
      for (const goal of upcomingGoals) {
        const daysUntilDeadline = this.calculateDaysUntilDeadline(goal.deadline);
        
        // Send different types of notifications based on urgency
        if (daysUntilDeadline <= 1) {
          await this.sendUrgentNotification(userId, goal);
        } else if (daysUntilDeadline <= 7) {
          await this.sendWeeklyNotification(userId, goal);
        } else if (daysUntilDeadline <= 14) {
          await this.sendMonthlyNotification(userId, goal);
        }
      }
    } catch (error) {
      this.logger.error(`Error checking financial goals for user ${userId}: ${error.message}`);
    }
  }

  private async sendWeeklyRemindersForUser(userId: number) {
    try {
      const upcomingGoals = await this.financialGoalsService.getUpcomingDeadlines(userId, 7);
      
      if (upcomingGoals.length > 0) {
        await this.sendWeeklySummaryNotification(userId, upcomingGoals);
      }
    } catch (error) {
      this.logger.error(`Error sending weekly reminders for user ${userId}: ${error.message}`);
    }
  }

  private async sendUrgentRemindersForUser(userId: number) {
    try {
      const urgentGoals = await this.financialGoalsService.getUpcomingDeadlines(userId, 1);
      
      for (const goal of urgentGoals) {
        await this.sendUrgentNotification(userId, goal);
      }
    } catch (error) {
      this.logger.error(`Error sending urgent reminders for user ${userId}: ${error.message}`);
    }
  }

  private async sendUrgentNotification(userId: number, goal: any) {
    // Check if user wants goal reminders
    const shouldSend = await this.userService.shouldSendNotification(userId, 'goalReminders');
    if (!shouldSend) {
      this.logger.log(`Skipping urgent notification for user ${userId} - goal reminders disabled`);
      return;
    }

    const notification = await this.notificationsService.createNotification({
      userId,
      title: '🚨 Mục tiêu tài chính sắp đến hạn!',
      message: `Mục tiêu "${goal.goalName}" sẽ đến hạn vào ngày ${this.formatDate(goal.deadline)}. Hãy kiểm tra tiến độ của bạn!`,
      type: NotificationType.EMAIL,
      relatedEntityId: goal.goalId,
      relatedEntityType: 'financial_goal',
      metadata: {
        goalName: goal.goalName,
        deadline: goal.deadline,
        targetAmount: goal.targetAmount
      }
    });

    await this.notificationsService.sendNotification(notification);
  }

  private async sendWeeklyNotification(userId: number, goal: any) {
    // Check if user wants goal reminders
    const shouldSend = await this.userService.shouldSendNotification(userId, 'goalReminders');
    if (!shouldSend) {
      this.logger.log(`Skipping weekly notification for user ${userId} - goal reminders disabled`);
      return;
    }

    const daysUntilDeadline = this.calculateDaysUntilDeadline(goal.deadline);
    
    const notification = await this.notificationsService.createNotification({
      userId,
      title: '📅 Nhắc nhở mục tiêu tài chính',
      message: `Mục tiêu "${goal.goalName}" sẽ đến hạn trong ${daysUntilDeadline} ngày. Hãy kiểm tra tiến độ của bạn!`,
      type: NotificationType.IN_APP,
      relatedEntityId: goal.goalId,
      relatedEntityType: 'financial_goal',
      metadata: {
        goalName: goal.goalName,
        deadline: goal.deadline,
        daysUntilDeadline
      }
    });

    await this.notificationsService.sendNotification(notification);
  }

  private async sendMonthlyNotification(userId: number, goal: any) {
    // Check if user wants goal reminders
    const shouldSend = await this.userService.shouldSendNotification(userId, 'goalReminders');
    if (!shouldSend) {
      this.logger.log(`Skipping monthly notification for user ${userId} - goal reminders disabled`);
      return;
    }

    const notification = await this.notificationsService.createNotification({
      userId,
      title: '📊 Cập nhật mục tiêu tài chính',
      message: `Mục tiêu "${goal.goalName}" sẽ đến hạn vào ${this.formatDate(goal.deadline)}. Hãy đảm bảo bạn đang theo đúng kế hoạch!`,
      type: NotificationType.IN_APP,
      relatedEntityId: goal.goalId,
      relatedEntityType: 'financial_goal',
      metadata: {
        goalName: goal.goalName,
        deadline: goal.deadline
      }
    });

    await this.notificationsService.sendNotification(notification);
  }

  private async sendWeeklySummaryNotification(userId: number, goals: any[]) {
    // Check if user wants goal reminders
    const shouldSend = await this.userService.shouldSendNotification(userId, 'goalReminders');
    if (!shouldSend) {
      this.logger.log(`Skipping weekly summary for user ${userId} - goal reminders disabled`);
      return;
    }

    const notification = await this.notificationsService.createNotification({
      userId,
      title: '📋 Tóm tắt mục tiêu tuần này',
      message: `Bạn có ${goals.length} mục tiêu tài chính sắp đến hạn trong tuần này. Hãy kiểm tra và cập nhật tiến độ!`,
      type: NotificationType.EMAIL,
      metadata: {
        goalsCount: goals.length,
        goals: goals.map(g => ({ name: g.goalName, deadline: g.deadline }))
      }
    });

    await this.notificationsService.sendNotification(notification);
  }

  private calculateDaysUntilDeadline(deadline: Date): number {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 