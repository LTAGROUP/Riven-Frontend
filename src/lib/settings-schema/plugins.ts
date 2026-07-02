import type { PluginDef } from './types';

/**
 * Hand-ported from each riven-ts packages/plugin-<name>/lib/<name>-settings.schema.ts.
 * Env vars: RIVEN_PLUGIN_SETTING__<envPrefix>__<key>
 */
export const PLUGINS: PluginDef[] = [
    {
        name: 'tmdb',
        label: 'TMDB',
        description: 'Metadata provider for movies (always enabled).',
        envPrefix: 'REPO_PLUGIN_TMDB',
        permanent: true,
        settings: [
            {
                key: 'apiKey',
                kind: 'string',
                section: 'tmdb',
                description: 'Your TMDB API key (a shared default is built in).'
            }
        ]
    },
    {
        name: 'tvdb',
        label: 'TVDB',
        description: 'Metadata provider for shows (always enabled).',
        envPrefix: 'REPO_PLUGIN_TVDB',
        permanent: true,
        settings: [
            {
                key: 'apiKey',
                kind: 'string',
                section: 'tvdb',
                description: 'The TVDB API key used to request a token (a default is built in).'
            }
        ]
    },
    {
        name: 'seerr',
        label: 'Seerr',
        description:
            'Jellyseerr/Overseerr integration — also provides the request intake used by this UI.',
        envPrefix: 'REPO_PLUGIN_SEERR',
        settings: [
            {
                key: 'apiKey',
                kind: 'string',
                required: true,
                section: 'seerr',
                description: 'Your Seerr API key'
            },
            {
                key: 'url',
                kind: 'url',
                default: 'http://localhost:5055',
                section: 'seerr',
                description: 'Your Seerr instance URL'
            },
            {
                key: 'filter',
                kind: 'enum',
                default: 'approved',
                enumValues: [
                    'all',
                    'approved',
                    'available',
                    'pending',
                    'processing',
                    'unavailable',
                    'failed'
                ],
                section: 'seerr',
                description: 'Request status filter'
            },
            {
                key: 'updateIntervalSeconds',
                kind: 'int',
                default: 60,
                section: 'seerr',
                description:
                    'Interval in seconds to poll Seerr for content. Set to null (empty) when using the webhook.'
            },
            {
                key: 'autofixMetadataProviders',
                kind: 'bool',
                default: false,
                section: 'seerr',
                description: 'Automatically fix metadata provider settings in Seerr if incorrect'
            },
            {
                key: 'autofixWebhookBody',
                kind: 'bool',
                default: false,
                section: 'seerr',
                description:
                    'Automatically fix the webhook payload body and required notification types in Seerr'
            }
        ]
    },
    {
        name: 'stremthru',
        label: 'StremThru',
        description: 'Debrid downloader via a StremThru instance.',
        envPrefix: 'REPO_PLUGIN_STREMTHRU',
        settings: [
            {
                key: 'stremThruUrl',
                kind: 'url',
                default: 'https://stremthru.13377001.xyz/',
                section: 'stremthru',
                description: 'The URL of the StremThru instance to request'
            },
            {
                key: 'storePriority',
                kind: 'json',
                default: [
                    'realdebrid',
                    'alldebrid',
                    'debrider',
                    'debridlink',
                    'easydebrid',
                    'offcloud',
                    'pikpak',
                    'premiumize',
                    'torbox'
                ],
                section: 'stremthru',
                description: 'The priority order of stores to use (JSON array).'
            },
            ...(
                [
                    'realdebrid',
                    'alldebrid',
                    'debrider',
                    'debridlink',
                    'easydebrid',
                    'offcloud',
                    'pikpak',
                    'premiumize',
                    'torbox'
                ] as const
            ).map((store) => ({
                key: `${store}ApiKey`,
                kind: 'string' as const,
                section: 'stremthru',
                description: `${store} API key`
            }))
        ]
    },
    {
        name: 'torrentio',
        label: 'Torrentio',
        description: 'Torrentio scraper.',
        envPrefix: 'REPO_PLUGIN_TORRENTIO',
        settings: [
            {
                key: 'filter',
                kind: 'string',
                default: 'sort=qualitysize%7Cqualityfilter=threed,480p,scr,cam',
                section: 'torrentio',
                description: 'Torrentio filter query string'
            }
        ]
    },
    {
        name: 'comet',
        label: 'Comet',
        description: 'Comet scraper.',
        envPrefix: 'REPO_PLUGIN_COMET',
        settings: [
            {
                key: 'url',
                kind: 'url',
                default: 'https://comet.feels.legal',
                section: 'comet',
                description: 'The URL of the Comet instance to connect to.'
            }
        ]
    },
    {
        name: 'plex',
        label: 'Plex',
        description: 'Plex media server library updates.',
        envPrefix: 'REPO_PLUGIN_PLEX',
        settings: [
            {
                key: 'plexToken',
                kind: 'string',
                required: true,
                section: 'plex',
                description: 'Plex token for accessing the Plex API'
            },
            {
                key: 'plexServerUrl',
                kind: 'url',
                required: true,
                section: 'plex',
                placeholder: 'http://localhost:32400/',
                description: 'The URL of your Plex server'
            },
            {
                key: 'plexLibraryPath',
                kind: 'path',
                default: '/mount',
                section: 'plex',
                description: 'The start of Plex library paths, e.g. "/mount" in "/mount/movies"'
            }
        ]
    },
    {
        name: 'jellyfin',
        label: 'Jellyfin',
        description: 'Jellyfin media server library updates.',
        envPrefix: 'REPO_PLUGIN_JELLYFIN',
        settings: [
            {
                key: 'jellyfinToken',
                kind: 'string',
                required: true,
                section: 'jellyfin',
                description: 'Jellyfin token for accessing the Jellyfin API'
            },
            {
                key: 'jellyfinServerUrl',
                kind: 'url',
                required: true,
                section: 'jellyfin',
                placeholder: 'http://localhost:8096/',
                description: 'The URL of your Jellyfin server'
            },
            {
                key: 'jellyfinLibraryPath',
                kind: 'path',
                default: '/mount',
                section: 'jellyfin',
                description: 'The start of Jellyfin library paths, e.g. "/mount" in "/mount/movies"'
            }
        ]
    },
    {
        name: 'listrr',
        label: 'Listrr',
        description: 'Request content from Listrr lists.',
        envPrefix: 'REPO_PLUGIN_LISTRR',
        settings: [
            {
                key: 'apiKey',
                kind: 'string',
                required: true,
                section: 'listrr',
                description: 'Your Listrr API key'
            },
            {
                key: 'movieLists',
                kind: 'json',
                default: [],
                section: 'listrr',
                description: 'List of Listrr movie lists to request (JSON array)'
            },
            {
                key: 'showLists',
                kind: 'json',
                default: [],
                section: 'listrr',
                description: 'List of Listrr show lists to request (JSON array)'
            },
            {
                key: 'updateIntervalSeconds',
                kind: 'int',
                default: 86400,
                section: 'listrr',
                description: 'Interval in seconds to update content'
            }
        ]
    },
    {
        name: 'mdblist',
        label: 'MDBList',
        description: 'Request content from MDBList lists.',
        envPrefix: 'REPO_PLUGIN_MDBLIST',
        settings: [
            {
                key: 'apiKey',
                kind: 'string',
                required: true,
                section: 'mdblist',
                description: 'Your MDBList API key'
            },
            {
                key: 'lists',
                kind: 'json',
                default: [],
                section: 'mdblist',
                description: 'List of MDBList lists to request (JSON array)'
            },
            {
                key: 'updateIntervalSeconds',
                kind: 'int',
                default: 86400,
                section: 'mdblist',
                description: 'Interval in seconds to update content'
            }
        ]
    },
    {
        name: 'subdl',
        label: 'SubDL',
        description: 'Subtitle downloads via SubDL.',
        envPrefix: 'REPO_PLUGIN_SUBDL',
        settings: [
            {
                key: 'apiKey',
                kind: 'string',
                required: true,
                section: 'subdl',
                description: 'Your SubDL API key'
            },
            {
                key: 'languages',
                kind: 'json',
                default: ['en'],
                section: 'subdl',
                description: 'List of subtitle languages to download (JSON array)'
            }
        ]
    },
    {
        name: 'notifications',
        label: 'Notifications',
        description: 'Discord / webhook notifications for media events.',
        envPrefix: 'REPO_PLUGIN_NOTIFICATIONS',
        settings: [
            {
                key: 'urls',
                kind: 'json',
                required: true,
                section: 'notifications',
                placeholder: '["discord://id/token"]',
                description:
                    'Notification service URLs (JSON array, e.g. discord://id/token or json://host/path)'
            }
        ]
    }
];
