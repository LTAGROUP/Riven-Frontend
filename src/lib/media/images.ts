const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type PosterSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';

/**
 * Builds a TMDB image URL from a path such as "/abc123.jpg".
 * riven-ts stores TMDB paths in `posterPath`; TMDB API responses use the same format.
 */
export function tmdbImage(
    path: string | null | undefined,
    size: PosterSize = 'w342'
): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? '' : '/'}${path}`;
}
