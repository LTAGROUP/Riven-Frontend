import { getEnv } from './env';

const TMDB_API = 'https://api.themoviedb.org/3';

export class TmdbError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'TmdbError';
        this.status = status;
    }
}

// ── Minimal hand-written types (we consume a handful of fields) ────────────
export interface TmdbListItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person';
    title?: string; // movies
    name?: string; // tv
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    release_date?: string; // movies
    first_air_date?: string; // tv
    vote_average?: number;
}

export interface TmdbPagedResponse {
    page: number;
    results: TmdbListItem[];
    total_pages: number;
    total_results: number;
}

export interface TmdbExternalIds {
    imdb_id: string | null;
    tvdb_id: number | null;
}

export interface TmdbSeasonSummary {
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
    air_date: string | null;
    poster_path: string | null;
}

export interface TmdbTvDetails {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string | null;
    number_of_seasons: number;
    seasons: TmdbSeasonSummary[];
}

export interface TmdbMovieDetails {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string | null;
    runtime: number | null;
    imdb_id: string | null;
}
// ────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const cache = new Map<string, { body: unknown; fetchedAt: number }>();

/**
 * Server-side TMDB fetch with a small in-memory TTL cache.
 * Throws TmdbError(503) when no token is configured.
 */
export async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const token = getEnv().TMDB_READ_ACCESS_TOKEN;
    if (!token) {
        throw new TmdbError(503, 'TMDB_READ_ACCESS_TOKEN is not configured');
    }

    const search = new URLSearchParams({ language: 'en-US', ...params });
    const url = `${TMDB_API}/${path.replace(/^\//, '')}?${search}`;

    const cached = cache.get(url);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.body as T;
    }

    const response = await fetch(url, {
        headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
        signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
        throw new TmdbError(response.status, `TMDB responded with HTTP ${response.status}`);
    }

    const body = (await response.json()) as T;

    if (cache.size >= CACHE_MAX_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(url, { body, fetchedAt: Date.now() });

    return body;
}
