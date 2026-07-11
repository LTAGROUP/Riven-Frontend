import { error, fail } from '@sveltejs/kit';

import {
    MediaItemByIdQuery,
    ResetMediaItemMutation,
    SaveStreamUrlMutation
} from '$lib/graphql/operations/media';
import { dbConfigured, fetchItemDetailFromDb, type DbItemDetail } from '$lib/server/db';
import { BackendError, execute, isBrokenResponseError } from '$lib/server/graphql-client';
import { getVfsFileNamesForItem } from '$lib/server/vfs';
import { getCapabilities } from '$lib/server/capabilities';

import type { MediaItemByIdQuery as MediaItemByIdResult } from '$lib/graphql/generated/graphql';
import type { Actions, PageServerLoad } from './$types';

type ItemDetail = MediaItemByIdResult['mediaItemById'];

/**
 * Builds the same shape the GraphQL query returns from a database row, so the
 * page renders identically when the API's type resolution is broken upstream.
 * Streams/files data isn't available in this mode (empty lists).
 */
function synthesizeDetail(detail: DbItemDetail): ItemDetail {
    const { item } = detail;
    const typename = { movie: 'Movie', show: 'Show', season: 'Season', episode: 'Episode' }[
        item.type
    ];
    const stream = item.activeStreamInfoHash ? { infoHash: item.activeStreamInfoHash } : null;

    const base = {
        __typename: typename,
        id: item.id,
        type: item.type,
        title: item.title,
        fullTitle: item.fullTitle,
        imdbId: item.imdbId,
        posterPath: item.posterPath,
        state: item.state,
        releaseDate: item.releaseDate,
        year: item.year,
        genres: item.genres,
        rating: item.rating,
        network: item.network,
        country: item.country,
        language: item.language,
        isAnime: item.isAnime,
        indexedAt: item.indexedAt,
        scrapedAt: item.scrapedAt,
        scrapedTimes: item.scrapedTimes,
        failedScrapeAttempts: item.failedScrapeAttempts,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        activeStream: stream,
        streams: stream ? [stream] : [],
        blacklistedStreams: [],
        filesystemEntries: [],
        subtitles: []
    };

    const seasons = detail.seasons.map((season) => ({
        id: season.id,
        title: season.title,
        number: season.number,
        state: season.state,
        totalEpisodes: season.episodes.length,
        episodes: season.episodes
    }));

    switch (item.type) {
        case 'movie':
            return {
                ...base,
                tmdbId: item.tmdbId ?? '',
                runtime: item.runtime,
                movieContentRating: 'UNKNOWN'
            } as unknown as ItemDetail;
        case 'show':
            return {
                ...base,
                tvdbId: item.tvdbId ?? '',
                status: item.status,
                showContentRating: 'UNKNOWN',
                seasons
            } as unknown as ItemDetail;
        case 'season':
            return {
                ...base,
                tvdbId: item.tvdbId ?? '',
                number: item.number ?? 0,
                show: detail.parent
                    ? { id: detail.parent.id, title: detail.parent.title }
                    : { id: item.id, title: item.title },
                episodes: seasons[0]?.episodes ?? []
            } as unknown as ItemDetail;
        default:
            return {
                ...base,
                tvdbId: item.tvdbId ?? '',
                number: item.number ?? 0,
                absoluteNumber: item.absoluteNumber ?? 0,
                runtime: item.runtime,
                season: detail.parent
                    ? {
                          id: detail.parent.id,
                          number: detail.parent.number ?? 0,
                          show: { id: '', title: '' }
                      }
                    : { id: '', number: 0, show: { id: '', title: '' } }
            } as unknown as ItemDetail;
    }
}

export const load: PageServerLoad = async ({ params }) => {
    let graphqlFailure: BackendError | undefined;
    try {
        const result = await execute(MediaItemByIdQuery, { id: params.id });
        const item = result.mediaItemById;
        const capabilities = await getCapabilities();
        const fileNames =
            capabilities.hasVfs &&
            (item.__typename === 'Movie' || item.__typename === 'Episode') &&
            item.filesystemEntries.length > 0
                ? await getVfsFileNamesForItem({
                      id: item.id,
                      type: item.type,
                      tmdbId: item.__typename === 'Movie' ? item.tmdbId : undefined,
                      tvdbId: item.__typename === 'Episode' ? item.tvdbId : undefined,
                      showTvdbId:
                          item.__typename === 'Episode' ? item.season.show.tvdbId : undefined
                  })
                : {};
        return { item, limited: false, fileNames };
    } catch (cause) {
        if (cause instanceof BackendError) graphqlFailure = cause;
    }

    if (graphqlFailure?.kind === 'unreachable') {
        error(503, 'Backend unreachable');
    }

    // The API failed for a reachable backend — likely the upstream
    // "Cannot resolve type for interface MediaItem" bug. Serve basic
    // details from the database when configured.
    if (dbConfigured()) {
        try {
            const detail = await fetchItemDetailFromDb(params.id);
            if (detail) return { item: synthesizeDetail(detail), limited: true, fileNames: {} };
        } catch {
            // fall through to 404
        }
    }

    error(404, 'Media item not found');
};

export const actions: Actions = {
    reset: async ({ params }) => {
        try {
            await execute(ResetMediaItemMutation, { id: params.id });
            return { message: 'Item reset — it will be re-processed from scratch.' };
        } catch (cause) {
            // riven-ts often fails to serialize the mutation *reply* (broken
            // type resolution upstream) after the reset has already applied —
            // don't report that as a failure.
            if (isBrokenResponseError(cause)) {
                return {
                    message:
                        'Item reset — it will be re-processed from scratch. (riven-ts could not confirm due to a known bug, but the reset applies.)'
                };
            }
            return fail(500, {
                message: cause instanceof BackendError ? cause.message : 'Reset failed'
            });
        }
    },
    saveStreamUrl: async ({ request }) => {
        const form = await request.formData();
        const entryId = String(form.get('entryId') ?? '');
        const url = String(form.get('url') ?? '').trim();
        if (!entryId || !url) {
            return fail(400, { message: 'A media file and URL are required' });
        }
        try {
            await execute(SaveStreamUrlMutation, { id: entryId, url });
            return { message: 'Stream URL saved.' };
        } catch (cause) {
            return fail(500, {
                message: cause instanceof BackendError ? cause.message : 'Saving stream URL failed'
            });
        }
    }
};
