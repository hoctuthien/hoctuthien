import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './services/media.service';
import { MediaController } from './media.controller';
import { ConfigModule } from '@nestjs/config';
import { MediaEntity } from './entities/media.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
