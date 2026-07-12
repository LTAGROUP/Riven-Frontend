import { redirect, type Handle } from '@sveltejs/kit';

import { SESSION_COOKIE, verifySessionToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.authenticated = verifySessionToken(event.cookies.get(SESSION_COOKIE));

    const isProtected = event.route.id?.startsWith('/(app)');
    if (isProtected && !event.locals.authenticated) {
        const next = encodeURIComponent(event.url.pathname + event.url.search);
        redirect(303, `/login?next=${next}`);
    }

    const response = await resolve(event);
    response.headers.set('x-content-type-options', 'nosniff');
    response.headers.set('x-frame-options', 'DENY');
    response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
        'content-security-policy',
        "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'"
    );
    response.headers.set('cross-origin-opener-policy', 'same-origin');

    if (event.url.protocol === 'https:') {
        response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
    }
    if (event.route.id?.startsWith('/(app)')) {
        response.headers.set('cache-control', 'no-store');
    }

    return response;
};
