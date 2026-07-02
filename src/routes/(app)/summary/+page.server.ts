import { SettingsQuery } from '$lib/graphql/operations/system';
import { getCapabilities, getPluginHealth } from '$lib/server/capabilities';
import { execute } from '$lib/server/graphql-client';
import { getLibraryItems } from '$lib/server/library';
import { computeLibraryStats } from '$lib/media/stats';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const capabilities = await getCapabilities();

    const [library, settings, pluginHealth] = await Promise.allSettled([
        getLibraryItems(),
        capabilities.hasSettingsQuery ? execute(SettingsQuery) : Promise.resolve(null),
        getPluginHealth(capabilities.plugins)
    ]);

    const items = library.status === 'fulfilled' ? library.value.items : [];

    return {
        source: library.status === 'fulfilled' ? library.value.source : ('none' as const),
        stats: computeLibraryStats(items),
        recentFailures: items
            .filter((item) => item.state === 'failed')
            .slice(0, 10)
            .map((item) => ({ id: item.id, title: item.title, type: item.type })),
        backendVersion:
            settings.status === 'fulfilled'
                ? (settings.value?.settings.riven.version ?? null)
                : null,
        pluginHealth: pluginHealth.status === 'fulfilled' ? pluginHealth.value : {}
    };
};
