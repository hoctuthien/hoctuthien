import { LoginDto } from '../dtos/auth.dto';

export interface IAuthService {
  login(loginDto: LoginDto): Promise<any>;
  validateGoogleUser(googleUser: any): Promise<any>;
  verifyGoogleToken(idToken: string): Promise<any>;
}
