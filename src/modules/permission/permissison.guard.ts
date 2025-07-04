import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy quyền yêu cầu từ decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    ) || [];

    // Lấy user từ request (đã được JwtAuthGuard xác thực)
    const { user } = context.switchToHttp().getRequest();
    const userPermissions = user?.permissions || [];

    // const result = requiredPermissions.some((permission) =>
    //   user?.permissions?.includes(permission)
    // );

    // User phải có quyền yêu cầu
    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  }
}
