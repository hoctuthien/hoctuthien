import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafafa; margin: 0;">
        <div style="background: white; border: 1px solid #eaeaea; padding: 20px 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px;">
            <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);"></div>
            <span style="font-weight: 500; color: #111827;">Hoc Tu Thien API is running...</span>
            <span style="color: #6b7280; font-size: 13px; border-left: 1px solid #eaeaea; padding-left: 15px;">v1.0.0</span>
        </div>
    </div>
    `;
  }
}
