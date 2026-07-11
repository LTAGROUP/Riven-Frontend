import { error } from '@sveltejs/kit';

import { VfsDirQuery, VfsStatQuery } from '$lib/graphql/operations/system';
import { getCapabilities } from '$lib/server/capabilities';
import { BackendError, execute } from '$lib/server/graphql-client';

import type { PageServerLoad } from './$types';

export interface VfsEntryRow {
    path: string;
    name: string;
    isDirectory: boolean;
    size: number | null;
    mtime: string | null;
}

const S_IFDIR = 0o040000;

function absoluteEntryPath(directory: string, entry: string): string {
    const normalizedEntry = entry.replace(/\\/g, '/');
    if (normalizedEntry.startsWith('/')) return normalizedEntry;

    const base = directory === '/' ? '' : directory.replace(/\/+$/, '');
    return `${base}/${normalizedEntry.replace(/^\/+/, '')}`;
}

export const load: PageServerLoad = async ({ params }) => {
    const capabilities = await getCapabilities();
    if (!capabilities.hasVfs) {
        return { path: '/', entries: [] as VfsEntryRow[], unsupported: true, loadError: null };
    }

    const path = '/' + (params.path ?? '').replace(/^\/+|\/+$/g, '');

    try {
        const dir = await execute(VfsDirQuery, { path });
        const entries = await Promise.all(
            dir.vfsDirectoryEntryPaths.map(async (rawEntryPath): Promise<VfsEntryRow> => {
                const entryPath = absoluteEntryPath(path, rawEntryPath);
                const name = entryPath.split('/').filter(Boolean).pop() ?? entryPath;
                try {
                    const stat = await execute(VfsStatQuery, { path: entryPath });
                    const mode = stat.vfsEntryStat.mode;
                    return {
                        path: entryPath,
                        name,
                        isDirectory: (mode & 0o170000) === S_IFDIR,
                        size: stat.vfsEntryStat.size,
                        mtime: stat.vfsEntryStat.mtime
                    };
                } catch {
                    // Heuristic when stat fails: extension-less paths are directories.
                    return {
                        path: entryPath,
                        name,
                        isDirectory: !/\.\w{2,4}$/.test(name),
                        size: null,
                        mtime: null
                    };
                }
            })
        );

        entries.sort((a, b) =>
            a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1
        );

        return { path, entries, unsupported: false, loadError: null };
    } catch (cause) {
        if (cause instanceof BackendError && cause.kind === 'unreachable') {
            return { path, entries: [], unsupported: false, loadError: cause.message };
        }
        error(404, `Directory not found: ${path}`);
    }
};
