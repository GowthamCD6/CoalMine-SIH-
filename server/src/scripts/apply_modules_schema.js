import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSchema() {
  console.log('🔄 Applying smartmine_modules.sql schema...');
  const sqlPath = path.resolve(__dirname, '../../schema/smartmine_modules.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Strip single-line comments (-- ...)
  const strippedSql = sqlContent
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) return '';
      return line;
    })
    .join('\n');

  // Split by semicolon
  const rawStatements = strippedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of rawStatements) {
    try {
      await db.query(stmt);
      const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/i);
      const tableName = match ? match[1] : stmt.substring(0, 40);
      console.log(`✅ Table verified/created: ${tableName}`);
    } catch (err) {
      console.error(`❌ Failed on statement:\n${stmt.substring(0, 100)}\nError: ${err.message}\n`);
    }
  }

  console.log('\n🎉 Schema application complete.');
  process.exit(0);
}

runSchema().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
