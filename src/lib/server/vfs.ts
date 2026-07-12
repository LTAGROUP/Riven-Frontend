import { VfsDirQuery, VfsEntryQuery, VfsStatQuery } from '$lib/graphql/operations/system';

import { execute } from './graphql-client';

interface MediaItemReference {
    id: string;
    type: string;
    tmdbId?: string;
    tvdbId?: string;
    showTvdbId?: string;
}

export interface VfsMediaFile {
    id: string;
    type: string;
    fileSize: number;
    createdAt: string;
    updatedAt: string | null;
    originalFilename: string;
}

const DIRECTORY_MODE_MASK = 0o170000;
const DIRECTORY_MODE = 0o040000;
const MAX_DIRECTORIES = 100;
const MAX_FILES = 500;

function absoluteEntryPath(directory: string, entry: string): string {
    const normalizedEntry = entry.replace(/\\/g, '/');
    if (normalizedEntry.startsWith('/')) return normalizedEntry;

    const base = directory === '/' ? '' : directory.replace(/\/+$/, '');
    return `${base}/${normalizedEntry.replace(/^\/+/, '')}`;
}

function mediaRootMarker(item: MediaItemReference): string | null {
    if (item.type === 'movie' && item.tmdbId) return `{tmdb-${item.tmdbId}}`;
    // Show VFS roots use the series TVDB id. Episode.tvdbId identifies the
    // episode itself, so use the parent show's id when resolving its files.
    if (item.type !== 'movie' && (item.showTvdbId || item.tvdbId)) {
        return `{tvdb-${item.showTvdbId || item.tvdbId}}`;
    }
    return null;
}

/**
 * Resolves the original names for a media item's file entries through the
 * existing VFS API. The media-item query only returns generic filesystem
 * metadata, while VFS MediaEntry records include the original filename and
 * the owning media item.
 */
export async function getVfsFilesForItem(item: MediaItemReference): Promise<VfsMediaFile[]> {
    const marker = mediaRootMarker(item);
    if (!marker) return [];

    try {
        const root = item.type === 'movie' ? '/movies' : '/shows';
        const rootEntries = await execute(VfsDirQuery, { path: root });
        const mediaRootEntry = rootEntries.vfsDirectoryEntryPaths.find((path) =>
            path.toLowerCase().includes(marker.toLowerCase())
        );
        if (!mediaRootEntry) return [];
        const mediaRoot = absoluteEntryPath(root, mediaRootEntry);

        const files: VfsMediaFile[] = [];
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
                children.vfsDirectoryEntryPaths.map(async (entryPath) => {
                    if (filesVisited >= MAX_FILES) return;

                    try {
                        const path = absoluteEntryPath(directory, entryPath);
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
                            files.push({
                                id: entry.id,
                                type: entry.type,
                                fileSize: entry.fileSize,
                                createdAt: entry.createdAt,
                                updatedAt: entry.updatedAt ?? null,
                                originalFilename: entry.originalFilename
                            });
                        }
                    } catch {
                        // A stale VFS path should not prevent the media page from rendering.
                    }
                })
            );
        }

        await walk(mediaRoot);
        return files;
    } catch {
        // VFS is optional and can be unavailable independently of GraphQL media details.
        return [];
    }
}

export async function getVfsFileNamesForItem(
    item: MediaItemReference
): Promise<Record<string, string>> {
    return Object.fromEntries(
        (await getVfsFilesForItem(item)).map((file) => [file.id, file.originalFilename])
    );
}
