import { redirect, type Handle } from '@sveltejs/kit';

import { SESSION_COOKIE, verifySessionToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.authenticated = verifySessionToken(event.cookies.get(SESSION_COOKIE));

    const isProtected = event.route.id?.startsWith('/(app)');
    if (isProtected && !event.locals.authenticated) {
        const next = encodeURIComponent(event.url.pathname + event.url.search);
        redirect(303, `/login?next=${next}`);
    }

    return resolve(event);
};
