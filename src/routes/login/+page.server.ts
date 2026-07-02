import { fail, redirect } from '@sveltejs/kit';

import {
    SESSION_COOKIE,
    clearLoginFailures,
    createSessionToken,
    loginRateLimited,
    recordLoginFailure,
    verifyPassword
} from '$lib/server/auth';

import type { Actions, PageServerLoad } from './$types';

function sanitizeNext(raw: string | null): string {
    // Only allow same-origin absolute paths to prevent open redirects.
    if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
    return raw;
}

export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.authenticated) {
        redirect(303, sanitizeNext(url.searchParams.get('next')));
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies, url, getClientAddress }) => {
        let address = 'unknown';
        try {
            address = getClientAddress();
        } catch {
            // adapter may not resolve an address (e.g. during tests)
        }

        if (loginRateLimited(address)) {
            return fail(429, { message: 'Too many attempts. Try again in a few minutes.' });
        }

        const form = await request.formData();
        const password = form.get('password');

        if (typeof password !== 'string' || !verifyPassword(password)) {
            recordLoginFailure(address);
            return fail(400, { message: 'Incorrect password.' });
        }

        clearLoginFailures(address);
        const { token, maxAge } = createSessionToken();
        cookies.set(SESSION_COOKIE, token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: url.protocol === 'https:',
            maxAge
        });

        redirect(303, sanitizeNext(url.searchParams.get('next')));
    }
};
