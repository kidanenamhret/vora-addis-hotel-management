import { query } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

function assertAllowed(columns, data) {
  const keys = Object.keys(data).filter((key) => data[key] !== undefined);
  const invalid = keys.filter((key) => !columns.includes(key));
  if (invalid.length) throw new HttpError(400, `Unsupported fields: ${invalid.join(', ')}`);
  return keys;
}

export function createCrudService({ table, columns, searchable = [], orderBy = 'id' }) {
  return {
    async list({ search, limit = 50, offset = 0 }) {
      const params = [];
      let where = '';
      if (search && searchable.length) {
        // SQLite: use LIKE instead of ILIKE, cast via CAST(col AS TEXT)
        params.push(`%${search}%`);
        where = `WHERE ${searchable.map((col) => `CAST(${col} AS TEXT) LIKE $1`).join(' OR ')}`;
      }
      params.push(Number(limit), Number(offset));
      // SQLite: no NULLS LAST — use CASE to sort NULLs to end manually
      const { rows } = await query(
        `SELECT * FROM ${table} ${where}
         ORDER BY CASE WHEN ${orderBy} IS NULL THEN 1 ELSE 0 END, ${orderBy} DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );
      return rows;
    },

    async get(id) {
      const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      if (!rows[0]) throw new HttpError(404, `${table} record not found`);
      return rows[0];
    },

    async create(data) {
      const keys = assertAllowed(columns, data);
      if (!keys.length) throw new HttpError(400, 'No fields provided');
      const values = keys.map((key) => data[key]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },

    async update(id, data) {
      const keys = assertAllowed(columns, data);
      if (!keys.length) throw new HttpError(400, 'No fields provided');
      const assignments = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
      const { rows } = await query(
        `UPDATE ${table} SET ${assignments} WHERE id = $1 RETURNING *`,
        [id, ...keys.map((key) => data[key])]
      );
      if (!rows[0]) throw new HttpError(404, `${table} record not found`);
      return rows[0];
    },

    async remove(id) {
      const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      if (!rowCount) throw new HttpError(404, `${table} record not found`);
    }
  };
}
