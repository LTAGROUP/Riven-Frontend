import type { SettingDef } from './types';

/**
 * Hand-ported from riven-ts apps/riven/lib/riven-settings.schema.ts.
 * Values are read by the backend from `RIVEN_SETTING__<key>` env vars at startup.
 */
export const CORE_SETTINGS: SettingDef[] = [
    // ── database ────────────────────────────────────────────────────────
    {
        key: 'databaseUrl',
        kind: 'url',
        required: true,
        section: 'database',
        placeholder: 'postgresql://postgres:postgres@riven-db:5432/riven',
        description: 'The database connection URL.'
    },
    {
        key: 'redisUrl',
        kind: 'url',
        required: true,
        section: 'database',
        placeholder: 'redis://riven-cache:6379',
        description: 'The Redis server URL.'
    },
    {
        key: 'databaseDebugLogging',
        kind: 'bool',
        default: false,
        section: 'database',
        description: 'Enable debug logging for the database.'
    },
    {
        key: 'databaseSslRootCert',
        kind: 'path',
        section: 'database-ssl',
        description: 'The file path to the SSL root certificate for the database connection.'
    },
    {
        key: 'databaseSslCert',
        kind: 'path',
        section: 'database-ssl',
        description: 'The file path to the SSL certificate for the database connection.'
    },
    {
        key: 'databaseSslKey',
        kind: 'path',
        section: 'database-ssl',
        description: 'The file path to the SSL key for the database connection.'
    },

    // ── vfs ─────────────────────────────────────────────────────────────
    {
        key: 'vfsMountPath',
        kind: 'path',
        required: true,
        section: 'vfs',
        placeholder: '/mount',
        description: 'The mount point for the virtual file system.'
    },
    {
        key: 'vfsForceMount',
        kind: 'bool',
        default: true,
        section: 'vfs',
        description: 'If true, attempts to unmount the mount-point before remounting.'
    },
    {
        key: 'vfsDebugLogging',
        kind: 'bool',
        default: false,
        section: 'vfs',
        description: 'Enable debug logging for the virtual file system.'
    },

    // ── graphql ─────────────────────────────────────────────────────────
    {
        key: 'gqlHost',
        kind: 'string',
        default: 'localhost',
        section: 'graphql',
        placeholder: '0.0.0.0',
        description: 'The GraphQL server host. Use 0.0.0.0 inside Docker.'
    },
    {
        key: 'gqlPort',
        kind: 'int',
        default: 3000,
        section: 'graphql',
        description: 'The GraphQL server port.'
    },

    // ── logging ─────────────────────────────────────────────────────────
    {
        key: 'loggingEnabled',
        kind: 'bool',
        default: true,
        section: 'logging',
        description: 'Enable or disable logging for the application.'
    },
    {
        key: 'logLevel',
        kind: 'enum',
        default: 'info',
        enumValues: ['silly', 'debug', 'verbose', 'http', 'info', 'warn', 'error'],
        section: 'logging',
        description: 'The logging level for the application.'
    },
    {
        key: 'logDirectory',
        kind: 'path',
        default: './logs',
        section: 'logging',
        description: 'The directory where log files will be stored.'
    },
    {
        key: 'logShowStackTraces',
        kind: 'bool',
        default: true,
        section: 'logging',
        description: 'Whether to show detailed stack traces when logging errors.'
    },
    {
        key: 'enabledLogTransports',
        kind: 'json',
        default: ['console', 'file'],
        section: 'logging',
        description: 'The enabled logging transports (JSON array of "console" / "file").'
    },

    // ── scraping ────────────────────────────────────────────────────────
    {
        key: 'attemptUnknownDownloads',
        kind: 'bool',
        default: false,
        section: 'scraping',
        description:
            "If true, Riven will attempt to download torrents whose contents cannot be verified without first attempting to download. Note: enabling this degrades performance, but may help when plugins can't find requested items."
    },
    {
        key: 'dubbedAnimeOnly',
        kind: 'bool',
        default: false,
        section: 'scraping',
        description: 'Only scrape dubbed anime.'
    },
    {
        key: 'maximumScrapeAttempts',
        kind: 'int',
        section: 'scraping',
        placeholder: 'unlimited',
        description: 'The maximum number of scrape attempts before giving up on an item.'
    },
    {
        key: 'minimumAverageBitrateMovies',
        kind: 'int',
        section: 'scraping',
        description: 'The minimum average bitrate for movies.'
    },
    {
        key: 'minimumAverageBitrateEpisodes',
        kind: 'int',
        section: 'scraping',
        description: 'The minimum average bitrate for episodes.'
    },
    {
        key: 'preferSeasonPacks',
        kind: 'bool',
        default: false,
        section: 'scraping',
        description: 'If true, Riven will prefer to download season packs over show packs.'
    },
    {
        key: 'scrapeCooldownHours',
        kind: 'json',
        default: [2, 6, 24],
        section: 'scraping',
        description:
            'The cooldown periods (in hours) applied after failed scrape attempts, as [> 2 attempts, > 5 attempts, > 10 attempts].'
    },

    // ── scheduling ──────────────────────────────────────────────────────
    {
        key: 'scheduleOffsetMinutes',
        kind: 'int',
        default: 30,
        section: 'scheduling',
        description:
            "The number of minutes to wait after an item's air date before attempting to re-index it."
    },
    {
        key: 'unknownAirDateOffsetDays',
        kind: 'int',
        default: 7,
        section: 'scheduling',
        description:
            'When an episode has no air date, this number of days is added to the current date to estimate a release date for scheduling.'
    },

    // ── plugins ─────────────────────────────────────────────────────────
    {
        key: 'enabledPlugins',
        kind: 'json',
        default: [],
        section: 'plugins',
        description: 'A list of core plugins to enable (JSON array). tmdb and tvdb are always on.'
    },

    // ── ranking ─────────────────────────────────────────────────────────
    {
        key: 'rankingConfigPath',
        kind: 'path',
        default: './riven-ranking-config.json',
        section: 'ranking',
        description:
            'Path to the JSON file containing the torrent ranking configuration. Auto-generated with defaults on first startup.'
    },

    // ── misc / debugging ────────────────────────────────────────────────
    {
        key: 'shutdownTimeoutSeconds',
        kind: 'int',
        default: 30,
        section: 'debugging',
        description: 'The timeout in seconds for shutting down the application.'
    },
    {
        key: 'printConfigurationOnStartup',
        kind: 'bool',
        default: false,
        section: 'debugging',
        description:
            'Whether to print the effective configuration on application startup. Useful for debugging configuration issues.'
    },

    // ── danger zone ─────────────────────────────────────────────────────
    {
        key: 'unsafeWipeRedisOnStartup',
        kind: 'bool',
        default: false,
        unsafe: true,
        section: 'danger-zone',
        description: 'UNSAFE. If true, all Redis data will be removed on application startup.'
    },
    {
        key: 'unsafeWipeDatabaseOnStartup',
        kind: 'bool',
        default: false,
        unsafe: true,
        section: 'danger-zone',
        description: 'UNSAFE. If true, the database will be wiped on application startup.'
    }
];

export const CORE_SECTIONS: { id: string; label: string }[] = [
    { id: 'database', label: 'Database' },
    { id: 'database-ssl', label: 'Database SSL' },
    { id: 'vfs', label: 'Virtual file system' },
    { id: 'graphql', label: 'GraphQL server' },
    { id: 'logging', label: 'Logging' },
    { id: 'scraping', label: 'Scraping' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'debugging', label: 'Debugging' },
    { id: 'danger-zone', label: 'Danger zone' }
];
