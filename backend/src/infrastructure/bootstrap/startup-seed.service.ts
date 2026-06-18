import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { GroupCategoryEntity } from '../../modules/group-category/entities/group-category.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { UserEntity, UserRole } from '../../modules/user/entities/user.entity';

type GroupCategorySeedRecord = {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

type CategorySeedRecord = {
  id: string;
  name: string;
  slug: string | null;
  icon_url?: string | null;
  metadata?: Record<string, any>;
  status: string;
  group_category_id?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

@Injectable()
export class StartupSeedService {
  private readonly logger = new Logger(StartupSeedService.name);
  private readonly adminEmail = 'hoctuthien@gmail.com';
  private readonly adminPassword = 'dungthaydoimatkhau';

  constructor(private readonly dataSource: DataSource) {}

  async runIfNeeded() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    await this.seedCatalogIfNeeded();
    await this.seedAdminIfNeeded();
  }

  private async seedCatalogIfNeeded() {
    const groupRepository = this.dataSource.getRepository(GroupCategoryEntity);
    const categoryRepository = this.dataSource.getRepository(CategoryEntity);

    const [groupCount, categoryCount] = await Promise.all([
      groupRepository.count(),
      categoryRepository.count(),
    ]);

    if (groupCount > 0 && categoryCount > 0) {
      return;
    }

    if (groupCount !== 0 || categoryCount !== 0) {
      this.logger.warn(
        `Skipping catalog seed because table counts are inconsistent (group_categories=${groupCount}, categories=${categoryCount}).`,
      );
      return;
    }

    const [groupCategories, categories] = await Promise.all([
      this.readJson<GroupCategorySeedRecord[]>('group_categories.json'),
      this.readJson<CategorySeedRecord[]>('categories.json'),
    ]);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(GroupCategoryEntity).insert(
        groupCategories.map((group) => ({
          id: group.id,
          name: group.name,
          slug: group.slug ?? null,
          status: group.status,
          createdAt: this.toDate(group.created_at),
          updatedAt: this.toDate(group.updated_at),
          deletedAt: this.toDate(group.deleted_at),
        })),
      );

      await manager.getRepository(CategoryEntity).insert(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug ?? null,
          iconUrl: category.icon_url ?? null,
          metadata: category.metadata ?? {},
          status: category.status,
          groupCategoryId: category.group_category_id ?? null,
          createdAt: this.toDate(category.created_at),
          updatedAt: this.toDate(category.updated_at),
          deletedAt: this.toDate(category.deleted_at),
        })),
      );
    });

    this.logger.log(
      `Seeded ${groupCategories.length} group_categories and ${categories.length} categories from backend/data.`,
    );
  }

  private async seedAdminIfNeeded() {
    const userRepository = this.dataSource.getRepository(UserEntity);
    const existingAdmin = await userRepository.findOneBy({ email: this.adminEmail });

    if (existingAdmin) {
      return;
    }

    const passwordHash = await bcrypt.hash(this.adminPassword, 10);

    await userRepository.insert({
      name: 'System Admin',
      email: this.adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      status: 'active',
    });

    this.logger.log(`Created bootstrap admin account for ${this.adminEmail}.`);
  }

  private async readJson<T>(fileName: string): Promise<T> {
    const filePath = join(process.cwd(), 'data', fileName);
    const contents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(contents) as T;
  }

  private toDate(value?: string | null) {
    if (!value) {
      return null;
    }

    return new Date(value);
  }
}
