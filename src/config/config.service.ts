/* eslint-disable comma-dangle */
// src/config/config.service.ts
const path = require('path');

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public getEnv(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getEnv(k, true));
    return this;
  }

  public getPort() {
    return this.getEnv('PORT', true);
  }

  public isProduction() {
    const mode = this.getEnv('MODE', false);
    return mode != 'DEV';
  }

  public getRedisConfig() {
    return {
      host: this.getEnv('REDIS_HOST'),
      port: parseInt(this.getEnv('REDIS_PORT'))
    };
  }

  public getPostgresConfig() {
    return {
      host: this.getEnv('DB_HOST'),
      port: parseInt(this.getEnv('DB_PORT')),
      username: this.getEnv('DB_USERNAME'),
      password: this.getEnv('DB_PASSWORD'),
      database: this.getEnv('DB_DATABASE')
    };
  }

  public getTypeOrmConfig() {
    return {
      type: 'postgres',

      host: this.getEnv('DB_HOST'),
      port: parseInt(this.getEnv('DB_PORT')),
      username: this.getEnv('DB_USERNAME'),
      password: this.getEnv('DB_PASSWORD'),
      database: this.getEnv('DB_DATABASE'),
      entities: ['dist/src/**/*.entity{.ts,.js}'],
      migrations: ['dist/src/migration/**/*{.js,.ts}'],
      migrationsTableName: 'migration',
      migrationsRun: false,
      seeds: ['dist/src/database/seeds/**/*.seed{.js,.ts}'],
      cli: {
        migrationsDir: 'src/migration'
      },
      logging: this.getEnv('LOGGING', false)
      // synchronize: true

      //   ssl: this.isProduction(),
    };
  }

  public getMinIOConfig() {
    return {
      STORAGE_LOCAL_ENDPOINT: this.getEnv('STORAGE_LOCAL_ENDPOINT'),
      MINIO_UPLOAD_LOCAL_PORT: this.getEnv('MINIO_UPLOAD_LOCAL_PORT'),
      USE_SSL: this.getEnv('USE_SSL'),
      STORAGE_ENDPOINT: this.getEnv('STORAGE_ENDPOINT'),
      MINIO_UPLOAD_PORT: this.getEnv('MINIO_UPLOAD_PORT'),
      MINIO_UPLOAD_ACCESS_KEY: this.getEnv('MINIO_UPLOAD_ACCESS_KEY'),
      MINIO_UPLOAD_SECRET_KEY: this.getEnv('MINIO_UPLOAD_SECRET_KEY'),
      MINIO_UPLOAD_BUCKET_NAME: this.getEnv('MINIO_UPLOAD_BUCKET_NAME')
    };
  }

  public getEmailServiceConfig() {
    return {
      isSendEmail: this.getEnv('IS_SEND_EMAIL').toLowerCase() === 'true',
      senderName: this.getEnv('SENDER_NAME'),
      emailProvider: this.getEnv('EMAIL_PROVIDER'),
      sendGridApiKey: this.getEnv('SENDGRID_API_KEY'),
      smtpHost: this.getEnv('SMTP_HOST'),
      smtpPort: this.getEnv('SMTP_PORT'),
      smtpUser: this.getEnv('SMTP_USER'),
      smtpPassword: this.getEnv('SMTP_PASSWORD')
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'REDIS_HOST',
  'REDIS_PORT',
  // Email service configs
  'IS_SEND_EMAIL',
  'SENDER_NAME',
  'EMAIL_PROVIDER',
  'SENDGRID_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD'
]);

export { configService };
