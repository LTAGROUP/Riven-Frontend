/**
 * Read-only access to riven-ts's Postgres database.
 *
 * This exists solely as a fallback while riven-ts's `mediaItems` GraphQL query
 * is broken ("Cannot resolve type for interface MediaItem..."): with
 * RIVEN_DATABASE_URL set, library listings are read straight from the
 * `media_item` table (schema per apps/riven/lib/database/migrations in the
 * riven-ts repo). Only SELECTs — all writes still go through the GraphQL API.
 */
import pg from 'pg';

import { getEnv } from './env';

import type { LibraryItem } from '$lib/types';

let pool: pg.Pool | undefined;

export function dbConfigured(): boolean {
    return Boolean(getEnv().RIVEN_DATABASE_URL);
}

function getPool(): pg.Pool {
    if (!pool) {
        pool = new pg.Pool({
            connectionString: getEnv().RIVEN_DATABASE_URL,
            max: 3,
            connectionTimeoutMillis: 8000,
            idleTimeoutMillis: 30_000
        });
        pool.on('error', () => {
            // Keep idle-connection errors from crashing the process.
        });
    }
    return pool;
}

interface MediaItemRow {
    id: string;
    type: string;
    title: string;
    full_title: string;
    imdb_id: string | null;
    poster_path: string | null;
    state: string;
    release_date: Date | null;
    year: number | null;
    genres: string[] | null;
    rating: number | null;
    network: string | null;
    country: string | null;
    language: string | null;
    indexed_at: Date | null;
    scraped_at: Date | null;
    scraped_times: number;
    failed_scrape_attempts: number;
    created_at: Date;
    updated_at: Date | null;
    active_stream_info_hash: string | null;
    tmdb_id: string | null;
    tvdb_id: string | null;
    number: number | null;
    absolute_number: number | null;
    runtime: number | null;
    status: string | null;
    season_id: string | null;
    show_id: string | null;
}

const ITEM_COLUMNS = `id, type, title, full_title, imdb_id, poster_path, state, release_date,
    year, genres, rating, network, country, language, indexed_at, scraped_at, scraped_times,
    failed_scrape_attempts, created_at, updated_at, active_stream_info_hash,
    tmdb_id, tvdb_id, "number", absolute_number, runtime, status, season_id, show_id`;

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

function isAnime(row: MediaItemRow): boolean {
    // Mirrors MediaItem.isAnime in riven-ts.
    const genres = row.genres?.map((genre) => genre.toLowerCase());
    return (
        row.language !== 'en' &&
        ['animation', 'anime'].every((genre) => genres?.includes(genre) ?? false)
    );
}

function toLibraryItem(row: MediaItemRow): LibraryItem {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        fullTitle: row.full_title,
        imdbId: row.imdb_id,
        posterPath: row.poster_path,
        state: row.state,
        releaseDate: iso(row.release_date),
        year: row.year,
        genres: row.genres,
        rating: row.rating,
        language: row.language,
        isAnime: isAnime(row),
        indexedAt: iso(row.indexed_at) ?? iso(row.created_at)!,
        scrapedAt: iso(row.scraped_at),
        createdAt: iso(row.created_at)!,
        updatedAt: iso(row.updated_at),
        tmdbId: row.tmdb_id ?? undefined,
        tvdbId: row.tvdb_id ?? undefined,
        number: row.number ?? undefined
    };
}

export interface DbLibraryQuery {
    /** Case-insensitive substring match on title / full title. */
    search?: string;
    /** Restrict to these item types (e.g. ['movie', 'show']). */
    types?: string[];
    state?: string;
    /** 1-based page. */
    page?: number;
    pageSize?: number;
}

