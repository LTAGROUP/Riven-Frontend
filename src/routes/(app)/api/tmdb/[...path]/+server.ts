import { error, json } from '@sveltejs/kit';

import { TmdbError, tmdb } from '$lib/server/tmdb';

import type { RequestHandler } from './$types';

// Only proxy the read-only endpoints the UI actually uses.
const ALLOWED_PATHS = [
    /^trending\/(movie|tv)\/(day|week)$/,
    /^search\/(multi|movie|tv)$/,
    /^movie\/\d+$/,
    /^movie\/\d+\/external_ids$/,
    /^tv\/\d+$/,
    /^tv\/\d+\/external_ids$/,
    /^tv\/\d+\/season\/\d+$/,
    /^discover\/(movie|tv)$/,
    /^configuration$/
];

export const GET: RequestHandler = async ({ params, url }) => {
    const path = params.path.replace(/\/+$/, '');
    if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
        error(404, 'Not proxied');
    }

    const query: Record<string, string> = {};
    for (const [key, value] of url.searchParams) query[key] = value;

    try {
        const body = await tmdb<unknown>(path, query);
        return json(body, {
            headers: {
                'cache-control': path === 'configuration' ? 'max-age=86400' : 'max-age=300'
            }
        });
    } catch (cause) {
        if (cause instanceof TmdbError) {
            error(cause.status === 503 ? 503 : 502, cause.message);
        }
        error(502, 'TMDB request failed');
    }
};
