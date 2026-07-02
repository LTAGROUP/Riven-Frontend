import { getEnv } from './env';

import type { TypedDocumentString } from '$lib/graphql/generated/graphql';

export type BackendErrorKind = 'unreachable' | 'graphql' | 'http';

export class BackendError extends Error {
    kind: BackendErrorKind;

    constructor(kind: BackendErrorKind, message: string) {
        super(message);
        this.name = 'BackendError';
        this.kind = kind;
    }
}

const REQUEST_TIMEOUT_MS = 10_000;

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

/** Executes a typed GraphQL operation against the riven-ts backend. */
export async function execute<TResult, TVariables>(
    document: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
    return executeRaw(document.toString(), variables as Record<string, unknown> | undefined);
}

/** Executes a raw GraphQL query string (used for runtime-dynamic queries). */
export async function executeRaw<TResult = unknown>(
    query: string,
    variables?: Record<string, unknown>
): Promise<TResult> {
    const url = getEnv().BACKEND_GRAPHQL_URL;

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query, variables }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });
    } catch (error) {
        throw new BackendError(
            'unreachable',
            `Cannot reach riven-ts backend at ${url}: ${error instanceof Error ? error.message : String(error)}`
        );
    }

    if (!response.ok) {
        throw new BackendError('http', `Backend responded with HTTP ${response.status}`);
    }

    let body: GraphQLResponse<TResult>;
    try {
        body = (await response.json()) as GraphQLResponse<TResult>;
    } catch {
        throw new BackendError('http', 'Backend returned a non-JSON response');
    }

    if (body.errors?.length) {
        throw new BackendError('graphql', body.errors[0].message);
    }
    if (body.data === undefined || body.data === null) {
        throw new BackendError('graphql', 'Backend returned no data');
    }

    return body.data;
}
