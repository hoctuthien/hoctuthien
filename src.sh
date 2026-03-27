set -e

PROJECT_NAME="backend"

# 1) Tạo project NestJS
npx @nestjs/cli@latest new "$PROJECT_NAME" --package-manager npm --skip-git
cd "$PROJECT_NAME"

# 2) Cài dependencies chính
npm i @nestjs/config @nestjs/typeorm typeorm pg zod class-validator class-transformer
npm i -D hygen

# 3) Tạo cấu trúc thư mục chuẩn
mkdir -p src/common/{constants,decorators,entities,exceptions,filters,guards,interceptors,pipes,repositories,types,utils}
mkdir -p src/config
mkdir -p src/infrastructure/database/{migrations,subscribers}
mkdir -p src/infrastructure/{logger,redis}
mkdir -p src/modules
mkdir -p scripts
mkdir -p _templates/module/new

# 4) BaseEntity
cat > src/common/entities/base.entity.ts << 'EOF'
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
EOF

# 5) Config files
cat > src/config/env.config.ts << 'EOF'
export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
EOF

cat > src/config/validation.ts << 'EOF'
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
});

export const validateEnv = (config: Record<string, unknown>) => {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }

  return result.data;
};
EOF

# 6) DatabaseModule
cat > src/infrastructure/database/database.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('environment') !== 'production',
        logging: configService.get<string>('environment') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
EOF

# 7) AppModule chuẩn hoá
cat > src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from './config/env.config';
import { validateEnv } from './config/validation';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
EOF

# 8) Main: dùng API prefix từ env config
cat > src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const port = configService.get<number>('port') || 3000;

  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));
  await app.listen(port);

  console.log(`Server running at http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`);
}

bootstrap();
EOF

# 9) .env mẫu
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_base_nest
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=your-secret
JWT_EXPIRES_IN=1d
EOF

# 10) Hygen prompt
cat > _templates/module/new/prompt.js << 'EOF'
const toPascalCase = (value) =>
  value
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

module.exports = {
  prompt: async ({ inquirer, args }) => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Tên module (số ít, ví dụ: user):',
        initial: args.name,
        validate: (value) =>
          value && value.trim().length > 0
            ? true
            : 'Vui lòng nhập tên module hợp lệ',
      },
      {
        type: 'input',
        name: 'route',
        message: 'Route prefix (mặc định dùng tên module dạng số nhiều):',
        initial: args.route,
      },
    ]);

    const normalizedName = answers.name.trim().toLowerCase();
    const pluralName = normalizedName.endsWith('s') ? normalizedName : `${normalizedName}s`;

    return {
      ...answers,
      name: normalizedName,
      className: toPascalCase(normalizedName),
      route:
        answers.route && answers.route.trim().length > 0
          ? answers.route.trim().toLowerCase()
          : pluralName,
      pluralName,
    };
  },
};
EOF

# 11) Hygen templates
cat > _templates/module/new/module.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/<%= name %>.module.ts
---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <%= className %>Controller } from './<%= name %>.controller';
import { <%= className %>Service } from './services/<%= name %>.service';
import { <%= className %>Entity } from './entities/<%= name %>.entity';

@Module({
  imports: [TypeOrmModule.forFeature([<%= className %>Entity])],
  controllers: [<%= className %>Controller],
  providers: [<%= className %>Service],
  exports: [<%= className %>Service],
})
export class <%= className %>Module {}
EOF

cat > _templates/module/new/controller.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/<%= name %>.controller.ts
---
import { Controller, Get, Param } from '@nestjs/common';
import { <%= className %>Service } from './services/<%= name %>.service';

@Controller('<%= route %>')
export class <%= className %>Controller {
  constructor(private readonly <%= name %>Service: <%= className %>Service) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<%= name %>Service.findOne(id);
  }
}
EOF

cat > _templates/module/new/service.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/services/<%= name %>.service.ts
---
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class <%= className %>Service {
  async findOne(id: string) {
    if (!id) {
      throw new NotFoundException('<%= className %> id is required');
    }

    return {
      id,
      message: '<%= className %> fetched successfully',
    };
  }
}
EOF

cat > _templates/module/new/entity.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/entities/<%= name %>.entity.ts
---
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity({ name: '<%= pluralName %>' })
export class <%= className %>Entity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
}
EOF

cat > _templates/module/new/dto.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/dtos/<%= name %>.dto.ts
---
import { IsString, IsNotEmpty } from 'class-validator';

export class <%= className %>Dto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
EOF

cat > _templates/module/new/interface.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/interfaces/<%= name %>.service.interface.ts
---
export interface I<%= className %>Service {
  findOne(id: string): Promise<unknown>;
}
EOF

cat > _templates/module/new/repository.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/repositories/<%= name %>.repository.ts
---
import { Injectable } from '@nestjs/common';

@Injectable()
export class <%= className %>Repository {}
EOF

cat > _templates/module/new/type.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/types/<%= name %>.types.ts
---
export type <%= className %>Id = string;
EOF

cat > _templates/module/new/schema.ejs.t << 'EOF'
---
to: src/modules/<%= name %>/schema/<%= name %>.schema.ts
---
export type <%= className %>Schema = {
  name: string;
};

export const <%= name %>Schema = {
  parse: <T>(payload: T) => payload,
};
EOF

# 12 Wrapper script gen-module
cat > scripts/gen-module.js << 'EOF'
#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const inputName = process.argv[2];

if (!inputName) {
  console.error('Usage: npm run gen:module -- <module-name> [route]');
  process.exit(1);
}

const name = inputName.trim().toLowerCase();
const routeArg = process.argv[3];
const route =
  routeArg && routeArg.trim().length > 0
    ? routeArg.trim().toLowerCase()
    : `${name}${name.endsWith('s') ? '' : 's'}`;

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['hygen', 'module', 'new', '--name', name, '--route', route],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
EOF
chmod +x scripts/gen-module.js

# 13 Thêm scripts vào package.json
node -e "const fs=require('fs');const p='package.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.scripts=j.scripts||{};j.scripts.hygen='hygen';j.scripts['gen:module']='node scripts/gen-module.js';fs.writeFileSync(p,JSON.stringify(j,null,2));"