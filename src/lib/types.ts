/**
 * A library listing entry. Shape matches the GraphQL LibraryItems selection so
 * the database fallback (src/lib/server/db.ts) can substitute transparently.
 */
export interface LibraryItem {
    id: string;
    type: string;
    title: string;
    fullTitle: string;
    imdbId: string | null;
    posterPath: string | null;
    state: string;
    releaseDate: string | null;
    year: number | null;
    genres: string[] | null;
    rating: number | null;
    language: string | null;
    isAnime: boolean;
    indexedAt: string;
    scrapedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    tmdbId?: string;
    tvdbId?: string;
    number?: number;
}

/** Feature support detected from the backend schema at runtime (shared client/server). */
export interface Capabilities {
    backendReachable: boolean;
    /** Requesting media works via the seerr plugin's webhook mutation. */
    hasSeerrWebhook: boolean;
    hasResetMediaItem: boolean;
    hasSaveStreamUrl: boolean;
    hasShareLogs: boolean;
    hasSettingsQuery: boolean;
    hasVfs: boolean;
    // Not implemented by riven-ts yet — drive the disabled action buttons and
    // light up automatically once the backend grows these mutations.
    hasDeleteMediaItem: boolean;
    hasPauseMediaItem: boolean;
    hasRetryMediaItem: boolean;
    /** True once `mediaItems` accepts arguments (pagination/filtering). */
    hasMediaItemsPagination: boolean;
    /** Plugin names derived from `<name>IsValid` query fields. */
    plugins: string[];
}
