import { fail } from '@sveltejs/kit';

import { BackendError, executeForConsole } from '$lib/server/graphql-client';

import type { Actions } from './$types';

export const actions: Actions = {
    run: async ({ request }) => {
        const form = await request.formData();
        const query = String(form.get('query') ?? '').trim();
        const variablesText = String(form.get('variables') ?? '').trim();

        if (!query) {
            return fail(400, {
                query,
                variables: variablesText,
                message: 'Enter a query or mutation to run'
            });
        }

        let variables: Record<string, unknown> | undefined;
        if (variablesText) {
            try {
                variables = JSON.parse(variablesText) as Record<string, unknown>;
            } catch {
                return fail(400, {
                    query,
                    variables: variablesText,
                    message: 'Variables must be valid JSON (e.g. {"id": "…"})'
                });
            }
        }

        const startedAt = Date.now();
        try {
            const response = await executeForConsole(query, variables);
            return {
                query,
                variables: variablesText,
                status: response.status,
                response: JSON.stringify(response.body, null, 2),
                hasErrors: Boolean(
                    typeof response.body === 'object' &&
                        response.body !== null &&
                        'errors' in response.body &&
                        response.body.errors
                ),
                durationMs: Date.now() - startedAt
            };
        } catch (cause) {
            return fail(502, {
                query,
                variables: variablesText,
                message:
                    cause instanceof BackendError ? cause.message : 'Failed to reach the backend'
            });
        }
    }
};
