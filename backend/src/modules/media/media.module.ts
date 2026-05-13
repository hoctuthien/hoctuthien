import { Module } from '@nestjs/common';
import { MediaService } from './services/media.service';
import { MediaController } from './media.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
