<script lang="ts">
    import { CircleAlert, Info, Play, Table2 } from '@lucide/svelte';
    import { tick } from 'svelte';

    import { enhance } from '$app/forms';

    import { Button } from '$lib/components/ui/button';
    import { Label } from '$lib/components/ui/label';
    import { Switch } from '$lib/components/ui/switch';
    import { Textarea } from '$lib/components/ui/textarea';

    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let sql = $state('');
    let readOnly = $state(true);
    let running = $state(false);
    let formEl: HTMLFormElement | undefined = $state();

    async function runTableQuery(table: string) {
        sql = `select * from "${table}" order by 1 limit 100`;
        await tick(); // let the textarea binding flush before serializing the form
        formEl?.requestSubmit();
    }

    function onKeydown(event: KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            formEl?.requestSubmit();
        }
    }

    const results = $derived(form && 'results' in form ? form.results : undefined);
    const error = $derived(form && 'message' in form ? form.message : undefined);
</script>

<svelte:head>
    <title>Database · Riven</title>
</svelte:head>

<div class="space-y-4">
    <div>
        <h1 class="text-2xl font-semibold">Database</h1>
        <p class="text-sm text-muted-foreground">
            Query riven-ts's Postgres directly. Read-only by default — toggle it off to run
            UPDATE/DELETE at your own risk.
        </p>
    </div>

    {#if !data.configured}
        <div
            class="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-300"
        >
            <Info class="mt-0.5 size-4 shrink-0" />
            <span>
                Set <code class="font-mono">RIVEN_DATABASE_URL</code> to riven-ts's Postgres connection
                string to enable the database console.
            </span>
        </div>
    {:else}
        <div class="flex flex-col gap-4 lg:flex-row">
            <aside class="shrink-0 lg:w-56">
                <h2 class="mb-2 text-sm font-medium text-muted-foreground">Tables</h2>
                {#if data.tablesError}
                    <p class="text-sm text-destructive">{data.tablesError}</p>
                {:else}
                    <ul class="space-y-0.5">
                        {#each data.tables as table (table.name)}
                            <li>
                                <button
                                    type="button"
                                    onclick={() => runTableQuery(table.name)}
                                    class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                                >
                                    <span class="flex min-w-0 items-center gap-2">
                                        <Table2 class="size-3.5 shrink-0" />
                                        <span class="truncate font-mono">{table.name}</span>
                                    </span>
                                    <span class="shrink-0 text-xs">{table.rows}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </aside>

            <div class="min-w-0 flex-1 space-y-4">
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
                    <Textarea
                        name="sql"
                        bind:value={sql}
                        onkeydown={onKeydown}
                        rows={6}
                        placeholder="select * from media_item where title ilike '%…%' limit 50"
                        class="font-mono text-sm"
                    />
                    <input type="hidden" name="readOnly" value={String(readOnly)} />
                    <div class="flex flex-wrap items-center gap-4">
                        <Button type="submit" disabled={running}>
                            <Play class="size-4" />
                            {running ? 'Running…' : 'Run'}
                        </Button>
                        <div class="flex items-center gap-2">
                            <Switch id="read-only" bind:checked={readOnly} />
                            <Label for="read-only" class="text-sm">Read-only</Label>
                        </div>
                        <span class="text-xs text-muted-foreground">⌘⏎ to run</span>
                    </div>
                </form>

                {#if error}
                    <div
                        class="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                    >
                        <CircleAlert class="mt-0.5 size-4 shrink-0" />
                        <span class="font-mono">{error}</span>
                    </div>
                {/if}

                {#if results}
                    {#each results as result, index (index)}
                        <div class="space-y-2">
                            <p class="text-xs text-muted-foreground">
                                {result.command} · {result.rowCount} row{result.rowCount === 1
                                    ? ''
                                    : 's'}
                                {#if result.truncated}
                                    · showing first {result.rows.length}
                                {/if}
                                {#if form && 'durationMs' in form && results.length === 1}
                                    · {form.durationMs} ms
                                {/if}
                            </p>
                            {#if result.columns.length > 0}
                                <div class="overflow-x-auto rounded-md border">
                                    <table class="w-full text-left text-sm">
                                        <thead class="border-b bg-muted/50">
                                            <tr>
                                                {#each result.columns as column (column)}
                                                    <th
                                                        class="px-3 py-2 font-mono text-xs font-medium whitespace-nowrap"
                                                    >
                                                        {column}
                                                    </th>
                                                {/each}
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y">
                                            {#each result.rows as row, rowIndex (rowIndex)}
                                                <tr class="hover:bg-accent/30">
                                                    {#each row as cell, cellIndex (cellIndex)}
                                                        <td
                                                            class="max-w-96 truncate px-3 py-1.5 font-mono text-xs whitespace-nowrap"
                                                            title={cell ?? undefined}
                                                        >
                                                            {#if cell === null}
                                                                <span class="text-muted-foreground italic"
                                                                    >null</span
                                                                >
                                                            {:else}
                                                                {cell}
                                                            {/if}
                                                        </td>
                                                    {/each}
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                </div>
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>
