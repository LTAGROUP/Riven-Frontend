<script lang="ts">
    import { ChevronLeft, ChevronRight, Info, RotateCcw, Search, Trash2 } from '@lucide/svelte';
    import { SvelteSet, SvelteURLSearchParams } from 'svelte/reactivity';
    import { toast } from 'svelte-sonner';

    import { enhance } from '$app/forms';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/state';

    import CapabilityGate from '$lib/components/capability-gate.svelte';
    import PosterCard from '$lib/components/poster-card.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { Input } from '$lib/components/ui/input';
    import * as Select from '$lib/components/ui/select';
    import { getCapabilities } from '$lib/capabilities-context';
    import { MEDIA_ITEM_STATES, STATE_LABELS } from '$lib/media/states';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());

    let search = $state(page.url.searchParams.get('q') ?? '');
    let stateFilter = $state<string>(page.url.searchParams.get('state') ?? 'all');
    let typeFilter = $state<string>(page.url.searchParams.get('type') ?? 'primary');
    const selected = new SvelteSet<string>();
    let selectionMode = $state(false);

    // Filtering and pagination run server-side (the whole library is searched,
    // not just the loaded page) — inputs navigate with updated query params.
    function applyFilters() {
        const params = new SvelteURLSearchParams(page.url.searchParams);
        const set = (key: string, value: string, blank: string) =>
            value && value !== blank ? params.set(key, value) : params.delete(key);
        set('q', search.trim(), '');
        set('type', typeFilter, 'primary');
        set('state', stateFilter, 'all');
        params.delete('page');
        goto(`?${params}`, { keepFocus: true, replaceState: true, noScroll: true });
    }

    let searchTimer: ReturnType<typeof setTimeout>;
    function onSearchInput() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilters, 300);
    }

    const pageCount = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));

    function pageHref(target: number) {
        const params = new SvelteURLSearchParams(page.url.searchParams);
        if (target > 1) params.set('page', String(target));
        else params.delete('page');
        return `?${params}`;
    }

    function toggleSelected(id: string, value: boolean) {
        if (value) selected.add(id);
        else selected.delete(id);
    }

    const typeOptions = [
        { value: 'primary', label: 'Movies & Shows' },
        { value: 'all', label: 'All types' },
        { value: 'movie', label: 'Movies' },
        { value: 'show', label: 'Shows' },
        { value: 'season', label: 'Seasons' },
        { value: 'episode', label: 'Episodes' }
    ];

    const stateOptions = [
        { value: 'all', label: 'All states' },
        ...MEDIA_ITEM_STATES.map((s) => ({ value: s, label: STATE_LABELS[s] }))
    ];

    const typeLabel = $derived(typeOptions.find((o) => o.value === typeFilter)?.label ?? 'Type');
    const stateLabel = $derived(
        stateOptions.find((o) => o.value === stateFilter)?.label ?? 'State'
    );
</script>

<svelte:head>
    <title>Library · Riven</title>
</svelte:head>

<div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
        <h1 class="mr-auto text-2xl font-semibold">Library</h1>

        <div class="relative">
            <Search
                class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
                bind:value={search}
                oninput={onSearchInput}
                placeholder="Search titles…"
                class="w-48 pl-8 md:w-64"
            />
        </div>

        <Select.Root type="single" bind:value={typeFilter} onValueChange={applyFilters}>
            <Select.Trigger class="w-40">{typeLabel}</Select.Trigger>
            <Select.Content>
                {#each typeOptions as option (option.value)}
                    <Select.Item value={option.value}>{option.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={stateFilter} onValueChange={applyFilters}>
            <Select.Trigger class="w-36">{stateLabel}</Select.Trigger>
            <Select.Content>
                {#each stateOptions as option (option.value)}
                    <Select.Item value={option.value}>{option.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Button
            variant={selectionMode ? 'secondary' : 'outline'}
            onclick={() => {
                selectionMode = !selectionMode;
                if (!selectionMode) selected.clear();
            }}
        >
            {selectionMode ? 'Cancel' : 'Select'}
        </Button>
    </div>

    {#if data.source === 'graphql' && !capabilities.hasMediaItemsPagination}
        <div
            class="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-300"
        >
            <Info class="mt-0.5 size-4 shrink-0" />
            <span>
                riven-ts currently returns at most 25 library items and doesn't support server-side
                filtering yet — search only covers these latest items. Set
                <code class="font-mono">RIVEN_DATABASE_URL</code> to search and browse the full library
                directly from Riven's database.
            </span>
        </div>
    {/if}

    {#if data.loadError}
        <div
            class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
            {data.loadError}
        </div>
    {/if}

    {#if selectionMode && selected.size > 0}
        <div class="flex items-center gap-3 rounded-md border bg-card p-3">
            <span class="text-sm">{selected.size} selected</span>
            <form
                method="POST"
                action="?/reset"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === 'success' && result.data?.message) {
                            toast.success(String(result.data.message));
                            selected.clear();
                            selectionMode = false;
                            await invalidateAll();
                        } else if (result.type === 'failure') {
                            toast.error(String(result.data?.message ?? 'Reset failed'));
                        }
                        await update({ reset: false });
                    };
                }}
            >
                {#each [...selected] as id (id)}
                    <input type="hidden" name="id" value={id} />
                {/each}
                <CapabilityGate enabled={capabilities.hasResetMediaItem}>
                    {#snippet children({ disabled })}
                        <Button type="submit" variant="secondary" size="sm" {disabled}>
                            <RotateCcw class="size-4" />
                            Reset
                        </Button>
                    {/snippet}
                </CapabilityGate>
            </form>
            <CapabilityGate enabled={capabilities.hasDeleteMediaItem}>
                {#snippet children({ disabled })}
                    <Button variant="destructive" size="sm" {disabled}>
                        <Trash2 class="size-4" />
                        Delete
                    </Button>
                {/snippet}
            </CapabilityGate>
        </div>
    {/if}

    {#if data.items.length === 0}
        <div
            class="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
        >
            No items match.
        </div>
    {:else}
        <div
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8"
        >
            {#each data.items as item (item.id)}
                <div class="relative">
                    {#if selectionMode}
                        <div class="absolute top-2 right-2 z-10 rounded-md bg-black/70 p-1">
                            <Checkbox
                                checked={selected.has(item.id)}
                                onCheckedChange={(value) => toggleSelected(item.id, value === true)}
                            />
                        </div>
                    {/if}
                    <PosterCard
                        title={item.title}
                        posterPath={item.posterPath}
                        year={item.year}
                        type={item.type}
                        state={item.state}
                        href={selectionMode ? undefined : `/media/${item.id}`}
                        note={item.type === 'season' || item.type === 'episode'
                            ? item.type
                            : undefined}
                    />
                </div>
            {/each}
        </div>
    {/if}

    <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>
            {data.total} item{data.total === 1 ? '' : 's'}
            {#if pageCount > 1}
                · page {data.page} of {pageCount}
            {/if}
        </span>
        {#if pageCount > 1}
            <span class="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    href={data.page > 1 ? pageHref(data.page - 1) : undefined}
                    disabled={data.page <= 1}
                >
                    <ChevronLeft class="size-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    href={data.page < pageCount ? pageHref(data.page + 1) : undefined}
                    disabled={data.page >= pageCount}
                >
                    Next
                    <ChevronRight class="size-4" />
                </Button>
            </span>
        {/if}
    </div>
</div>
