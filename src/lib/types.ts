/** Feature support detected from the backend schema at runtime (shared client/server). */
export interface Capabilities {
    backendReachable: boolean;
    /** Requesting media works via the seerr plugin's webhook mutation. */
    hasSeerrWebhook: boolean;
    hasResetMediaItem: boolean;
    hasSaveStreamUrl: boolean;
    hasShareLogs: boolean;
    hasSettingsQuery: boolean;
    hasVfs: boolean;
    // Not implemented by riven-ts yet — drive the disabled action buttons and
    // light up automatically once the backend grows these mutations.
    hasDeleteMediaItem: boolean;
    hasPauseMediaItem: boolean;
    hasRetryMediaItem: boolean;
    /** True once `mediaItems` accepts arguments (pagination/filtering). */
    hasMediaItemsPagination: boolean;
    /** Plugin names derived from `<name>IsValid` query fields. */
    plugins: string[];
}
