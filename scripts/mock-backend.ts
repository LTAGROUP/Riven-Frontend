/**
 * Mock riven-ts backend for local development, served with graphql-yoga.
 *
 * - Serves the vendored schema (schema/schema.graphql) so frontend operations
 *   are validated against exactly what we codegen from.
 * - `seerrHandleWebhook` validates payloads with the SAME Zod rules as the real
 *   backend (copied from packages/plugin-seerr/lib/schemas/webhook-input.schema.ts),
 *   so the request flow is contract-tested locally.
 * - MOCK_PLUGINS=none strips plugin fields to exercise capability degradation.
 *
 * Usage: pnpm mock   (listens on http://localhost:3999/)
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { GraphQLError } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { z } from 'zod';

import { createFixtures, vfsIsDirectory, vfsTree, type MockItem } from './mock-fixtures.ts';

const PORT = Number(process.env.MOCK_PORT ?? 3999);
const PLUGINS_ENABLED = process.env.MOCK_PLUGINS !== 'none';
// Simulates the upstream riven-ts bug where interface/union type resolution
// fails (https://github.com/rivenmedia/riven-ts): MOCK_BROKEN_MEDIAITEMS=1
const BROKEN_MEDIA_ITEMS = process.env.MOCK_BROKEN_MEDIAITEMS === '1';
// Simulates riven-ts applying a reset but failing to serialize the *reply*
// ("Collection<Stream> ... not initialized"): MOCK_BROKEN_RESET=1
const BROKEN_RESET = process.env.MOCK_BROKEN_RESET === '1';
// GraphQLError so yoga doesn't mask the message ("Unexpected error.") — the
// real backend (Apollo) sends these messages through verbatim.
const upstreamBugError = () =>
    new GraphQLError(
        'Cannot resolve type for interface MediaItem! You need to return instance of object type class, not a plain object!'
    );

const items = createFixtures();

// ── Seerr webhook validation, copied verbatim from riven-ts ────────────────
const TestNotification = z.object({
    notification_type: z.literal('TEST_NOTIFICATION')
});

const WebhookNotification = z
    .object({
        notification_type: z.enum([
            'NONE',
            'MEDIA_PENDING',
            'MEDIA_APPROVED',
            'MEDIA_AVAILABLE',
            'MEDIA_FAILED',
            'MEDIA_DECLINED',
            'MEDIA_AUTO_APPROVED',
            'ISSUE_CREATED',
            'ISSUE_COMMENT',
            'ISSUE_RESOLVED',
            'ISSUE_REOPENED',
            'MEDIA_AUTO_REQUESTED'
        ]),
        media: z.object({
            media_type: z.enum(['movie', 'tv']),
            imdbId: z.string().transform((val) => (val === '' ? null : val)),
            tmdbId: z.string().transform((val) => (val === '' ? null : val)),
            tvdbId: z.string().transform((val) => (val === '' ? null : val))
        }),
        request: z.object({
            request_id: z.string(),
            requestedBy_email: z.string()
        }),
        extra: z.array(
            z.object({
                name: z.string(),
                value: z.string()
            })
        )
    })
    .transform((val) => {
        const requestedSeasons = val.extra
            .find((extra) => extra.name.toLowerCase() === 'requested seasons')
            ?.value.split(',')
            .map((s) => parseInt(s.trim(), 10));
        return { ...val, requestedSeasons };
    });

const WebhookInput = z.discriminatedUnion('notification_type', [
    TestNotification,
    WebhookNotification
]);
// ────────────────────────────────────────────────────────────────────────────

function typeName(item: MockItem): string {
    return { movie: 'Movie', show: 'Show', season: 'Season', episode: 'Episode' }[item.type];
}

function fileTypeName(entry: { type: string }): string {
    return entry.type === 'media' ? 'MediaEntry' : 'SubtitleEntry';
}

function children(item: MockItem): MockItem[] {
    return (item.childIds ?? [])
        .map((id) => items.get(id))
        .filter((child): child is MockItem => Boolean(child))
        .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

function decorate(item: MockItem): Record<string, unknown> {
    return {
        ...item,
        __typename: typeName(item),
        expectedFileCount:
            item.type === 'movie' || item.type === 'episode' ? 1 : children(item).length,
        filesystemEntries: item.filesystemEntries.map((entry) => ({
            ...entry,
            __typename: fileTypeName(entry),
            mediaItem: () => decorate(item)
        })),
        subtitles: [],
        streams: item.streams,
        activeStream: item.activeStream,
        blacklistedStreams: item.blacklistedStreams.map((blacklisted) => ({
            ...blacklisted,
            mediaItem: () => decorate(item)
        })),
        seasons: ({ includeSpecials }: { includeSpecials?: boolean } = {}) =>
            children(item)
                .filter((season) => includeSpecials || season.number !== 0)
                .map(decorate),
        requestedSeasons: () => children(item).map(decorate),
        episodes: () => children(item).map(decorate),
        totalEpisodes: () => children(item).length,
        show: () => {
            const parent = item.parentId ? items.get(item.parentId) : undefined;
            return parent ? decorate(parent) : null;
        },
        season: () => {
            const parent = item.parentId ? items.get(item.parentId) : undefined;
            return parent ? decorate(parent) : null;
        },
        lookupKeys: () => [`abs:${item.absoluteNumber ?? 0}`],
        status: item.status ?? null,
        runtime: item.runtime ?? null
    };
}

function resetItem(item: MockItem, reset: MockItem[]): void {
    item.state = 'indexed';
    item.scrapedAt = null;
    item.scrapedTimes = 0;
    item.failedScrapeAttempts = 0;
    item.streams = [];
    item.activeStream = null;
    item.filesystemEntries = [];
    reset.push(item);
    for (const child of children(item)) resetItem(child, reset);
}

const pluginResolvers = PLUGINS_ENABLED
    ? {
          Query: {
              tmdbIsValid: () => true,
              tvdbIsValid: () => true,
              seerrIsValid: () => true
          },
          Mutation: {
              seerrHandleWebhook: (_: unknown, args: { input: { payload: unknown } }) => {
                  const parsed = WebhookInput.safeParse(args.input.payload);
                  if (!parsed.success) {
                      console.error(
                          '[mock] seerrHandleWebhook INVALID payload:',
                          JSON.stringify(parsed.error.issues, null, 2)
                      );
                      throw new Error(
                          `Invalid webhook payload: ${parsed.error.issues[0]?.message}`
                      );
                  }
                  console.log(
                      '[mock] seerrHandleWebhook accepted:',
                      JSON.stringify(parsed.data, null, 2)
                  );
                  return true;
              }
          }
      }
    : { Query: {}, Mutation: {} };

let schemaSdl = readFileSync(new URL('../schema/schema.graphql', import.meta.url), 'utf-8');
if (!PLUGINS_ENABLED) {
    // Strip plugin-provided fields to simulate a backend without the plugins.
    schemaSdl = schemaSdl
        .replace(/^\s*(tmdb|tvdb|seerr)IsValid: Boolean!$/gm, '')
        .replace(/^\s*seerrHandleWebhook\(input: SeerrHandleWebhookInput!\): Boolean!$/gm, '')
        .replace(/^input SeerrHandleWebhookInput \{[^}]*\}/m, '');
}

const yoga = createYoga({
    graphqlEndpoint: '/',
    landingPage: false,
    schema: createSchema({
        typeDefs: schemaSdl,
        resolvers: {
            MediaItemUnion: {
                __resolveType: (obj: { __typename: string }) => obj.__typename
            },
            FileSystemEntryUnion: {
                __resolveType: (obj: { __typename: string }) => obj.__typename
            },
            MediaItem: {
                __resolveType: (obj: { __typename: string }) => obj.__typename
            },
            ShowLikeMediaItem: {
                __resolveType: (obj: { __typename: string }) => obj.__typename
            },
            Query: {
                mediaItems: () => {
                    if (BROKEN_MEDIA_ITEMS) throw upstreamBugError();
                    // The real backend caps this query at 25 rows and mixes in
                    // seasons/episodes — replicate both quirks.
                    return [...items.values()].slice(0, 25).map(decorate);
                },
                mediaItemById: (_: unknown, { id }: { id: string }) => {
                    if (BROKEN_MEDIA_ITEMS) throw upstreamBugError();
                    const item = items.get(id);
                    if (!item) throw new Error(`MediaItem ${id} not found`);
                    return decorate(item);
                },
                episode: () => null,
                settings: () => ({
                    riven: { version: '1.0.0', apiKey: '1234', logLevel: 'SILLY' }
                }),
                vfsDirectoryEntryPaths: (_: unknown, { path }: { path: string }) => {
                    const entries = vfsTree[path.replace(/\/+$/, '') || '/'];
                    if (!entries) throw new Error(`Directory not found: ${path}`);
                    return entries;
                },
                vfsEntryStat: (_: unknown, { path }: { path: string }) => ({
                    mtime: new Date().toISOString(),
                    ctime: new Date().toISOString(),
                    atime: new Date().toISOString(),
                    mode: vfsIsDirectory(path) ? 0o40555 : 0o100444,
                    nlink: 1,
                    size: vfsIsDirectory(path) ? 0 : 3_200_000_000,
                    uid: 1000,
                    gid: 1000
                }),
                vfsEntry: () => null,
                ...pluginResolvers.Query
            },
            Mutation: {
                resetMediaItem: (_: unknown, { id }: { id: string }) => {
                    const item = items.get(id);
                    if (!item) throw new Error(`MediaItem ${id} not found`);
                    const reset: MockItem[] = [];
                    resetItem(item, reset);
                    console.log(
                        `[mock] resetMediaItem: ${item.title} (+${reset.length - 1} children)`
                    );
                    if (BROKEN_RESET) {
                        // Reset has been applied above — fail only the reply,
                        // like riven-ts does.
                        throw new GraphQLError(
                            `Collection<Stream> of entity ${item.type === 'movie' ? 'Movie' : 'Show'}[${item.id}] not initialized`
                        );
                    }
                    return reset.map(decorate);
                },
                saveStreamUrl: (_: unknown, { id, url }: { id: string; url: string }) => {
                    for (const item of items.values()) {
                        const entry = item.filesystemEntries.find((e) => e.id === id);
                        if (entry) {
                            entry.streamPermalink = url;
                            return {
                                ...entry,
                                __typename: 'MediaEntry',
                                mediaItem: () => decorate(item)
                            };
                        }
                    }
                    throw new Error(`MediaEntry ${id} not found`);
                },
                shareLogs: () => 'mock-log-session-42',
                ...pluginResolvers.Mutation
            }
        }
    })
});

const server = createServer(yoga);
server.listen(PORT, () => {
    console.log(
        `Mock riven-ts backend on http://localhost:${PORT}/ (plugins ${PLUGINS_ENABLED ? 'enabled' : 'DISABLED'})`
    );
});
