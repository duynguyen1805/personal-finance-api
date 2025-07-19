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
import { SignUpUseCase } from './use-cases/sign-up.use-case';
import { SignInUseCase } from './use-cases/sign-in.use-case';
import { VerifyRegistrationUseCase } from './use-cases/verify-registration.use-case';
import { ResendVerifyRegistrationUseCase } from './use-cases/resend-verify-registration.use-case';
import { LogOutUseCase } from './use-cases/logout.use-case';
import { User } from '../user/entities/user.entity';
import { Mailer } from '../../common/email-helpers/mailer';
import { RoleService } from '../role/role.service';
import { Role } from '../role/entities/role.entity';
import { UserService } from '../user/user.service';

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
    TypeOrmModule.forFeature([User, Role, RegisterVerification])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SignUpUseCase,
    SignInUseCase,
    VerifyRegistrationUseCase,
    ResendVerifyRegistrationUseCase,
    LogOutUseCase,
    Mailer,
    RoleService,
    UserService
  ],
  exports: [AuthService]
})
export class AuthModule {}
