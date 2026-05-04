import { LoginDto } from '../dtos/auth.dto';

export interface IAuthService {
  login(loginDto: LoginDto, requestInfo?: { ip?: string; deviceId?: string }): Promise<any>;
  validateGoogleUser(googleUser: any, deviceId?: string): Promise<any>;
  verifyGoogleToken(idToken: string, deviceId?: string): Promise<any>;
}
