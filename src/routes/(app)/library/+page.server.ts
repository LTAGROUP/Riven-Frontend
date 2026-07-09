import { fail } from '@sveltejs/kit';

import { ResetMediaItemMutation } from '$lib/graphql/operations/media';
import { execute } from '$lib/server/graphql-client';
import { getLibraryPage } from '$lib/server/library';

import type { Actions, PageServerLoad } from './$types';

const PAGE_SIZE = 100;

export const load: PageServerLoad = async ({ url }) => {
    const search = url.searchParams.get('q')?.trim() ?? '';
    const type = url.searchParams.get('type') ?? 'primary';
    const state = url.searchParams.get('state') ?? 'all';
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '', 10) || 1);

    const result = await getLibraryPage({ search, type, state, page, pageSize: PAGE_SIZE });
    return {
        items: result.items,
        total: result.total,
        source: result.source,
        loadError: result.error,
        filters: { search, type, state },
        page,
        pageSize: PAGE_SIZE
    };
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
