import { fail } from '@sveltejs/kit';

import { ShareLogsMutation } from '$lib/graphql/operations/system';
import { BackendError, execute } from '$lib/server/graphql-client';

import type { Actions } from './$types';

export const actions: Actions = {
    share: async () => {
        try {
            const result = await execute(ShareLogsMutation);
            return { sessionId: result.shareLogs };
        } catch (cause) {
            return fail(500, {
                message: cause instanceof BackendError ? cause.message : 'Sharing logs failed'
            });
        }
    }
};
