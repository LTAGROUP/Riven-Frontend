/**
 * Refreshes schema/schema.graphql by introspecting a running riven-ts backend.
 *
 * Usage: BACKEND_GRAPHQL_URL=http://localhost:3000/ pnpm fetch-schema
 */
import { writeFileSync } from 'node:fs';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

const url = process.env.BACKEND_GRAPHQL_URL ?? 'http://localhost:3000/';

const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: getIntrospectionQuery() })
});

if (!response.ok) {
    console.error(`Backend responded with HTTP ${response.status}`);
    process.exit(1);
}

const body = (await response.json()) as { data?: never; errors?: { message: string }[] };
if (body.errors?.length || !body.data) {
    console.error('Introspection failed:', body.errors?.[0]?.message ?? 'no data');
    process.exit(1);
}

const schema = buildClientSchema(body.data);
const header = `# Vendored riven-ts GraphQL schema.\n# Generated via \`pnpm fetch-schema\` against ${url}\n# Note: plugin-provided fields only exist when those plugins are enabled on\n# the introspected server — avoid refreshing against a minimally-configured one.\n\n`;
writeFileSync(new URL('../schema/schema.graphql', import.meta.url), header + printSchema(schema));
console.log('schema/schema.graphql updated. Run `pnpm codegen` to regenerate types.');
