import { error } from '@sveltejs/kit';

import { getLibraryItems } from '$lib/server/library';
import { tmdbConfigured } from '$lib/server/env';
import { TmdbError, tmdb } from '$lib/server/tmdb';

import type { PageServerLoad } from './$types';

export interface TmdbDetails {
    id: number;
    title?: string; // movies
    name?: string; // tv
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    genres: { id: number; name: string }[];
    vote_average: number;
    release_date?: string; // movies
    runtime?: number | null; // movies
    first_air_date?: string; // tv
    status?: string; // tv
    number_of_seasons?: number; // tv
    number_of_episodes?: number; // tv
    seasons?: {
        id: number;
        season_number: number;
        name: string;
        episode_count: number;
        air_date: string | null;
        poster_path: string | null;
    }[];
    external_ids: { imdb_id: string | null; tvdb_id: number | null };
}

export const load: PageServerLoad = async ({ params }) => {
    if (params.type !== 'movie' && params.type !== 'tv') {
        error(404, 'Not found');
    }
    const mediaType: 'movie' | 'tv' = params.type;
    if (!tmdbConfigured()) {
        error(503, 'Set TMDB_READ_ACCESS_TOKEN to browse media details');
    }

    let details: TmdbDetails;
    try {
        details = await tmdb<TmdbDetails>(`${mediaType}/${params.id}`, {
            append_to_response: 'external_ids'
        });
    } catch (cause) {
        if (cause instanceof TmdbError && cause.status === 404) {
            error(404, 'Title not found on TMDB');
        }
        error(502, 'Failed to load details from TMDB');
    }

    // Best-effort library match so the page can link to the item instead of
    // offering a duplicate request.
    let libraryItemId: string | null = null;
    let libraryItemState: string | null = null;
    try {
        const library = await getLibraryItems();
        const match = library.items.find((item) =>
            mediaType === 'movie'
                ? item.type === 'movie' && item.tmdbId === String(details.id)
                : item.type === 'show' &&
                  details.external_ids.tvdb_id !== null &&
                  item.tvdbId === String(details.external_ids.tvdb_id)
        );
        libraryItemId = match?.id ?? null;
        libraryItemState = match?.state ?? null;
    } catch {
        // Library unavailable — the page still renders with a request button.
    }

    return { mediaType, details, libraryItemId, libraryItemState };
};
