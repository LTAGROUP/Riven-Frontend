import { fail } from '@sveltejs/kit';

import { RequestViaSeerrMutation, buildSeerrRequestPayload } from '$lib/graphql/operations/seerr';
import { getCapabilities } from '$lib/server/capabilities';
import { BackendError, execute } from '$lib/server/graphql-client';
import { getLibraryItems } from '$lib/server/library';
import { tmdbConfigured } from '$lib/server/env';
import { tmdb, type TmdbPagedResponse } from '$lib/server/tmdb';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [trending, library] = await Promise.allSettled([
        tmdbConfigured()
            ? tmdb<TmdbPagedResponse>('trending/movie/week')
            : Promise.resolve({ results: [] } as unknown as TmdbPagedResponse),
        getLibraryItems()
    ]);

    // States keyed by the identifiers available on TMDB cards. Movie IDs are
    // exact; show titles are a fallback until a search result is opened and
    // its TVDB external ID is available.
    const libraryStates = new Map<string, string>();
    if (library.status === 'fulfilled') {
        for (const item of library.value.items) {
            if (item.type === 'movie' && item.tmdbId) {
                libraryStates.set(`movie:${item.tmdbId}`, item.state);
            }
            if (item.type === 'show') {
                if (item.tvdbId) libraryStates.set(`show:tvdb:${item.tvdbId}`, item.state);
                libraryStates.set(`show:title:${item.title.trim().toLowerCase()}`, item.state);
            }
        }
    }

    return {
        tmdbConfigured: tmdbConfigured(),
        trending: trending.status === 'fulfilled' ? trending.value.results.slice(0, 18) : [],
        libraryStates: Object.fromEntries(libraryStates)
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
