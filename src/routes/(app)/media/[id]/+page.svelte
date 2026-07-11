<script lang="ts">
    import { CircleAlert, Copy, Pause, RotateCcw, Trash2 } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

    import CapabilityGate from '$lib/components/capability-gate.svelte';
    import StateBadge from '$lib/components/state-badge.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import * as Tabs from '$lib/components/ui/tabs';
    import * as Accordion from '$lib/components/ui/accordion';
    import { getCapabilities } from '$lib/capabilities-context';
    import { tmdbImage } from '$lib/media/images';
    import { TRANSITIONAL_STATES, TYPE_LABELS } from '$lib/media/states';
    import { formatBytes, formatDate } from '$lib/utils';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());
    const item = $derived(data.item);
    const poster = $derived(tmdbImage(item.posterPath, 'w500'));

    const isShow = $derived(item.__typename === 'Show');
    const seasons = $derived(item.__typename === 'Show' ? item.seasons : []);
    const episodes = $derived(item.__typename === 'Season' ? item.episodes : []);
    const files = $derived(
        item.__typename === 'Movie' || item.__typename === 'Episode' ? item.filesystemEntries : []
    );
    const fileNames = $derived(data.fileNames);

    let resetDialogOpen = $state(false);
    let streamUrlDialogOpen = $state(false);

    // Poll while the item is in a transitional state so status changes appear.
    $effect(() => {
        if (!TRANSITIONAL_STATES.includes(item.state as (typeof TRANSITIONAL_STATES)[number]))
            return;
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') invalidateAll();
        }, 15_000);
        return () => clearInterval(interval);
    });

    function actionToast(name: string) {
        return () => {
            return async ({
                result,
                update
            }: {
                result: { type: string; data?: Record<string, unknown> };
                update: (opts?: { reset?: boolean }) => Promise<void>;
            }) => {
                if (result.type === 'success') {
                    toast.success(String(result.data?.message ?? `${name} succeeded`));
                    resetDialogOpen = false;
                    streamUrlDialogOpen = false;
                    await invalidateAll();
                } else if (result.type === 'failure') {
                    toast.error(String(result.data?.message ?? `${name} failed`));
                }
                await update({ reset: false });
            };
        };
    }
</script>

