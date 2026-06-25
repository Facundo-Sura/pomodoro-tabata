import { neon } from '@vercel/postgres';

const sql = neon(process.env.DATABASE_URL);

export { sql };

export async function query(text, params) {
  const result = await sql(text, params);
  return result;
}
