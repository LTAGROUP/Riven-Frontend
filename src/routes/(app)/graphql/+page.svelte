<script lang="ts">
    import { CircleAlert, Play } from '@lucide/svelte';

    import { enhance } from '$app/forms';

    import { Button } from '$lib/components/ui/button';
    import { Label } from '$lib/components/ui/label';
    import * as Select from '$lib/components/ui/select';
    import { Textarea } from '$lib/components/ui/textarea';

    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();

    const TEMPLATES = [
        {
            id: 'reset',
            label: 'Reset media item',
            query: `mutation ResetMediaItem($id: ID!) {
    resetMediaItem(id: $id) {
        ... on MediaItem {
            id
            state
        }
    }
}`,
            variables: `{
    "id": "<media item id>"
}`
        },
        {
            id: 'item-by-id',
            label: 'Media item by ID',
            query: `query MediaItemById($id: ID!) {
    mediaItemById(id: $id) {
        ... on MediaItem {
            id
            type
            title
            state
            scrapedAt
            scrapedTimes
            failedScrapeAttempts
            streams {
                infoHash
            }
        }
    }
}`,
            variables: `{
    "id": "<media item id>"
}`
        },
        {
            id: 'list-items',
            label: 'List media items',
            query: `query MediaItems {
    mediaItems {
        id
        type
        title
        state
    }
}`,
            variables: ''
        },
        {
            id: 'save-stream-url',
            label: 'Save stream URL',
            query: `mutation SaveStreamUrl($id: ID!, $url: String!) {
    saveStreamUrl(id: $id, url: $url) {
        id
        streamPermalink
    }
}`,
            variables: `{
    "id": "<file entry id>",
    "url": "https://…"
}`
        },
        {
            id: 'settings',
            label: 'Backend settings',
            query: `query Settings {
    settings {
        riven {
            version
            logLevel
        }
    }
}`,
            variables: ''
        }
    ];

    const EXAMPLE_QUERY = TEMPLATES[0].query;
    const EXAMPLE_VARIABLES = TEMPLATES[0].variables;

    let template = $state('');

    function applyTemplate(id: string | undefined) {
        const selected = TEMPLATES.find((t) => t.id === id);
        if (!selected) return;
        query = selected.query;
        variables = selected.variables;
    }

    const templateLabel = $derived(
        TEMPLATES.find((t) => t.id === template)?.label ?? 'Insert a template…'
    );

    // Intentional initial-value capture: repopulates the editors after a
    // non-JS form submission; while the page is live the user's input wins.
    // svelte-ignore state_referenced_locally
    let query = $state(form?.query ?? '');
    // svelte-ignore state_referenced_locally
    let variables = $state(form?.variables ?? '');
    let running = $state(false);
    let formEl: HTMLFormElement | undefined = $state();

    function onKeydown(event: KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            formEl?.requestSubmit();
        }
    }

    const error = $derived(form && 'message' in form ? form.message : undefined);
    const result = $derived(form && 'response' in form ? form : undefined);
</script>

<svelte:head>
    <title>GraphQL · Riven</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-4">
    <div>
        <h1 class="text-2xl font-semibold">GraphQL console</h1>
        <p class="text-sm text-muted-foreground">
            Run any query or mutation against riven-ts's GraphQL API. The response is shown
            verbatim, including errors. Mutations change real data.
        </p>
    </div>

    <form
        method="POST"
        action="?/run"
        bind:this={formEl}
        use:enhance={() => {
            running = true;
            return async ({ update }) => {
                running = false;
                await update({ reset: false });
            };
        }}
        class="space-y-3"
    >
        <div class="flex items-center justify-between gap-3">
            <Label for="gql-query">Operation</Label>
            <Select.Root type="single" bind:value={template} onValueChange={applyTemplate}>
                <Select.Trigger class="w-56">{templateLabel}</Select.Trigger>
                <Select.Content>
                    {#each TEMPLATES as t (t.id)}
                        <Select.Item value={t.id}>{t.label}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div class="space-y-1.5">
            <Textarea
                id="gql-query"
                name="query"
                bind:value={query}
                onkeydown={onKeydown}
                rows={9}
                placeholder={EXAMPLE_QUERY}
                class="font-mono text-sm"
            />
        </div>
        <div class="space-y-1.5">
            <Label for="gql-variables">Variables (JSON, optional)</Label>
            <Textarea
                id="gql-variables"
                name="variables"
                bind:value={variables}
                onkeydown={onKeydown}
                rows={3}
                placeholder={EXAMPLE_VARIABLES}
                class="font-mono text-sm"
            />
        </div>
        <div class="flex items-center gap-4">
            <Button type="submit" disabled={running}>
                <Play class="size-4" />
                {running ? 'Running…' : 'Run'}
            </Button>
            <span class="text-xs text-muted-foreground">⌘⏎ to run</span>
        </div>
    </form>

    {#if error}
        <div
            class="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
            <CircleAlert class="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
        </div>
    {/if}

    {#if result}
        <div class="space-y-2">
            <p class="text-xs text-muted-foreground">
                HTTP {result.status} · {result.durationMs} ms
                {#if result.hasErrors}
                    · <span class="text-destructive">response contains errors</span>
                {/if}
            </p>
            <pre
                class="max-h-[32rem] overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">{result.response}</pre>
        </div>
    {/if}
</div>
