import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { CustomeCacheModule } from '../cache/cache.module';
import { HttpModule } from '@nestjs/axios';
import { RegisterVerification } from '../register-verification/entities/register-verification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' }
    }),
    CustomeCacheModule,
    HttpModule,
    TypeOrmModule.forFeature([RegisterVerification])
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
