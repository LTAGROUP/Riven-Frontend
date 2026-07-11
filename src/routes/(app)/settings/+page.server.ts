import { SettingsQuery } from '$lib/graphql/operations/system';
import { getCapabilities } from '$lib/server/capabilities';
import { execute } from '$lib/server/graphql-client';
import { getEnv, tmdbConfigured } from '$lib/server/env';
import { clearRedisCache, restartRiven } from '$lib/server/docker';
import { fail } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

function dockerFailure(cause: unknown, fallback: string) {
    const detail = cause instanceof Error ? cause.message : fallback;
    return fail(500, { message: detail });
}

export const actions: Actions = {
    restart: async () => {
        try {
            await restartRiven();
            return { message: 'Riven restarted successfully' };
        } catch (cause) {
            return dockerFailure(cause, 'Failed to restart Riven');
        }
    },
    clearCache: async () => {
        try {
            await clearRedisCache();
            return { message: 'Redis cache cleared successfully' };
        } catch (cause) {
            return dockerFailure(cause, 'Failed to clear Redis cache');
        }
    }
};

export const load: PageServerLoad = async () => {
    const capabilities = await getCapabilities();

    let live: { version: string; logLevel: string } | null = null;
    if (capabilities.hasSettingsQuery) {
        try {
            const result = await execute(SettingsQuery);
            live = result.settings.riven;
        } catch {
            live = null;
        }
    }

    return {
        live,
        frontend: {
            backendGraphqlUrl: getEnv().BACKEND_GRAPHQL_URL,
            tmdbConfigured: tmdbConfigured()
        }
    };
};
