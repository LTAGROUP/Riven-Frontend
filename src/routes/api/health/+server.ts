import { json } from '@sveltejs/kit';

import { getCapabilities } from '$lib/server/capabilities';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const capabilities = await getCapabilities();
    return json({
        status: 'ok',
        backendReachable: capabilities.backendReachable
    });
};
