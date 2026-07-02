import { LibraryItemsQuery } from '$lib/graphql/operations/media';
import { execute } from '$lib/server/graphql-client';
import { tmdbConfigured } from '$lib/server/env';
import { tmdb, type TmdbPagedResponse } from '$lib/server/tmdb';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [library, trendingMovies, trendingShows] = await Promise.allSettled([
        execute(LibraryItemsQuery),
        tmdb<TmdbPagedResponse>('trending/movie/week'),
        tmdb<TmdbPagedResponse>('trending/tv/week')
    ]);

    const items = library.status === 'fulfilled' ? library.value.mediaItems : [];
    const recentlyAdded = items
        .filter((item) => item.type === 'movie' || item.type === 'show')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

    return {
        recentlyAdded,
        libraryError: library.status === 'rejected',
        tmdbConfigured: tmdbConfigured(),
        trendingMovies:
            trendingMovies.status === 'fulfilled' ? trendingMovies.value.results.slice(0, 15) : [],
        trendingShows:
            trendingShows.status === 'fulfilled' ? trendingShows.value.results.slice(0, 15) : []
    };
};
