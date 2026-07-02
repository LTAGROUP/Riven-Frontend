import { createHmac, timingSafeEqual } from 'node:crypto';

import { getEnv } from './env';

export const SESSION_COOKIE = 'riven_session';
const SESSION_VERSION = 'v1';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function sign(payload: string): string {
    return createHmac('sha256', getEnv().AUTH_SECRET).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(candidate: string): boolean {
    return safeEqual(candidate, getEnv().FRONTEND_PASSWORD);
}

/** Session token format: `v1.<expiryEpochSeconds>.<hmac(v1.<expiry>)>` */
export function createSessionToken(now = Date.now()): {
    token: string;
    maxAge: number;
} {
    const expires = Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS;
    const payload = `${SESSION_VERSION}.${expires}`;
    return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_MAX_AGE_SECONDS };
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [version, expiresRaw, signature] = parts;
    if (version !== SESSION_VERSION) return false;
    const expires = Number.parseInt(expiresRaw, 10);
    if (!Number.isFinite(expires) || expires * 1000 < now) return false;
    return safeEqual(signature, sign(`${version}.${expiresRaw}`));
}

// Naive in-memory login rate limiter: 5 failures per 15 minutes per address.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

export function loginRateLimited(address: string, now = Date.now()): boolean {
    const recent = (failures.get(address) ?? []).filter((t) => now - t < WINDOW_MS);
    failures.set(address, recent);
    return recent.length >= MAX_FAILURES;
}

export function recordLoginFailure(address: string, now = Date.now()): void {
    const recent = (failures.get(address) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    failures.set(address, recent);
    // Bound the map so it cannot grow without limit.
    if (failures.size > 1000) {
        const oldestKey = failures.keys().next().value;
        if (oldestKey !== undefined) failures.delete(oldestKey);
    }
}

export function clearLoginFailures(address: string): void {
    failures.delete(address);
}
