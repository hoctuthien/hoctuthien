import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListController } from './black-list.controller';
import { BlackListService } from './services/black-list.service';
import { BlackListEntity } from './entities/black-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlackListEntity])],
  controllers: [BlackListController],
  providers: [BlackListService],
  exports: [BlackListService],
})
export class BlackListModule {}
