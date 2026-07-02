import { fail } from '@sveltejs/kit';

import { LibraryItemsQuery, ResetMediaItemMutation } from '$lib/graphql/operations/media';
import { BackendError, execute } from '$lib/server/graphql-client';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const result = await execute(LibraryItemsQuery);
        return { items: result.mediaItems, loadError: null };
    } catch (error) {
        return {
            items: [],
            loadError: error instanceof BackendError ? error.message : 'Failed to load library'
        };
    }
};

export const actions: Actions = {
    reset: async ({ request }) => {
        const form = await request.formData();
        const ids = form.getAll('id').map(String).filter(Boolean);
        if (ids.length === 0) {
            return fail(400, { message: 'No items selected' });
        }

        const results = await Promise.allSettled(
            ids.map((id) => execute(ResetMediaItemMutation, { id }))
        );
        const failed = results.filter((r) => r.status === 'rejected').length;

        return {
            reset: ids.length - failed,
            failed,
            message:
                failed === 0
                    ? `Reset ${ids.length} item${ids.length === 1 ? '' : 's'}`
                    : `Reset ${ids.length - failed} item(s), ${failed} failed`
        };
    }
};
