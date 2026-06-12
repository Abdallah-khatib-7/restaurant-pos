const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  const queries = [
    "ALTER TABLE users ADD COLUMN delivery_status ENUM('available', 'on_road') DEFAULT 'available'",
    "ALTER TABLE users ADD COLUMN active_deliveries INT DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN tip DECIMAL(10,2) DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN bill_requested BOOLEAN DEFAULT FALSE",
    "ALTER TABLE orders ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN final_total DECIMAL(10,2) DEFAULT 0",
  ];

  for (const q of queries) {
    try {
      await connection.query(q);
      console.log('✅', q.substring(0, 50));
    } catch (err) {
      console.log('⚠️ Already exists:', q.substring(0, 50));
    }
  }

  await connection.end();
  console.log('Done');
}

run().catch(console.error);