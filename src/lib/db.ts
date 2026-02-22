// src/lib/db.ts
// Reads anime/manga/novel data from media.db
// Place your file at: db/media.db

import Database from 'better-sqlite3';
import path from 'node:path';

const DB_PATH = path.resolve('./db/media.db');

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

let _db: ReturnType<typeof Database> | null = null;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
  }
  return _db;
}

// ─── ANIME ────────────────────────────────────────────────────────────────────

/** Ongoing anime for the home page strip */
export function getOngoingAnimes(limit = 20): MediaItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres, premiered, episodes
    FROM media
    WHERE type IN ('TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC')
      AND (status = 'ongoing' OR status = 'ONGOING')
    LIMIT ?
  `);
  return stmt.all(limit) as MediaItem[];
}

/** All ongoing anime for the /ongoing page */
export function getAllOngoingAnimes(limit = 50): MediaItem[] {
  return getOngoingAnimes(limit);
}

// ─── MANGA ────────────────────────────────────────────────────────────────────

/** Ongoing manga */
export function getOngoingManga(limit = 20): MediaItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres, premiered, volumes, chapters
    FROM media
    WHERE type = 'manga'
      AND (status = 'ongoing' OR status = 'ONGOING')
    LIMIT ?
  `);
  return stmt.all(limit) as MediaItem[];
}

/** All manga (any status) */
export function getAllManga(limit = 50): MediaItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres, premiered, volumes, chapters
    FROM media
    WHERE type = 'manga'
    LIMIT ?
  `);
  return stmt.all(limit) as MediaItem[];
}

// ─── NOVELS ───────────────────────────────────────────────────────────────────

/** Ongoing novels (light novels) */
export function getOngoingNovels(limit = 20): MediaItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres, premiered, volumes, chapters
    FROM media
    WHERE type IN ('novel', 'light_novel', 'NOVEL')
      AND (status = 'ongoing' OR status = 'ONGOING')
    LIMIT ?
  `);
  return stmt.all(limit) as MediaItem[];
}

// ─── SHARED ───────────────────────────────────────────────────────────────────

/** Get a single item by ID (for detail pages) */
export function getItemById(id: number): MediaItem | null {
  const db = getDb();
  const stmt = db.prepare(`SELECT * FROM media WHERE id = ?`);
  return (stmt.get(id) as MediaItem) ?? null;
}

/** Search across all types by name */
export function searchMedia(term: string, limit = 30): MediaItem[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, name, english_title, type, status, studios, poster_url, genres
    FROM media
    WHERE name LIKE ? OR english_title LIKE ?
    LIMIT ?
  `);
  const q = `%${term}%`;
  return stmt.all(q, q, limit) as MediaItem[];
}
