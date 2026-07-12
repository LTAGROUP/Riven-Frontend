<script lang="ts">
    import { CircleAlert, Info, Play, Table2 } from '@lucide/svelte';
    import { tick } from 'svelte';

    import { enhance } from '$app/forms';

    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import * as Select from '$lib/components/ui/select';
    import { Switch } from '$lib/components/ui/switch';
    import { Textarea } from '$lib/components/ui/textarea';

    import type { ActionData, PageData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let sql = $state('');
    let readOnly = $state(true);
    let running = $state(false);
    let formEl: HTMLFormElement | undefined = $state();

    type TableKey = 'media_item' | 'stream' | 'default';
    type SortOption = { id: string; label: string; clause: string };
    type QueryOption = {
        id: string;
        label: string;
        description: string;
        inputLabel?: string;
        placeholder?: string;
        build: (table: string, value: string, sortClause: string) => string;
    };

    const SORT_OPTIONS: Record<TableKey, SortOption[]> = {
        media_item: [
            { id: 'newest', label: 'Newest first', clause: 'created_at desc' },
            { id: 'oldest', label: 'Oldest first', clause: 'created_at asc' },
            { id: 'title', label: 'Title A–Z', clause: 'title asc' },
            { id: 'updated', label: 'Recently updated', clause: 'updated_at desc nulls last' }
        ],
        stream: [{ id: 'hash', label: 'Info hash A–Z', clause: 'info_hash asc' }],
        default: [
            { id: 'first-asc', label: 'First column A–Z', clause: '1 asc' },
            { id: 'first-desc', label: 'First column Z–A', clause: '1 desc' }
        ]
    };

    function quoteIdentifier(identifier: string): string {
        return `"${identifier.replaceAll('"', '""')}"`;
    }

    function escapeSqlLiteral(value: string): string {
        return value.replaceAll("'", "''");
    }

    function tableKey(table: string): TableKey {
        const normalized = table.toLowerCase();
        if (normalized === 'media_item' || normalized === 'media_items') return 'media_item';
        if (normalized === 'stream' || normalized === 'streams') return 'stream';
        return 'default';
    }

    function buildBrowseQuery(table: string, _value: string, sortClause: string): string {
        return `select *
from ${quoteIdentifier(table)}
order by ${sortClause}
limit 100`;
    }

    const QUERY_OPTIONS: Record<TableKey, QueryOption[]> = {
        media_item: [
            {
                id: 'browse',
                label: 'Browse rows',
                description: 'Preview media items with an optional sort order.',
                build: buildBrowseQuery
            },
            {
                id: 'find-title',
                label: 'Find by title',
                description: 'Search title and full_title with a case-insensitive match.',
                inputLabel: 'Title contains',
                placeholder: 'e.g. Dune',
                build: (_table, value) => `select id, type, title, state, created_at
from media_item
where (title ilike '%${escapeSqlLiteral(value || '<title>')}%'
    or full_title ilike '%${escapeSqlLiteral(value || '<title>')}%')
order by created_at desc
limit 50`
            },
            {
                id: 'recent',
                label: 'Recently added',
                description: 'Show the latest movies and shows added to the library.',
                build: () => `select id, type, title, state, created_at
from media_item
where type in ('movie', 'show')
order by created_at desc
limit 50`
            },
            {
                id: 'states',
                label: 'Items per state',
                description: 'Count media items grouped by their current state.',
                build: () => `select state, count(*)
from media_item
group by state
order by 2 desc`
            },
            {
                id: 'failed',
                label: 'Failed items',
                description: 'Find items whose most recent scrape attempt failed.',
                build: () => `select id, type, title, failed_scrape_attempts, scraped_at
from media_item
where state = 'failed'
order by scraped_at desc nulls last
limit 50`
            },
            {
                id: 'stuck-scraping',
                label: 'Stuck in scraping',
                description: 'Find items that have remained in the scraping state longest.',
                build: () => `select id, type, title, scraped_times, scraped_at, updated_at
from media_item
where state = 'scraping'
order by updated_at asc nulls first
limit 50`
            },
            {
                id: 'show-children',
                label: 'Episodes of a show',
                description: 'Enter a show ID to list its seasons and episodes.',
                inputLabel: 'Show ID',
                placeholder: 'Paste a show ID…',
                build: (
                    _table,
                    value
                ) => `select e.id, s."number" as season, e."number" as episode, e.title, e.state
from media_item e
join media_item s on e.season_id = s.id
where s.show_id = '${escapeSqlLiteral(value || '<show id>')}'
order by s."number", e."number"`
            }
        ],
        stream: [
            {
                id: 'browse',
                label: 'Browse rows',
                description: 'Preview streams with an optional sort order.',
                build: buildBrowseQuery
            },
            {
                id: 'find-info-hash',
                label: 'Find by stream ID / info hash',
                description: 'Search info_hash for a full or partial stream identifier.',
                inputLabel: 'Stream ID or info hash',
                placeholder: 'Paste a stream ID…',
                build: (table, value) => `select *
from ${quoteIdentifier(table)}
where info_hash ilike '%${escapeSqlLiteral(value || '<stream ID>')}%'
limit 50`
            }
        ],
        default: [
            {
                id: 'browse',
                label: 'Browse rows',
                description: 'Preview rows from the selected table.',
                build: buildBrowseQuery
            }
        ]
    };

    let selectedTable = $state('');
    let quickQuery = $state('browse');
    let quickQueryValue = $state('');
    let sortBy = $state('');

    $effect(() => {
        const firstTable = data.tables[0]?.name;
        if (!selectedTable && firstTable) {
            selectedTable = firstTable;
            sortBy = SORT_OPTIONS[tableKey(firstTable)][0]?.id ?? '';
        }
    });

    const activeTableKey = $derived(tableKey(selectedTable));
    const activeQueryOptions = $derived(QUERY_OPTIONS[activeTableKey]);
    const activeQuery = $derived(
        activeQueryOptions.find((option) => option.id === quickQuery) ?? activeQueryOptions[0]
    );
    const activeSortOptions = $derived(SORT_OPTIONS[activeTableKey]);
    const sortLabel = $derived(
        activeSortOptions.find((option) => option.id === sortBy)?.label ?? 'Sort rows'
    );
    const quickQueryLabel = $derived(activeQuery?.label ?? 'Quick query');

    function getSortClause(key: TableKey, id: string): string {
        return SORT_OPTIONS[key].find((option) => option.id === id)?.clause ?? '1';
    }

    function buildSelectedQuery(
        optionId = quickQuery,
        table = selectedTable,
        value = quickQueryValue,
        sortId = sortBy
    ): string {
        const key = tableKey(table);
        const option = QUERY_OPTIONS[key].find((candidate) => candidate.id === optionId);
        return option?.build(table, value, getSortClause(key, sortId)) ?? '';
    }

    async function runTableQuery(table: string) {
        selectedTable = table;
        quickQuery = 'browse';
        quickQueryValue = '';
        sortBy = SORT_OPTIONS[tableKey(table)][0]?.id ?? '';
        sql = buildSelectedQuery('browse', table, '', sortBy);
        await tick(); // let the textarea binding flush before serializing the form
        formEl?.requestSubmit();
    }

    function applyQueryOption(id: string | undefined) {
        if (!id || !selectedTable) return;
        quickQuery = id;
        quickQueryValue = '';
        sql = buildSelectedQuery(id, selectedTable, '', sortBy);
    }

    function applyQueryValue() {
        if (selectedTable) sql = buildSelectedQuery();
    }

    function applySort(id: string | undefined) {
        if (!id || !selectedTable) return;
        sortBy = id;
        if (quickQuery === 'browse') sql = buildSelectedQuery('browse', selectedTable, '', id);
    }

    function onQuickQueryKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyQueryValue();
        }
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
                                    aria-pressed={selectedTable === table.name}
                                    class={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50 hover:text-foreground ${
                                        selectedTable === table.name
                                            ? 'bg-accent text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
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
                    <div
                        class="flex flex-col gap-3 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <Label for="quick-query" class="text-sm font-medium"
                                    >Quick query</Label
                                >
                                {#if selectedTable}
                                    <span class="text-xs text-muted-foreground">
                                        for <code class="font-mono">{selectedTable}</code>
                                    </span>
                                {/if}
                            </div>
                            {#if activeQuery}
                                <p class="mt-1 text-xs text-muted-foreground">
                                    {activeQuery.description}
                                </p>
                            {/if}
                        </div>

                        <div class="flex flex-wrap items-center gap-2">
                            <Select.Root
                                type="single"
                                bind:value={quickQuery}
                                onValueChange={applyQueryOption}
                                disabled={!selectedTable}
                            >
                                <Select.Trigger id="quick-query" class="w-56">
                                    {quickQueryLabel}
                                </Select.Trigger>
                                <Select.Content>
                                    {#each activeQueryOptions as option (option.id)}
                                        <Select.Item value={option.id}>{option.label}</Select.Item>
                                    {/each}
                                </Select.Content>
                            </Select.Root>

                            {#if activeQuery?.id === 'browse'}
                                <Select.Root
                                    type="single"
                                    bind:value={sortBy}
                                    onValueChange={applySort}
                                    disabled={!selectedTable}
                                >
                                    <Select.Trigger class="w-44">{sortLabel}</Select.Trigger>
                                    <Select.Content>
                                        {#each activeSortOptions as option (option.id)}
                                            <Select.Item value={option.id}
                                                >{option.label}</Select.Item
                                            >
                                        {/each}
                                    </Select.Content>
                                </Select.Root>
                            {/if}
                        </div>
                    </div>

                    {#if activeQuery?.inputLabel}
                        <div
                            class="flex flex-col gap-2 rounded-md border border-dashed p-3 sm:flex-row sm:items-end"
                        >
                            <div class="min-w-0 flex-1 space-y-1.5">
                                <Label for="quick-query-value">{activeQuery.inputLabel}</Label>
                                <Input
                                    id="quick-query-value"
                                    bind:value={quickQueryValue}
                                    onkeydown={onQuickQueryKeydown}
                                    placeholder={activeQuery.placeholder}
                                />
                            </div>
                            <Button type="button" variant="secondary" onclick={applyQueryValue}>
                                Apply to SQL
                            </Button>
                        </div>
                    {/if}
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
                                                                <span
                                                                    class="text-muted-foreground italic"
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
