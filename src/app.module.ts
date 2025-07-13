import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  RequestMethod
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { configService } from './config/config.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { CustomeCacheModule } from './modules/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './modules/upload/upload.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { ScheduleModule } from '@nestjs/schedule';
import settings from '../ormconfig.json';
import { RmqModule } from './modules/rmq/rmq.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { EServiceType } from './common/enums/service-type.enum';
import { compact } from 'lodash';
import { BlacklistMiddleware } from './common/middleware/blacklist-token.middleware';
import { FileModule } from './modules/file/file.module';
import { UploadMinIOModule } from './modules/upload-minio/upload-minio.module';
import { UploadFirebaseModule } from './modules/upload-firebase/upload-firebase.module';
import { IncomeModule } from './modules/income/income.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { RecurringTransactionModule } from './modules/recurring-transaction/recurring-transaction.module';
import { BudgetsModule } from './modules/budgets/budget.module';

const { host, port } = configService.getRedisConfig();

@Module({
  imports: compact([
    ConfigModule.forRoot({ isGlobal: true }),
    configService.getEnv('SERVICE_TYPE') === EServiceType.MAIN_SERVICE
      ? ScheduleModule.forRoot()
      : null,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files')
    }),
    MulterModule.register({
      dest: '../files'
    }),
    TypeOrmModule.forRoot(settings),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      url: `redis://${host}:${port}`,
      ttl: 0
    }),
    UserModule,
    AffiliateModule,
    AuthModule,
    RoleModule,
    UploadModule,
    CustomeCacheModule,
    RmqModule,
    TransactionsModule,
    IncomeModule,
    BudgetsModule,
    UploadMinIOModule,
    UploadFirebaseModule,
    FileModule,
    CategoriesModule,
    ExpensesModule,
    RecurringTransactionModule
  ]),
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    }
  ]
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(BlacklistMiddleware)
  //     .forRoutes({ path: '*', method: RequestMethod.ALL }); // Áp dụng cho tất cả route
  //   // Hoặc chỉ áp dụng cho một số route:
  //   // .forRoutes('user', 'transactions')
  // }
}
