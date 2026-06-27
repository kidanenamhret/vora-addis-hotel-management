import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../vora_addis_hms.db');

export const pool = {
  db: new DatabaseSync(dbPath),
  async connect() {
    return {
      query: async (text, params = []) => query(text, params),
      release: () => {}
    };
  },
  async end() {
    // DatabaseSync is closed automatically or has no end wrapper needed
  }
};

// Enable foreign keys
pool.db.exec('PRAGMA foreign_keys = ON');

export async function query(text, params = []) {
  // Convert Postgres $1, $2 params to SQLite ? and map array
  const paramIndices = [];
  const placeholderRegex = /\$(\d+)/g;
  let match;
  while ((match = placeholderRegex.exec(text)) !== null) {
    paramIndices.push(parseInt(match[1], 10) - 1);
  }

  let sqliteSql = text.replace(/\$\d+/g, '?');

  // Simple string/cast cleaning:
  sqliteSql = sqliteSql.replace(/\bilike\b/gi, 'LIKE');
  sqliteSql = sqliteSql.replace(/::[a-z0-9_]+(\[\])?/gi, '');
  
  const sqliteParams = paramIndices.length > 0 
    ? paramIndices.map(index => params[index])
    : params;

  try {
    const isSelectOrReturning = /select|returning/i.test(sqliteSql);
    const stmt = pool.db.prepare(sqliteSql);
    if (isSelectOrReturning) {
      const rows = stmt.all(...sqliteParams);
      return {
        rows,
        rowCount: rows.length
      };
    } else {
      const result = stmt.run(...sqliteParams);
      return {
        rows: [],
        rowCount: result.changes
      };
    }
  } catch (error) {
    console.error('SQLite execution error on query:', text);
    console.error('Translated query:', sqliteSql);
    console.error('Params:', sqliteParams);
    throw error;
  }
}
