import { SettingsQuery } from '$lib/graphql/operations/system';
import { getCapabilities } from '$lib/server/capabilities';
import { execute } from '$lib/server/graphql-client';
import { getEnv, tmdbConfigured } from '$lib/server/env';

import type { PageServerLoad } from './$types';

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