<svelte:head>
    <title>{item.title} · Riven</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
    {#if data.limited}
        <div
            class="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300"
        >
            <CircleAlert class="mt-0.5 size-4 shrink-0" />
            <span>
                riven-ts's item API is currently broken upstream — showing details read directly
                from Riven's database. Stream and file listings are unavailable in this mode.
            </span>
        </div>
    {/if}
    <div class="flex flex-col gap-6 md:flex-row">
        <div class="w-40 shrink-0 md:w-52">
            <div class="aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                {#if poster}
                    <img src={poster} alt={item.title} class="size-full object-cover" />
                {:else}
                    <div class="flex size-full items-center justify-center text-muted-foreground">
                        No poster
                    </div>
                {/if}
            </div>
        </div>

        <div class="min-w-0 flex-1 space-y-4">
            <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                        {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <StateBadge state={item.state} />
                    {#if item.isAnime}
                        <span class="rounded-md bg-pink-500/15 px-2 py-0.5 text-xs text-pink-400"
                            >Anime</span
                        >
                    {/if}
                </div>
                <h1 class="text-3xl font-semibold">{item.title}</h1>
                <p class="text-sm text-muted-foreground">
                    {item.year ?? '—'}
                    {#if item.genres?.length}
                        · {item.genres.join(', ')}
                    {/if}
                    {#if item.rating}
                        · ★ {item.rating.toFixed(1)}
                    {/if}
                </p>
            </div>

            <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                    <dt class="text-muted-foreground">Released</dt>
                    <dd>{formatDate(item.releaseDate)}</dd>
                </div>
                <div>
                    <dt class="text-muted-foreground">Indexed</dt>
                    <dd>{formatDate(item.indexedAt, true)}</dd>
                </div>
                <div>
                    <dt class="text-muted-foreground">Scraped</dt>
                    <dd>{formatDate(item.scrapedAt, true)}</dd>
                </div>
                <div>
                    <dt class="text-muted-foreground">Scrape attempts</dt>
                    <dd>{item.scrapedTimes} ({item.failedScrapeAttempts} failed)</dd>
                </div>
                {#if item.__typename === 'Movie'}
                    <div>
                        <dt class="text-muted-foreground">Runtime</dt>
                        <dd>{item.runtime ? `${item.runtime} min` : '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-muted-foreground">TMDB</dt>
                        <dd>
                            <a
                                class="text-primary hover:underline"
                                href={`https://www.themoviedb.org/movie/${item.tmdbId}`}
                                target="_blank"
                                rel="noreferrer">{item.tmdbId}</a
                            >
                        </dd>
                    </div>
                {/if}
                {#if item.__typename === 'Show'}
                    <div>
                        <dt class="text-muted-foreground">Status</dt>
                        <dd class="capitalize">{item.status ?? 'unknown'}</dd>
                    </div>
                    <div>
                        <dt class="text-muted-foreground">TVDB</dt>
                        <dd>
                            <a
                                class="text-primary hover:underline"
                                href={`https://www.thetvdb.com/dereferrer/series/${item.tvdbId}`}
                                target="_blank"
                                rel="noreferrer">{item.tvdbId}</a
                            >
                        </dd>
                    </div>
                {/if}
                {#if item.imdbId}
                    <div>
                        <dt class="text-muted-foreground">IMDb</dt>
                        <dd>
                            <a
                                class="text-primary hover:underline"
                                href={`https://www.imdb.com/title/${item.imdbId}`}
                                target="_blank"
                                rel="noreferrer">{item.imdbId}</a
                            >
                        </dd>
                    </div>
                {/if}
                <div class="col-span-2 sm:col-span-3">
                    <dt class="text-muted-foreground">Item ID</dt>
                    <dd class="flex items-center gap-1.5">
                        <span class="font-mono text-xs">{item.id}</span>
                        <button
                            type="button"
                            title="Copy item ID"
                            class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onclick={() => {
                                navigator.clipboard.writeText(item.id);
                                toast.success('Item ID copied');
                            }}
                        >
                            <Copy class="size-3.5" />
                        </button>
                    </dd>
                </div>
            </dl>

            <div class="flex flex-wrap gap-2">
                <CapabilityGate enabled={capabilities.hasResetMediaItem}>
                    {#snippet children({ disabled })}
                        <Button
                            variant="secondary"
                            {disabled}
                            onclick={() => (resetDialogOpen = true)}
                        >
                            <RotateCcw class="size-4" />
                            Reset
                        </Button>
                    {/snippet}
                </CapabilityGate>

                {#if files.length > 0}
                    <CapabilityGate enabled={capabilities.hasSaveStreamUrl}>
                        {#snippet children({ disabled })}
                            <Button
                                variant="outline"
                                {disabled}
                                onclick={() => (streamUrlDialogOpen = true)}
                            >
                                Save stream URL
                            </Button>
                        {/snippet}
                    </CapabilityGate>
                {/if}

                <CapabilityGate enabled={capabilities.hasPauseMediaItem}>
                    {#snippet children({ disabled })}
                        <Button variant="outline" {disabled}>
                            <Pause class="size-4" />
                            Pause
                        </Button>
                    {/snippet}
                </CapabilityGate>

                <CapabilityGate enabled={capabilities.hasDeleteMediaItem}>
                    {#snippet children({ disabled })}
                        <Button variant="destructive" {disabled}>
                            <Trash2 class="size-4" />
                            Delete
                        </Button>
                    {/snippet}
                </CapabilityGate>
            </div>
        </div>
    </div>

    <Tabs.Root value={isShow || item.__typename === 'Season' ? 'episodes' : 'streams'}>
        <Tabs.List>
            {#if isShow || item.__typename === 'Season'}
                <Tabs.Trigger value="episodes">
                    {isShow ? 'Seasons' : 'Episodes'}
                </Tabs.Trigger>
            {/if}
            <Tabs.Trigger value="streams">Streams</Tabs.Trigger>
            {#if item.__typename === 'Movie' || item.__typename === 'Episode'}
                <Tabs.Trigger value="files">Files</Tabs.Trigger>
            {/if}
        </Tabs.List>

        {#if isShow}
            <Tabs.Content value="episodes" class="space-y-2">
                <Accordion.Root type="multiple" class="w-full">
                    {#each seasons as season (season.id)}
                        <Accordion.Item value={season.id}>
                            <Accordion.Trigger>
                                <div class="flex flex-1 items-center justify-between pr-2">
                                    <span>
                                        {season.number === 0
                                            ? 'Specials'
                                            : `Season ${season.number}`}
                                        <span class="ml-2 text-xs text-muted-foreground">
                                            {season.totalEpisodes} episodes
                                        </span>
                                    </span>
                                    <StateBadge state={season.state} />
                                </div>
                            </Accordion.Trigger>
                            <Accordion.Content>
                                <div class="divide-y rounded-md border">
                                    {#each season.episodes as episode (episode.id)}
                                        <a
                                            href={`/media/${episode.id}`}
                                            class="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent/50"
                                        >
                                            <span class="flex min-w-0 items-center gap-3">
                                                <span class="w-8 shrink-0 text-muted-foreground">
                                                    {String(episode.number).padStart(2, '0')}
                                                </span>
                                                <span class="truncate">{episode.title}</span>
                                            </span>
                                            <span class="flex shrink-0 items-center gap-3">
                                                <span
                                                    class="hidden text-xs text-muted-foreground sm:inline"
                                                >
                                                    {formatDate(episode.releaseDate)}
                                                </span>
                                                <StateBadge state={episode.state} />
                                            </span>
                                        </a>
                                    {/each}
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    {/each}
                </Accordion.Root>
            </Tabs.Content>
        {:else if item.__typename === 'Season'}
            <Tabs.Content value="episodes">
                <div class="divide-y rounded-md border">
                    {#each episodes as episode (episode.id)}
                        <a
                            href={`/media/${episode.id}`}
                            class="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent/50"
                        >
                            <span class="flex min-w-0 items-center gap-3">
                                <span class="w-8 shrink-0 text-muted-foreground">
                                    {String(episode.number).padStart(2, '0')}
                                </span>
                                <span class="truncate">{episode.title}</span>
                            </span>
                            <StateBadge state={episode.state} />
                        </a>
                    {/each}
                </div>
            </Tabs.Content>
        {/if}

        <Tabs.Content value="streams" class="space-y-4">
            {#if item.streams.length === 0 && item.blacklistedStreams.length === 0}
                <p class="py-6 text-center text-sm text-muted-foreground">
                    No streams scraped yet.
                </p>
            {:else}
                {#if item.streams.length > 0}
                    <div class="divide-y rounded-md border">
                        {#each item.streams as stream (stream.infoHash)}
                            <div
                                class="flex items-center justify-between gap-3 px-3 py-2 font-mono text-xs"
                            >
                                <span class="truncate">{stream.infoHash}</span>
                                {#if item.activeStream?.infoHash === stream.infoHash}
                                    <span
                                        class="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-400"
                                    >
                                        active
                                    </span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    <p class="text-xs text-muted-foreground">
                        riven-ts currently exposes only the info hash for each stream.
                    </p>
                {/if}
                {#if item.blacklistedStreams.length > 0}
                    <div>
                        <h3 class="mb-2 flex items-center gap-1.5 text-sm font-medium">
                            <CircleAlert class="size-4 text-destructive" />
                            Blacklisted
                        </h3>
                        <div class="divide-y rounded-md border border-destructive/30">
                            {#each item.blacklistedStreams as blacklisted (blacklisted.stream.infoHash + blacklisted.plugin)}
                                <div
                                    class="flex items-center justify-between gap-3 px-3 py-2 font-mono text-xs"
                                >
                                    <span class="truncate">{blacklisted.stream.infoHash}</span>
                                    <span class="shrink-0 text-muted-foreground">
                                        {blacklisted.provider ?? blacklisted.plugin}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}
        </Tabs.Content>

        {#if item.__typename === 'Movie' || item.__typename === 'Episode'}
            <Tabs.Content value="files">
                {#if files.length === 0}
                    <p class="py-6 text-center text-sm text-muted-foreground">No files yet.</p>
                {:else}
                    <div class="divide-y rounded-md border">
                        {#each files as file (file.id)}
                            <div class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                <span class="min-w-0 truncate font-mono text-xs sm:text-sm"
                                    >{fileNames[file.id] ?? file.type}</span
                                >
                                <span class="flex items-center gap-4 text-muted-foreground">
                                    <span>{formatBytes(file.fileSize)}</span>
                                    <span class="hidden sm:inline"
                                        >{formatDate(file.createdAt)}</span
                                    >
                                </span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </Tabs.Content>
        {/if}
    </Tabs.Root>
</div>

<Dialog.Root bind:open={resetDialogOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Reset “{item.title}”?</Dialog.Title>
            <Dialog.Description>
                This clears all scraped streams, downloaded file references and scrape attempts
                {#if isShow}
                    for the show and all of its seasons and episodes{/if}. Riven will process the
                item again from scratch.
            </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (resetDialogOpen = false)}>Cancel</Button>
            <form method="POST" action="?/reset" use:enhance={actionToast('Reset')}>
                <Button type="submit" variant="destructive">Reset item</Button>
            </form>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={streamUrlDialogOpen}>
    <Dialog.Content>
        <form
            method="POST"
            action="?/saveStreamUrl"
            use:enhance={actionToast('Save stream URL')}
            class="space-y-4"
        >
            <Dialog.Header>
                <Dialog.Title>Save stream URL</Dialog.Title>
                <Dialog.Description>
                    Stores a permanent stream link for the media file of this item.
                </Dialog.Description>
            </Dialog.Header>
            <input type="hidden" name="entryId" value={files[0]?.id ?? ''} />
            <div class="space-y-2">
                <Label for="stream-url">URL</Label>
                <Input id="stream-url" name="url" type="url" required placeholder="https://…" />
            </div>
            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (streamUrlDialogOpen = false)}
                >
                    Cancel
                </Button>
                <Button type="submit">Save</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
