import { fail } from '@sveltejs/kit';

import { LibraryItemsQuery } from '$lib/graphql/operations/media';
import { RequestViaSeerrMutation, buildSeerrRequestPayload } from '$lib/graphql/operations/seerr';
import { getCapabilities } from '$lib/server/capabilities';
import { BackendError, execute } from '$lib/server/graphql-client';
import { tmdbConfigured } from '$lib/server/env';
import { tmdb, type TmdbPagedResponse } from '$lib/server/tmdb';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [trending, library] = await Promise.allSettled([
        tmdbConfigured()
            ? tmdb<TmdbPagedResponse>('trending/movie/week')
            : Promise.resolve({ results: [] } as unknown as TmdbPagedResponse),
        execute(LibraryItemsQuery)
    ]);

    // ids already in the library, for "In library" badges on search results
    const libraryIds = new Set<string>();
    if (library.status === 'fulfilled') {
        for (const item of library.value.mediaItems) {
            if ('tmdbId' in item && item.tmdbId) libraryIds.add(`movie:${item.tmdbId}`);
            if ('tvdbId' in item && item.tvdbId && item.type === 'show')
                libraryIds.add(`tv:${item.tvdbId}`);
        }
    }

    return {
        tmdbConfigured: tmdbConfigured(),
        trending: trending.status === 'fulfilled' ? trending.value.results.slice(0, 18) : [],
        libraryIds: [...libraryIds]
    };
};

export const actions: Actions = {
    request: async ({ request }) => {
        const capabilities = await getCapabilities();
        if (!capabilities.hasSeerrWebhook) {
            return fail(503, {
                message:
                    'Requesting requires the seerr plugin to be enabled in riven-ts (it provides the request intake mutation).'
            });
        }

        const form = await request.formData();
        const mediaType = String(form.get('mediaType') ?? '');
        const tmdbId = String(form.get('tmdbId') ?? '');
        const tvdbId = String(form.get('tvdbId') ?? '');
        const imdbId = String(form.get('imdbId') ?? '');
        const seasons = form
            .getAll('season')
            .map((value) => Number.parseInt(String(value), 10))
            .filter((value) => Number.isFinite(value));

        if (mediaType !== 'movie' && mediaType !== 'tv') {
            return fail(400, { message: 'Invalid media type' });
        }
        if (mediaType === 'movie' && !tmdbId) {
            return fail(400, { message: 'Movie requests need a TMDB id' });
        }
        if (mediaType === 'tv' && !tvdbId) {
            return fail(400, {
                message:
                    'TV requests need a TVDB id — TMDB has no TVDB mapping for this show, so riven-ts cannot index it.'
            });
        }

        const payload = buildSeerrRequestPayload({
            mediaType,
            tmdbId: tmdbId || undefined,
            tvdbId: tvdbId || undefined,
            imdbId: imdbId || undefined,
            seasons: seasons.length ? seasons : undefined
        });

        try {
            const result = await execute(RequestViaSeerrMutation, { payload });
            if (!result.seerrHandleWebhook) {
                return fail(500, { message: 'riven-ts rejected the request' });
            }
            return { message: 'Requested! Riven will start processing it shortly.' };
        } catch (cause) {
            return fail(500, {
                message: cause instanceof BackendError ? cause.message : 'Request failed'
            });
        }
    }
};
