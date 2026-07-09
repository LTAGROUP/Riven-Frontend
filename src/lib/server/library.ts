import { LibraryItemsQuery } from '$lib/graphql/operations/media';
import { dbConfigured, fetchLibraryItemsFromDb } from './db';
import { BackendError, execute } from './graphql-client';

import type { LibraryItem } from '$lib/types';

export interface LibraryResult {
    items: LibraryItem[];
    /** Where the data came from — 'database' means the SQL fallback kicked in. */
    source: 'graphql' | 'database' | 'none';
    error: string | null;
}

/**
 * Loads library items from the backend, falling back to a read-only query
 * against riven-ts's Postgres when the GraphQL query fails (it is currently
 * broken upstream: "Cannot resolve type for interface MediaItem").
 */
export async function getLibraryItems(): Promise<LibraryResult> {
    let graphqlError: string;
    try {
        const result = await execute(LibraryItemsQuery);
        return { items: result.mediaItems as LibraryItem[], source: 'graphql', error: null };
    } catch (cause) {
        graphqlError = cause instanceof BackendError ? cause.message : 'Failed to load library';
    }

    if (dbConfigured()) {
        try {
            const { items } = await fetchLibraryItemsFromDb();
            return { items, source: 'database', error: null };
        } catch (cause) {
            return {
                items: [],
                source: 'none',
                error: `${graphqlError} (database fallback also failed: ${
                    cause instanceof Error ? cause.message : String(cause)
                })`
            };
        }
    }

    return { items: [], source: 'none', error: graphqlError };
}

export interface LibraryPageOptions {
    /** Case-insensitive title search. */
    search: string;
    /** 'primary' (movies + shows), 'all', or a concrete item type. */
    type: string;
    /** 'all' or a concrete media item state. */
    state: string;
    /** 1-based page. */
    page: number;
    pageSize: number;
}

export interface LibraryPageResult {
    items: LibraryItem[];
    /** Total items matching the filters, across all pages. */
    total: number;
    source: 'graphql' | 'database' | 'none';
    error: string | null;
}

const typesFor = (type: string): string[] | undefined =>
    type === 'primary' ? ['movie', 'show'] : type === 'all' ? undefined : [type];

/**
 * Loads one filtered page of the library. Prefers the database when
 * configured: riven-ts's `mediaItems` query returns at most 25 items and takes
 * no filter/pagination arguments, so it can never search the whole library.
 */
export async function getLibraryPage(options: LibraryPageOptions): Promise<LibraryPageResult> {
    let dbError: string | undefined;
    if (dbConfigured()) {
        try {
            const { items, total } = await fetchLibraryItemsFromDb({
                search: options.search || undefined,
                types: typesFor(options.type),
                state: options.state === 'all' ? undefined : options.state,
                page: options.page,
                pageSize: options.pageSize
            });
            return { items, total, source: 'database', error: null };
        } catch (cause) {
            dbError = cause instanceof Error ? cause.message : String(cause);
        }
    }

    try {
        const result = await execute(LibraryItemsQuery);
        const query = options.search.trim().toLowerCase();
        const types = typesFor(options.type);
        const matches = (result.mediaItems as LibraryItem[]).filter(
            (item) =>
                (!types || types.includes(item.type)) &&
                (options.state === 'all' || item.state === options.state) &&
                (!query || item.title.toLowerCase().includes(query))
        );
        const start = (options.page - 1) * options.pageSize;
        return {
            items: matches.slice(start, start + options.pageSize),
            total: matches.length,
            source: 'graphql',
            error: dbError
                ? `Database query failed (${dbError}); showing the backend's limited listing instead.`
                : null
        };
    } catch (cause) {
        const message = cause instanceof BackendError ? cause.message : 'Failed to load library';
        return {
            items: [],
            total: 0,
            source: 'none',
            error: dbError ? `${message} (database also failed: ${dbError})` : message
        };
    }
}
