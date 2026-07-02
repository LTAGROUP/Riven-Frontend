import { MEDIA_ITEM_STATES, type MediaItemState } from './states';

export interface LibraryItemLike {
    type: string;
    state: string;
}

export interface LibraryStats {
    total: number;
    byType: Record<string, number>;
    byState: Record<MediaItemState, number>;
    completedPercent: number;
}

/**
 * Client-side stats over whatever `mediaItems` returned. The backend currently
 * caps the query at 25 rows, so these are "latest N" figures — the UI labels
 * them accordingly.
 */
export function computeLibraryStats(items: LibraryItemLike[]): LibraryStats {
    const byType: Record<string, number> = {};
    const byState = Object.fromEntries(MEDIA_ITEM_STATES.map((s) => [s, 0])) as Record<
        MediaItemState,
        number
    >;

    for (const item of items) {
        byType[item.type] = (byType[item.type] ?? 0) + 1;
        if (item.state in byState) {
            byState[item.state as MediaItemState] += 1;
        }
    }

    const done = byState.completed + byState.partially_completed;
    return {
        total: items.length,
        byType,
        byState,
        completedPercent: items.length ? Math.round((done / items.length) * 100) : 0
    };
}
