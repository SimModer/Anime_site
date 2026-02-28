// src/lib/db.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import initSqlJs from 'sql.js';

export interface MediaItem {
  id: number;
  name: string;
  english_name: string | null;
  japanese_name: string | null;
  other_name: string | null;
  type: string;
  status: string;
  studios: string | null;
  poster_url: string | null;
  genres: string | null;
  premiered: string | null;
  episodes: number | null;
}

let _db: any = null;

async function getDb() {
  if (_db) return _db;

  const require = createRequire(import.meta.url);
  // Explicitly point sql.js to the wasm file so Vercel bundler can find it
  const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
  const wasmBinary = readFileSync(wasmPath);

  const SQL = await initSqlJs({ wasmBinary });
  const fileBuffer = readFileSync(resolve('./db/media.db'));
  _db = new SQL.Database(fileBuffer);
  return _db;
}

function toObjects(result: any[]): any[] {
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row: any[]) =>
    Object.fromEntries(columns.map((col: string, i: number) => [col, row[i]]))
  );
}

export async function getOngoingAnimes(limit = 8): Promise<MediaItem[]> {
  const db = await getDb();
  const result = db.exec(`
    SELECT id, name, english_name, japanese_name, other_name,
           type, status, studios, poster_url, genres, premiered, episodes
    FROM media
    WHERE type IN ('TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC')
      AND LOWER(status) = 'ongoing'
      AND (genres IS NULL OR LOWER(genres) NOT LIKE '%hentai%')
    LIMIT ${limit}
  `);
  return toObjects(result) as MediaItem[];
}

export async function getAllOngoingAnimes(): Promise<MediaItem[]> {
  const db = await getDb();
  const result = db.exec(`
    SELECT id, name, english_name, japanese_name, other_name,
           type, status, studios, poster_url, genres, premiered, episodes
    FROM media
    WHERE type IN ('TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC')
      AND LOWER(status) = 'ongoing'
      AND (genres IS NULL OR LOWER(genres) NOT LIKE '%hentai%')
  `);
  return toObjects(result) as MediaItem[];
}

export async function getItemById(id: number): Promise<MediaItem | null> {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM media WHERE id = ${id} LIMIT 1`);
  return toObjects(result)[0] ?? null;
}

export async function searchMedia(term: string, limit = 30): Promise<MediaItem[]> {
  const db = await getDb();
  const safe = term.replace(/'/g, "''");
  const result = db.exec(`
    SELECT id, name, english_name, japanese_name, type, status, studios, poster_url, genres
    FROM media
    WHERE name LIKE '%${safe}%' OR english_name LIKE '%${safe}%'
    LIMIT ${limit}
  `);
  return toObjects(result) as MediaItem[];
}
