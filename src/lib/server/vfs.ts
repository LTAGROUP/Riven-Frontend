import { VfsDirQuery, VfsEntryQuery, VfsStatQuery } from '$lib/graphql/operations/system';

import { execute } from './graphql-client';

interface MediaItemReference {
    id: string;
    type: string;
    tmdbId?: string;
    tvdbId?: string;
}

const DIRECTORY_MODE_MASK = 0o170000;
const DIRECTORY_MODE = 0o040000;
const MAX_DIRECTORIES = 100;
const MAX_FILES = 500;

function mediaRootMarker(item: MediaItemReference): string | null {
    if (item.type === 'movie' && item.tmdbId) return `{tmdb-${item.tmdbId}}`;
    if (item.type !== 'movie' && item.tvdbId) return `{tvdb-${item.tvdbId}}`;
    return null;
}

/**
 * Resolves the original names for a media item's file entries through the
 * existing VFS API. The media-item query only returns generic filesystem
 * metadata, while VFS MediaEntry records include the original filename and
 * the owning media item.
 */
export async function getVfsFileNamesForItem(
    item: MediaItemReference
): Promise<Record<string, string>> {
    const marker = mediaRootMarker(item);
    if (!marker) return {};

    try {
        const root = item.type === 'movie' ? '/movies' : '/shows';
        const rootEntries = await execute(VfsDirQuery, { path: root });
        const mediaRoot = rootEntries.vfsDirectoryEntryPaths.find((path) =>
            path.toLowerCase().includes(marker.toLowerCase())
        );
        if (!mediaRoot) return {};

        const names: Record<string, string> = {};
        const visitedDirectories = new Set<string>();
        let directoriesVisited = 0;
        let filesVisited = 0;

        async function walk(directory: string): Promise<void> {
            if (
                visitedDirectories.has(directory) ||
                directoriesVisited >= MAX_DIRECTORIES ||
                filesVisited >= MAX_FILES
            ) {
                return;
            }
            visitedDirectories.add(directory);
            directoriesVisited += 1;

            const children = await execute(VfsDirQuery, { path: directory });
            await Promise.all(
                children.vfsDirectoryEntryPaths.map(async (path) => {
                    if (filesVisited >= MAX_FILES) return;

                    try {
                        const stat = await execute(VfsStatQuery, { path });
                        const isDirectory =
                            (stat.vfsEntryStat.mode & DIRECTORY_MODE_MASK) === DIRECTORY_MODE;
                        if (isDirectory) {
                            await walk(path);
                            return;
                        }

                        filesVisited += 1;
                        const result = await execute(VfsEntryQuery, { path });
                        const entry = result.vfsEntry;
                        if (entry?.__typename === 'MediaEntry' && entry.mediaItem.id === item.id) {
                            names[entry.id] = entry.originalFilename;
                        }
                    } catch {
                        // A stale VFS path should not prevent the media page from rendering.
                    }
                })
            );
        }

        await walk(mediaRoot);
        return names;
    } catch {
        // VFS is optional and can be unavailable independently of GraphQL media details.
        return {};
    }
}
