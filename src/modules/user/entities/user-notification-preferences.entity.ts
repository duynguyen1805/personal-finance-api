import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity()
export class UserNotificationPreferences {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ default: true })
  email: boolean;

  @Column({ default: false })
  push: boolean;

  @Column({ default: true })
  budgetAlerts: boolean;

  @Column({ default: true })
  goalReminders: boolean;

  @Column({ default: true })
  expenseAlerts: boolean;

  @Column({ default: true })
  incomeAlerts: boolean;

  @Column({ default: true })
  weeklyReports: boolean;

  @Column({ default: true })
  monthlyReports: boolean;

  @Column({ default: true })
  achievementCelebrations: boolean;

  @Column({ default: true })
  systemUpdates: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
