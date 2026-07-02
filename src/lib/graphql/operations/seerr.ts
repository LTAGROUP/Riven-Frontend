import { graphql } from '../generated';

export const RequestViaSeerrMutation = graphql(`
    mutation RequestViaSeerr($payload: JSONObject!) {
        seerrHandleWebhook(input: { payload: $payload })
    }
`);

/**
 * Builds the exact webhook payload shape riven-ts's seerr plugin validates
 * (packages/plugin-seerr/lib/schemas/webhook-input.schema.ts):
 * - id fields are required strings, "" is treated as absent
 * - media_type is "movie" | "tv" (not "show")
 * - requested seasons travel in the `extra` array under "Requested Seasons"
 */
export function buildSeerrRequestPayload(options: {
    mediaType: 'movie' | 'tv';
    tmdbId?: string;
    tvdbId?: string;
    imdbId?: string;
    seasons?: number[];
    requestedBy?: string;
}): Record<string, unknown> {
    const extra: { name: string; value: string }[] = [];
    if (options.mediaType === 'tv' && options.seasons?.length) {
        extra.push({ name: 'Requested Seasons', value: options.seasons.join(',') });
    }

    return {
        notification_type: 'MEDIA_APPROVED',
        media: {
            media_type: options.mediaType,
            imdbId: options.imdbId ?? '',
            tmdbId: options.tmdbId ?? '',
            tvdbId: options.tvdbId ?? ''
        },
        request: {
            request_id: crypto.randomUUID(),
            requestedBy_email: options.requestedBy ?? 'riven-frontend@local'
        },
        extra
    };
}

/** Harmless payload accepted by the webhook — used for "test connection". */
export function buildSeerrTestPayload(): Record<string, unknown> {
    return { notification_type: 'TEST_NOTIFICATION' };
}
