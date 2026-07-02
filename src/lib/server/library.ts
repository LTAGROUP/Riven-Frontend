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
            return { items: await fetchLibraryItemsFromDb(), source: 'database', error: null };
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