export interface DbLibraryPage {
    items: LibraryItem[];
    total: number;
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export async function fetchLibraryItemsFromDb(query: DbLibraryQuery = {}): Promise<DbLibraryPage> {
    const { search, types, state, page = 1, pageSize = 500 } = query;

    const where: string[] = [];
    const params: unknown[] = [];
    if (search) {
        params.push(`%${escapeLike(search)}%`);
        where.push(`(title ilike $${params.length} or full_title ilike $${params.length})`);
    }
    if (types?.length) {
        params.push(types);
        where.push(`type = any($${params.length})`);
    }
    if (state) {
        params.push(state);
        where.push(`state = $${params.length}`);
    }
    const whereSql = where.length ? `where ${where.join(' and ')}` : '';

    const db = getPool();
    const [countResult, itemsResult] = await Promise.all([
        db.query<{ total: number }>(
            `select count(*)::int as total from media_item ${whereSql}`,
            params
        ),
        db.query<MediaItemRow>(
            `select ${ITEM_COLUMNS} from media_item ${whereSql}
             order by created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
            [...params, pageSize, (page - 1) * pageSize]
        )
    ]);

    return {
        items: itemsResult.rows.map(toLibraryItem),
        total: countResult.rows[0]?.total ?? 0
    };
}

export interface DbItemDetail {
    item: LibraryItem & {
        network: string | null;
        country: string | null;
        scrapedTimes: number;
        failedScrapeAttempts: number;
        runtime: number | null;
        status: string | null;
        absoluteNumber: number | null;
        activeStreamInfoHash: string | null;
    };
    /** Seasons with their episodes (shows), or episodes (seasons). */
    seasons: {
        id: string;
        title: string;
        number: number;
        state: string;
        episodes: {
            id: string;
            title: string;
            number: number;
            absoluteNumber: number | null;
            state: string;
            releaseDate: string | null;
        }[];
    }[];
    parent: { id: string; title: string; number: number | null } | null;
}

function toDetailItem(row: MediaItemRow): DbItemDetail['item'] {
    return {
        ...toLibraryItem(row),
        network: row.network,
        country: row.country,
        scrapedTimes: row.scraped_times,
        failedScrapeAttempts: row.failed_scrape_attempts,
        runtime: row.runtime,
        status: row.status,
        absoluteNumber: row.absolute_number,
        activeStreamInfoHash: row.active_stream_info_hash
    };
}

const toEpisode = (row: MediaItemRow) => ({
    id: row.id,
    title: row.title,
    number: row.number ?? 0,
    absoluteNumber: row.absolute_number,
    state: row.state,
    releaseDate: iso(row.release_date)
});

export async function fetchItemDetailFromDb(id: string): Promise<DbItemDetail | null> {
    const db = getPool();
    const itemResult = await db.query<MediaItemRow>(
        `select ${ITEM_COLUMNS} from media_item where id = $1`,
        [id]
    );
    const row = itemResult.rows[0];
    if (!row) return null;

    const detail: DbItemDetail = { item: toDetailItem(row), seasons: [], parent: null };

    if (row.type === 'show') {
        const seasonsResult = await db.query<MediaItemRow>(
            `select ${ITEM_COLUMNS} from media_item where show_id = $1 order by "number"`,
            [id]
        );
        const episodesResult = await db.query<MediaItemRow>(
            `select ${ITEM_COLUMNS} from media_item
             where season_id = any($1::uuid[]) order by "number"`,
            [seasonsResult.rows.map((season) => season.id)]
        );
        detail.seasons = seasonsResult.rows.map((season) => ({
            id: season.id,
            title: season.title,
            number: season.number ?? 0,
            state: season.state,
            episodes: episodesResult.rows
                .filter((episode) => episode.season_id === season.id)
                .map(toEpisode)
        }));
    } else if (row.type === 'season') {
        const episodesResult = await db.query<MediaItemRow>(
            `select ${ITEM_COLUMNS} from media_item where season_id = $1 order by "number"`,
            [id]
        );
        detail.seasons = [
            {
                id: row.id,
                title: row.title,
                number: row.number ?? 0,
                state: row.state,
                episodes: episodesResult.rows.map(toEpisode)
            }
        ];
        if (row.show_id) {
            const showResult = await db.query<MediaItemRow>(
                `select ${ITEM_COLUMNS} from media_item where id = $1`,
                [row.show_id]
            );
            const show = showResult.rows[0];
            if (show) detail.parent = { id: show.id, title: show.title, number: null };
        }
    } else if (row.type === 'episode' && row.season_id) {
        const seasonResult = await db.query<MediaItemRow>(
            `select ${ITEM_COLUMNS} from media_item where id = $1`,
            [row.season_id]
        );
        const season = seasonResult.rows[0];
        if (season) {
            detail.parent = { id: season.id, title: season.title, number: season.number };
        }
    }

    return detail;
}
