import { fail } from '@sveltejs/kit';

import { ResetMediaItemMutation } from '$lib/graphql/operations/media';
import { execute } from '$lib/server/graphql-client';
import { getLibraryItems } from '$lib/server/library';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const result = await getLibraryItems();
    return { items: result.items, source: result.source, loadError: result.error };
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
