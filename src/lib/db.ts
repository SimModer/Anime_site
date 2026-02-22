// src/lib/db.ts
// Reads from media.db using sql.js (pure JS — works on Vercel with no compilation)
// Place your DB file at: db/media.db

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import initSqlJs from 'sql.js';

export interface MediaItem {
  id: number;
  name: string;
  english_title: string | null;
  type: string;
  status: string;
  studios: string | null;
  poster_url: string | null;
  genres: string | null;
  premiered: string | null;
  episodes: number | null;
  volumes: number | null;
  chapters: number | null;
}

let _db: any = null;

async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();
  const fileBuffer = readFileSync(resolve('./db/media.db'));
  _db = new SQL.Database(fileBuffer);
  return _db;
}

/** Converts sql.js query result to array of objects */
function toObjects(result: any[]): any[] {
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row: any[]) =>
    Object.fromEntries(columns.map((col: string, i: number) => [col, row[i]]))
  );
}

// ─── ANIME ────────────────────────────────────────────────────────────────────

export async function getOngoingAnimes(limit = 20): Promise<MediaItem[]> {
  const db = await getDb();
  const result = db.exec(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres, premiered, episodes
    FROM media
    WHERE type IN ('TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC')
      AND (LOWER(status) = 'ongoing')
    LIMIT ${limit}
  `);
  return toObjects(result) as MediaItem[];
}

export async function getAllOngoingAnimes(limit = 50): Promise<MediaItem[]> {
  return getOngoingAnimes(limit);
}

// ─── SHARED ───────────────────────────────────────────────────────────────────

export async function getItemById(id: number): Promise<MediaItem | null> {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM media WHERE id = ${id} LIMIT 1`);
  const items = toObjects(result);
  return items[0] ?? null;
}

export async function searchMedia(term: string, limit = 30): Promise<MediaItem[]> {
  const db = await getDb();
  const safe = term.replace(/'/g, "''");
  const result = db.exec(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres
    FROM media
    WHERE name LIKE '%${safe}%' OR english_title LIKE '%${safe}%'
    LIMIT ${limit}
  `);
  return toObjects(result) as MediaItem[];
}
