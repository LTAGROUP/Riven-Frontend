import { executeRaw } from './graphql-client';

import type { Capabilities } from '$lib/types';

export type { Capabilities };

export const OFFLINE_CAPABILITIES: Capabilities = {
    backendReachable: false,
    hasSeerrWebhook: false,
    hasResetMediaItem: false,
    hasSaveStreamUrl: false,
    hasShareLogs: false,
    hasSettingsQuery: false,
    hasVfs: false,
    hasDeleteMediaItem: false,
    hasPauseMediaItem: false,
    hasRetryMediaItem: false,
    hasMediaItemsPagination: false,
    plugins: []
};

const INTROSPECTION_QUERY = /* GraphQL */ `
    query FrontendCapabilities {
        __schema {
            queryType {
                fields {
                    name
                    args {
                        name
                    }
                }
            }
            mutationType {
                fields {
                    name
                }
            }
        }
    }
`;

interface IntrospectionResult {
    __schema: {
        queryType: { fields: { name: string; args: { name: string }[] }[] } | null;
        mutationType: { fields: { name: string }[] } | null;
    };
}

const CACHE_TTL_MS = 60_000;
let cache: { value: Capabilities; fetchedAt: number } | undefined;

export async function getCapabilities(force = false): Promise<Capabilities> {
    if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.value;
    }

    let value: Capabilities;
    try {
        const result = await executeRaw<IntrospectionResult>(INTROSPECTION_QUERY);
        const queryFields = result.__schema.queryType?.fields ?? [];
        const mutationFields = new Set(
            (result.__schema.mutationType?.fields ?? []).map((f) => f.name)
        );
        const queryNames = new Set(queryFields.map((f) => f.name));
        const mediaItemsField = queryFields.find((f) => f.name === 'mediaItems');

        value = {
            backendReachable: true,
            hasSeerrWebhook: mutationFields.has('seerrHandleWebhook'),
            hasResetMediaItem: mutationFields.has('resetMediaItem'),
            hasSaveStreamUrl: mutationFields.has('saveStreamUrl'),
            hasShareLogs: mutationFields.has('shareLogs'),
            hasSettingsQuery: queryNames.has('settings'),
            hasVfs: queryNames.has('vfsDirectoryEntryPaths'),
            hasDeleteMediaItem:
                mutationFields.has('deleteMediaItem') || mutationFields.has('removeMediaItem'),
            hasPauseMediaItem: mutationFields.has('pauseMediaItem'),
            hasRetryMediaItem: mutationFields.has('retryMediaItem'),
            hasMediaItemsPagination: (mediaItemsField?.args.length ?? 0) > 0,
            plugins: [...queryNames]
                .map((name) => /^(\w+)IsValid$/.exec(name)?.[1])
                .filter((name): name is string => Boolean(name))
                .sort()
        };
    } catch {
        value = OFFLINE_CAPABILITIES;
    }

    cache = { value, fetchedAt: Date.now() };
    return value;
}

/** Validity of each enabled plugin, each checked independently. */
export async function getPluginHealth(plugins: string[]): Promise<Record<string, boolean | null>> {
    const entries = await Promise.all(
        plugins.map(async (plugin): Promise<[string, boolean | null]> => {
            try {
                const result = await executeRaw<Record<string, boolean>>(
                    `query { valid: ${plugin}IsValid }`
                );
                return [plugin, result.valid];
            } catch {
                // A failing validity check throws server-side; report as unhealthy-unknown.
                return [plugin, null];
            }
        })
    );
    return Object.fromEntries(entries);
}
