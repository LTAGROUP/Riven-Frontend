import { error, fail } from '@sveltejs/kit';

import {
    MediaItemByIdQuery,
    ResetMediaItemMutation,
    SaveStreamUrlMutation
} from '$lib/graphql/operations/media';
import { BackendError, execute } from '$lib/server/graphql-client';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const result = await execute(MediaItemByIdQuery, { id: params.id });
        return { item: result.mediaItemById };
    } catch (cause) {
        if (cause instanceof BackendError && cause.kind === 'unreachable') {
            error(503, 'Backend unreachable');
        }
        error(404, 'Media item not found');
    }
};

export const actions: Actions = {
    reset: async ({ params }) => {
        try {
            await execute(ResetMediaItemMutation, { id: params.id });
            return { message: 'Item reset — it will be re-processed from scratch.' };
        } catch (cause) {
            return fail(500, {
                message: cause instanceof BackendError ? cause.message : 'Reset failed'
            });
        }
    },
    saveStreamUrl: async ({ request }) => {
        const form = await request.formData();
        const entryId = String(form.get('entryId') ?? '');
        const url = String(form.get('url') ?? '').trim();
        if (!entryId || !url) {
            return fail(400, { message: 'A media file and URL are required' });
        }
        try {
            await execute(SaveStreamUrlMutation, { id: entryId, url });
            return { message: 'Stream URL saved.' };
        } catch (cause) {
            return fail(500, {
                message: cause instanceof BackendError ? cause.message : 'Saving stream URL failed'
            });
        }
    }
};
