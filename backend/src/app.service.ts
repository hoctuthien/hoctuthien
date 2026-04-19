import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // Gấm có thể trả về HTML đơn giản để hiện lên trình duyệt cho đẹp
    return `
      <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h1 style="color: #4CAF50;">Hoc Tu Thien API</h1>
        <p>Status: <span style="color: green;">Online</span></p>
        <p>Version: 1.0.0</p>
        <hr style="width: 200px;">
        <p style="font-size: 0.8rem; color: gray;">© 2026 HocTuThien Team</p>
      </div>
    `;
  }
}
