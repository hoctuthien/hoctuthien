import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express'; // NestJS dùng cái này rất thường xuyên
import { AppService } from './app.service';
import { BypassInterceptor } from './common/decorators/bypass-interceptor.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @BypassInterceptor() // "Dán nhãn" thần thánh ở đây
  @Header('Content-Type', 'text/html') // Báo cho trình duyệt đây là HTML
  getHello(): string {
    return this.appService.getHello();
  }
}
