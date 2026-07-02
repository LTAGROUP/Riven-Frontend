export const MEDIA_ITEM_STATES = [
    'unknown',
    'unreleased',
    'ongoing',
    'indexed',
    'scraped',
    'downloaded',
    'completed',
    'partially_completed',
    'failed',
    'paused'
] as const;

export type MediaItemState = (typeof MEDIA_ITEM_STATES)[number];

export const STATE_LABELS: Record<MediaItemState, string> = {
    unknown: 'Unknown',
    unreleased: 'Unreleased',
    ongoing: 'Ongoing',
    indexed: 'Indexed',
    scraped: 'Scraped',
    downloaded: 'Downloaded',
    completed: 'Completed',
    partially_completed: 'Partial',
    failed: 'Failed',
    paused: 'Paused'
};

/** Tailwind classes per state, used by the StateBadge component. */
export const STATE_CLASSES: Record<MediaItemState, string> = {
    unknown: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    unreleased: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    ongoing: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    indexed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    scraped: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    downloaded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    partially_completed: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    paused: 'bg-orange-500/15 text-orange-400 border-orange-500/30'
};

/** States that are expected to change soon — pages poll while items are in these. */
export const TRANSITIONAL_STATES: MediaItemState[] = ['indexed', 'scraped', 'downloaded'];

export const TYPE_LABELS: Record<string, string> = {
    movie: 'Movie',
    show: 'Show',
    season: 'Season',
    episode: 'Episode'
};
