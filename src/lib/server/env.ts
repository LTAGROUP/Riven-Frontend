import { env as dynamicEnv } from '$env/dynamic/private';
import { building } from '$app/environment';
import { z } from 'zod';

const EnvSchema = z.object({
    FRONTEND_PASSWORD: z.string().min(1, 'FRONTEND_PASSWORD must be set'),
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
    BACKEND_GRAPHQL_URL: z.url().default('http://localhost:3000/'),
    TMDB_READ_ACCESS_TOKEN: z
        .string()
        .optional()
        .transform((v) => (v === '' ? undefined : v))
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

/**
 * Validated private environment. Read lazily (not at module load) so that
 * `vite build` succeeds without runtime secrets present.
 */
export function getEnv(): Env {
    if (building) {
        // Never read real env during prerender/build analysis.
        return {
            FRONTEND_PASSWORD: 'build',
            AUTH_SECRET: 'build-secret-build-secret-build-secret',
            BACKEND_GRAPHQL_URL: 'http://localhost:3000/',
            TMDB_READ_ACCESS_TOKEN: undefined
        };
    }
    if (!cached) {
        const parsed = EnvSchema.safeParse(dynamicEnv);
        if (!parsed.success) {
            const issues = parsed.error.issues
                .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
                .join('\n');
            throw new Error(`Invalid environment configuration:\n${issues}`);
        }
        cached = parsed.data;
    }
    return cached;
}

export function tmdbConfigured(): boolean {
    return Boolean(getEnv().TMDB_READ_ACCESS_TOKEN);
}
