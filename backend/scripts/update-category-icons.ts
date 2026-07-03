import { DataSource } from 'typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

type CategorySeedRecord = {
  id: string;
  name: string;
  metadata?: Record<string, any>;
};

async function updateCategoryIcons() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    const contents = await fs.readFile(join(process.cwd(), 'data', 'categories.json'), 'utf8');
    const categories = JSON.parse(contents) as CategorySeedRecord[];

    await dataSource.initialize();

    let updatedCount = 0;

    for (const category of categories) {
      const icon = category.metadata?.icon;

      if (!icon) {
        console.warn(`Skipping "${category.name}" because metadata.icon is missing.`);
        continue;
      }

      const result = await dataSource.query(
        `
          UPDATE categories
          SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb
          WHERE id = $2
        `,
        [JSON.stringify({ icon }), category.id],
      );

      updatedCount += result[1] ?? 0;
    }

    console.log(`Updated category icons for ${updatedCount} categories.`);
  } catch (error) {
    console.error('Failed to update category icons:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

updateCategoryIcons();
