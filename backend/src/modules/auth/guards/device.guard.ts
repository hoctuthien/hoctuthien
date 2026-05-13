import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';

// device.guard.ts
@Injectable()
export class DeviceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Dữ liệu từ JWT sau khi qua AuthGuard
    const currentDeviceId =
      request.cookies['device_id'] || request.headers['x-device-id']; // Client gửi lên

    if (user.deviceId !== currentDeviceId) {
      throw new ForbiddenException(AUTH_MESSAGES.DEVICE_INVALID);
    }
    return true;
  }
}
