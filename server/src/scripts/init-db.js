import dotenv from 'dotenv';
import { createConnectionPool } from '../lib/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await createConnectionPool();
    
    // Read SQL file (prefer Aiven version, fallback to regular)
    let sqlPath = join(__dirname, '../../..', 'event_booking_aiven.sql');
    try {
      readFileSync(sqlPath, 'utf-8');
    } catch {
      sqlPath = join(__dirname, '../../..', 'event_booking.sql');
    }
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Remove comments and split by semicolons
    let cleanSql = sql
      .split('\n')
      .map(line => {
        // Remove inline comments
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
          line = line.substring(0, commentIndex);
        }
        return line.trim();
      })
      .filter(line => line.length > 0 && !line.startsWith('/*'))
      .join('\n');
    
    // Split by semicolons
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip CREATE DATABASE and USE statements (Aiven handles this)
      if (statement.toUpperCase().includes('CREATE DATABASE') || 
          statement.toUpperCase().includes('USE ')) {
        console.log(`⏭️  Skipping: ${statement.substring(0, 50)}...`);
        continue;
      }
      
      if (!statement) continue;
      
      try {
        await pool.query(statement + ';');
        console.log(`✅ Executed statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      } catch (err) {
        // Ignore "table already exists" errors
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message.includes('already exists')) {
          console.log(`⚠️  Table already exists, skipping...`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
          throw err;
        }
      }
    }
    
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initDatabase();

