import pool from './db'
import 'dotenv/config'

async function migrate() {
  const client = await pool.connect()
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'OWNER',
        clinic_name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        breed TEXT,
        birth_date TIMESTAMP,
        identifier TEXT UNIQUE NOT NULL,
        identifier_type TEXT NOT NULL,
        quick_view_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
        owner_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS health_records (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        valid_until TIMESTAMP,
        notes TEXT,
        is_verified BOOLEAN DEFAULT false,
        animal_id TEXT NOT NULL REFERENCES animals(id),
        added_by_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)
    
    console.log('✅ Tabele stworzone!')
  } catch (error) {
    console.error('❌ Błąd:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()