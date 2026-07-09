import { fail } from '@sveltejs/kit';

import { dbConfigured, listDbTables, runSql, type DbTable, type SqlResult } from '$lib/server/db';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    if (!dbConfigured()) {
        return { configured: false as const, tables: [] as DbTable[], tablesError: null };
    }

    try {
        return { configured: true as const, tables: await listDbTables(), tablesError: null };
    } catch (cause) {
        return {
            configured: true as const,
            tables: [] as DbTable[],
            tablesError: cause instanceof Error ? cause.message : String(cause)
        };
    }
};

export const actions: Actions = {
    run: async ({ request }) => {
        const form = await request.formData();
        const sql = String(form.get('sql') ?? '').trim();
        const readOnly = form.get('readOnly') !== 'false';

        if (!dbConfigured()) {
            return fail(503, { sql, readOnly, message: 'RIVEN_DATABASE_URL is not configured' });
        }
        if (!sql) {
            return fail(400, { sql, readOnly, message: 'Enter a SQL statement to run' });
        }

        const startedAt = Date.now();
        try {
            const results: SqlResult[] = await runSql(sql, { readOnly });
            return { sql, readOnly, results, durationMs: Date.now() - startedAt };
        } catch (cause) {
            return fail(400, {
                sql,
                readOnly,
                message: cause instanceof Error ? cause.message : String(cause)
            });
        }
    }
};
