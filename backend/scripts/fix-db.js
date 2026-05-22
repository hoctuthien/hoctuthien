const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://codelung:dungthaydoimatkhau@163.44.96.79:5432/htt_dev',
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to database successfully.');
    
    // Get all tables in the public schema
    const res = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    
    const tables = res.rows.map(row => row.tablename);
    console.log('Found tables in dev database:', tables);
    
    if (tables.length > 0) {
      console.log('Dropping all tables to reset schema sync...');
      // Drop all tables with CASCADE to clean the database completely
      const dropQueries = tables.map(table => `DROP TABLE IF EXISTS "${table}" CASCADE;`).join(' ');
      await client.query(dropQueries);
      console.log('Successfully dropped all tables!');
    } else {
      console.log('No tables found in dev database.');
    }
    
  } catch (error) {
    console.error('Error running reset script:', error);
  } finally {
    await client.end();
  }
}

main();
