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

    // Fetch all posts
    const res = await client.query('SELECT id, title, summary, metadata FROM posts');
    console.log(`Found ${res.rows.length} posts to analyze.`);

    for (const post of res.rows) {
      const metadata = post.metadata || {};
      const thumbnail = metadata.thumbnail || null;
      const summary = post.summary || null;

      let changed = false;

      if (thumbnail && metadata.image !== thumbnail) {
        metadata.image = thumbnail;
        changed = true;
      }

      if (summary && metadata.summary !== summary) {
        metadata.summary = summary;
        changed = true;
      }

      if (changed) {
        console.log(`Updating metadata for post: "${post.title.trim()}"`);
        await client.query(
          'UPDATE posts SET metadata = $1 WHERE id = $2',
          [JSON.stringify(metadata), post.id]
        );
      }
    }

    console.log('Successfully synchronized metadata for all posts.');

  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await client.end();
  }
}

main();
