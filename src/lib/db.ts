// src/lib/db.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import initSqlJs from 'sql.js';

// ── Full schema from media table ──────────────────────────────
export interface MediaItem {
  id: number;
  name: string;
  english_name:   string | null;
  japanese_name:  string | null;
  other_name:     string | null;
  russian:        string | null;
  type:           string;
  episodes:       number | null;
  episodes_aired: number | null;
  volumes:        number | null;
  chapters:       number | null;
  aired:          string | null;
  aired_on:       string | null;
  released_on:    string | null;
  premiered:      string | null;
  producers:      string | null;
  licensors:      string | null;
  studios:        string | null;
  source:         string | null;
  duration:       string | null;
  rating:         string | null;
  genres:         string | null;
  status:         string;
  synopsis:       string | null;
  poster_url:     string | null;
}

// ── Singleton DB instance ─────────────────────────────────────
let _db: any = null;

async function getDb() {
  if (_db) return _db;

  const require = createRequire(import.meta.url);
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

// ── Queries ───────────────────────────────────────────────────

export async function getAnimeById(id: number): Promise<MediaItem | null> {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM media WHERE id = ${id} LIMIT 1`);
  const items = toObjects(result);
  return (items[0] as MediaItem) ?? null;
}

export async function getOngoingAnimes(limit = 8): Promise<MediaItem[]> {
  const db = await getDb();
  const result = db.exec(`
    SELECT id, name, english_name, japanese_name, other_name,
           type, status, studios, poster_url, genres, premiered,
           episodes, episodes_aired, duration, rating, source
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
           type, status, studios, poster_url, genres, premiered,
           episodes, episodes_aired, duration, rating, source
    FROM media
    WHERE type IN ('TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC')
      AND LOWER(status) = 'ongoing'
      AND (genres IS NULL OR LOWER(genres) NOT LIKE '%hentai%')
  `);
  return toObjects(result) as MediaItem[];
}

export async function searchMedia(term: string, limit = 30): Promise<MediaItem[]> {
  const db = await getDb();
  const safe = term.replace(/'/g, "''");
  const result = db.exec(`
    SELECT id, name, english_name, japanese_name, type, status,
           studios, poster_url, genres, episodes, duration, rating
    FROM media
    WHERE (name LIKE '%${safe}%' OR english_name LIKE '%${safe}%')
      AND (genres IS NULL OR LOWER(genres) NOT LIKE '%hentai%')
    LIMIT ${limit}
  `);
  return toObjects(result) as MediaItem[];
}
