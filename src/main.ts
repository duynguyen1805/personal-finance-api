import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/logging.interceptor';
import { TransformInterceptor } from './common/transform.interceptor';
import { AllExceptionsFilter } from './common/all-exception.filter';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RmqService } from './modules/rmq/rmq.service';
import { rmqConsumerSetting } from './rmq.consumer';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfigs = app.get(ConfigService);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Init rabbitMQ microservice
  const queueConfigs = rmqConsumerSetting(appConfigs);

  if (queueConfigs?.length) {
    const rmqService = app.get<RmqService>(RmqService);
    await Promise.all(
      queueConfigs.map((config) => {
        app.connectMicroservice<MicroserviceOptions>(
          rmqService.getOptions(config.queueName, false, config.prefetchCount)
        );
      })
    );
  }

  const config = new DocumentBuilder()
    .setTitle('PERSONAL FINANCE API')
    .setDescription('PERSONAL FINANCE API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = 3000;
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`Listening on http://localhost:${port}/api`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
