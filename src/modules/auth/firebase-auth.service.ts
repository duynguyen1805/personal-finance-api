import { Injectable, UnauthorizedException } from '@nestjs/common';
import { adminAuth } from '../../config/firebase.config';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EAuthProvider, EPermission } from '../user/dto/enum.dto';

export interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  provider: string;
}

@Injectable()
export class FirebaseAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async verifyFirebaseToken(idToken: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        provider: decodedToken.firebase?.sign_in_provider || 'google.com'
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async firebaseLogin(idToken: string) {
    // 1. Verify Firebase token
    const firebaseUser = await this.verifyFirebaseToken(idToken);
    
    // 2. Find or create user
    let user = await this.userService.findByEmail(firebaseUser.email);
    
    if (!user) {
      // Create new user
      const firstName = firebaseUser.name?.split(' ')[0] || '';
      const lastName = firebaseUser.name?.split(' ').slice(1).join(' ') || '';
      
      user = await this.userService.createUser({
        email: firebaseUser.email,
        firstName,
        lastName,
        passwordHash: 'N/A', // No password for Firebase auth
        accountType: 'FIREBASE'
      });

      // Create auth provider record
      await this.userService.createAuthProvider({
        userId: user.id,
        authProvider: EAuthProvider.FIREBASE,
        authProviderId: firebaseUser.uid,
        permission: EPermission.VIEW
      });
    }

    // 3. Generate JWT tokens
    const payload = {
      email: user.email,
      id: user.id,
      permissions: user.roles?.map(role => JSON.parse(role.permissions)).flat(1) || [],
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    };

    const token = this.jwtService.sign({ data: payload });
    const refreshToken = this.jwtService.sign(
      { data: payload },
      { expiresIn: '7d' }
    );

    return {
      token,
      refreshToken,
      user: {
        ...user,
        firebaseUid: firebaseUser.uid
      }
    };
  }
} 