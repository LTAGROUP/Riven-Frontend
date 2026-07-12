import { env as dynamicEnv } from '$env/dynamic/private';
import { building } from '$app/environment';
import { z } from 'zod';

const EnvSchema = z.object({
    FRONTEND_PASSWORD: z
        .string()
        .min(12, 'FRONTEND_PASSWORD must be at least 12 characters')
        .refine(
            (value) => value !== 'change-me',
            'FRONTEND_PASSWORD must not use the example value'
        ),
    AUTH_SECRET: z
        .string()
        .min(32, 'AUTH_SECRET must be at least 32 characters')
        .refine(
            (value) => value !== 'please-generate-a-random-secret-at-least-32-chars',
            'AUTH_SECRET must not use the public example value'
        ),
    BACKEND_GRAPHQL_URL: z.url().default('http://localhost:3000/'),
    TMDB_READ_ACCESS_TOKEN: z
        .string()
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
    // Optional read-only connection to riven-ts's own Postgres. Used as a
    // fallback for library listings while the backend's mediaItems query is
    // broken (https://github.com/rivenmedia/riven-ts — "Cannot resolve type
    // for interface MediaItem").
    RIVEN_DATABASE_URL: z
        .string()
        .optional()
        .transform((v) => (v === '' ? undefined : v)),
    RIVEN_MANAGEMENT_URL: z.url().optional().default('http://riven-management:3000')
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
            TMDB_READ_ACCESS_TOKEN: undefined,
            RIVEN_DATABASE_URL: undefined,
            RIVEN_MANAGEMENT_URL: 'http://riven-management:3000'
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
