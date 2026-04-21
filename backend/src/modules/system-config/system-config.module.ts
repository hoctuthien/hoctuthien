import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './services/system-config.service';
import { SystemConfigEntity } from './entities/system-config.entity';
import { SystemConfigRepository } from './repositories/system-config.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfigEntity])],
  controllers: [SystemConfigController],
  providers: [SystemConfigService, SystemConfigRepository],
  exports: [SystemConfigService, SystemConfigRepository],
})
export class SystemConfigModule {}
