import { getEnv } from '$lib/server/env';

const REQUEST_TIMEOUT_MS = 35_000;

async function managementRequest(path: '/restart' | '/clear-cache'): Promise<void> {
    const env = getEnv();
    const response = await fetch(new URL(path, env.RIVEN_MANAGEMENT_URL), {
        method: 'POST',
        headers: { authorization: `Bearer ${env.AUTH_SECRET}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(
            body?.message ?? `Management helper responded with HTTP ${response.status}`
        );
    }
}

export async function restartRiven(): Promise<void> {
    await managementRequest('/restart');
}

export async function clearRedisCache(): Promise<void> {
    await managementRequest('/clear-cache');
}
