import { getCapabilities } from '$lib/server/capabilities';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    return {
        capabilities: await getCapabilities()
    };
};
