import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    const slug = 'chuong-2-he-quan-tri-csdl-truy-van-du-lieu-bang';
    
    // First, check current status
    const checkRes = await client.query('SELECT id, title, status FROM posts WHERE slug = $1', [slug]);
    if (checkRes.rows.length === 0) {
      console.log(`No post found with slug: "${slug}"`);
      return;
    }
    
    const post = checkRes.rows[0];
    console.log(`Current Post: "${post.title}" (ID: ${post.id}), Status: "${post.status}"`);

    if (post.status === 'published') {
      console.log('Post is already published in database.');
      return;
    }

    // Update status to published
    console.log('Updating status to "published" and setting published_at...');
    const updateRes = await client.query(
      "UPDATE posts SET status = 'published', published_at = NOW() WHERE id = $1 RETURNING status, published_at",
      [post.id]
    );
    
    const updatedPost = updateRes.rows[0];
    console.log(`Success! Updated status to: "${updatedPost.status}", Published At: ${updatedPost.published_at}`);

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await client.end();
  }
}

main();
