import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
  });

  await dataSource.initialize();
  
  const posts = await dataSource.query(`SELECT id, title, slug, status FROM posts`);
  
  console.log(`Found ${posts.length} posts:`);
  posts.forEach((p: any) => {
    console.log(`- ID: ${p.id}, Slug: ${p.slug}, Title: ${p.title}, Status: ${p.status}`);
  });
  
  await dataSource.destroy();
}

run().catch(console.error);
