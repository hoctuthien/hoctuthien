const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://codelung:dungthaydoimatkhau@163.44.96.79:5432/htt_dev',
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to database successfully.');
    
    const res = await client.query('SELECT id, name, email, role, status, is_verified, password_hash FROM "users"');
    console.log('All Users in DB:');
    console.log(res.rows);
  } catch (error) {
    console.error('Error running check-user script:', error);
  } finally {
    await client.end();
  }
}

main();
