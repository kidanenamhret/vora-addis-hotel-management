import { query, pool } from './src/config/db.js';

async function main() {
  try {
    console.log('Connecting to database and updating passwords...');
    const res = await query(
      `UPDATE users 
       SET password_hash = '$2a$12$t3v5Kifpct.I40FINnSjsOUvPouMMATy9rN6BjFtH7ZiPCzIT3KOq' 
       WHERE email IN ('admin@voraaddis.com', 'manager@voraaddis.com', 'receptionist@voraaddis.com', 'accountant@voraaddis.com')`
    );
    console.log('Database updated successfully! Seed users updated:', res.rowCount);
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await pool.end();
  }
}

main();
