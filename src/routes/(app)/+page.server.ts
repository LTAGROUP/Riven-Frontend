import { getLibraryItems } from '$lib/server/library';
import { tmdbConfigured } from '$lib/server/env';
import { tmdb, type TmdbPagedResponse } from '$lib/server/tmdb';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [library, trendingMovies, trendingShows] = await Promise.allSettled([
        getLibraryItems(),
        tmdb<TmdbPagedResponse>('trending/movie/week'),
        tmdb<TmdbPagedResponse>('trending/tv/week')
    ]);

    const result =
        library.status === 'fulfilled'
            ? library.value
            : { items: [], source: 'none' as const, error: 'Failed to load library' };

    const recentlyAdded = result.items
        .filter((item) => item.type === 'movie' || item.type === 'show')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

    return {
        recentlyAdded,
        libraryError: result.error !== null,
        tmdbConfigured: tmdbConfigured(),
        trendingMovies:
            trendingMovies.status === 'fulfilled' ? trendingMovies.value.results.slice(0, 15) : [],
        trendingShows:
            trendingShows.status === 'fulfilled' ? trendingShows.value.results.slice(0, 15) : []
    };
};
