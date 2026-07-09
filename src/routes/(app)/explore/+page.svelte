<script lang="ts">
    import { LoaderCircle, Plus, Search } from '@lucide/svelte';

    import CapabilityGate from '$lib/components/capability-gate.svelte';
    import PosterCard from '$lib/components/poster-card.svelte';
    import RequestDialog, { type RequestTarget } from '$lib/components/request-dialog.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { getCapabilities } from '$lib/capabilities-context';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());
    const libraryIds = $derived(new Set(data.libraryIds));

    interface SearchResult {
        id: number;
        media_type?: 'movie' | 'tv' | 'person';
        title?: string;
        name?: string;
        poster_path: string | null;
        release_date?: string;
        first_air_date?: string;
    }

    let query = $state('');
    let results = $state<SearchResult[]>([]);
    let page = $state(1);
    let totalPages = $state(0);
    let searching = $state(false);
    let requestTarget = $state<RequestTarget | null>(null);

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let searchGeneration = 0;

    function onQueryInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => runSearch(true), 300);
    }

    async function runSearch(fresh: boolean) {
        const term = query.trim();
        const generation = ++searchGeneration;
        if (!term) {
            results = [];
            totalPages = 0;
            return;
        }
        searching = true;
        const nextPage = fresh ? 1 : page + 1;
        try {
            const response = await fetch(
                `/api/tmdb/search/multi?query=${encodeURIComponent(term)}&page=${nextPage}&include_adult=false`
            );
            if (!response.ok) throw new Error('search failed');
            const body = (await response.json()) as {
                results: SearchResult[];
                page: number;
                total_pages: number;
            };
            if (generation !== searchGeneration) return;
            const media = body.results.filter(
                (result) => result.media_type === 'movie' || result.media_type === 'tv'
            );
            results = fresh ? media : [...results, ...media];
            page = body.page;
            totalPages = body.total_pages;
        } catch {
            if (generation === searchGeneration && fresh) results = [];
        } finally {
            if (generation === searchGeneration) searching = false;
        }
    }

    function loadMoreObserver(node: HTMLElement) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !searching && page < totalPages) {
                runSearch(false);
            }
        });
        observer.observe(node);
        return { destroy: () => observer.disconnect() };
    }

    function toTarget(result: SearchResult): RequestTarget {
        return {
            mediaType: result.media_type === 'tv' ? 'tv' : 'movie',
            tmdbId: result.id,
            title: result.title ?? result.name ?? 'Untitled',
            year: (result.release_date ?? result.first_air_date ?? '').slice(0, 4) || null
        };
    }

    const showingSearch = $derived(query.trim().length > 0);
</script>

<svelte:head>
    <title>Explore · Riven</title>
</svelte:head>

<div class="space-y-6">
    <div class="space-y-3">
        <h1 class="text-2xl font-semibold">Explore</h1>
        {#if !data.tmdbConfigured}
            <div class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Search and trending need a TMDB token. Set
                <code class="font-mono">TMDB_READ_ACCESS_TOKEN</code> and restart the frontend.
            </div>
        {:else}
            <div class="relative max-w-xl">
                <Search
                    class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    bind:value={query}
                    oninput={onQueryInput}
                    placeholder="Search movies and shows…"
                    class="h-11 pl-9 text-base"
                />
                {#if searching}
                    <LoaderCircle
                        class="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                {/if}
            </div>
            {#if !capabilities.hasSeerrWebhook}
                <p class="text-sm text-muted-foreground">
                    Requesting is disabled — enable and configure the
                    <span class="font-medium">seerr plugin</span> in riven-ts to request media from here.
                </p>
            {/if}
        {/if}
    </div>

    {#if data.tmdbConfigured}
        {#if showingSearch}
            {#if results.length === 0 && !searching}
                <div
                    class="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
                >
                    No results for “{query.trim()}”.
                </div>
            {:else}
                <div
                    class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {#each results as result (result.media_type + ':' + result.id)}
                        {@const inLibrary =
                            result.media_type === 'movie' && libraryIds.has(`movie:${result.id}`)}
                        <div class="group relative">
                            <PosterCard
                                title={result.title ?? result.name ?? 'Untitled'}
                                posterPath={result.poster_path}
                                year={Number(
                                    (result.release_date ?? result.first_air_date ?? '').slice(0, 4)
                                ) || null}
                                type={result.media_type === 'tv' ? 'show' : 'movie'}
                                href={`/explore/${result.media_type}/${result.id}`}
                                note={inLibrary
                                    ? 'In library'
                                    : result.media_type === 'tv'
                                      ? 'Show'
                                      : 'Movie'}
                            />
                            <div
                                class="absolute inset-x-2 bottom-14 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <CapabilityGate
                                    enabled={capabilities.hasSeerrWebhook}
                                    reason="Enable the seerr plugin in riven-ts to request media"
                                >
                                    {#snippet children({ disabled })}
                                        <Button
                                            class="w-full"
                                            size="sm"
                                            {disabled}
                                            onclick={() => (requestTarget = toTarget(result))}
                                        >
                                            <Plus class="size-4" />
                                            Request
                                        </Button>
                                    {/snippet}
                                </CapabilityGate>
                            </div>
                        </div>
                    {/each}
                </div>
                {#if page < totalPages}
                    <div use:loadMoreObserver class="flex justify-center py-4">
                        <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
                    </div>
                {/if}
            {/if}
        {:else}
            <section class="space-y-3">
                <h2 class="text-lg font-semibold">Trending this week</h2>
                <div
                    class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {#each data.trending as movie (movie.id)}
                        <div class="group relative">
                            <PosterCard
                                title={movie.title ?? movie.name ?? 'Untitled'}
                                posterPath={movie.poster_path}
                                year={Number(
                                    (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4)
                                ) || null}
                                type="movie"
                                href={`/explore/movie/${movie.id}`}
                            />
                            <div
                                class="absolute inset-x-2 bottom-14 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <CapabilityGate
                                    enabled={capabilities.hasSeerrWebhook}
                                    reason="Enable the seerr plugin in riven-ts to request media"
                                >
                                    {#snippet children({ disabled })}
                                        <Button
                                            class="w-full"
                                            size="sm"
                                            {disabled}
                                            onclick={() =>
                                                (requestTarget = {
                                                    mediaType: 'movie',
                                                    tmdbId: movie.id,
                                                    title: movie.title ?? movie.name ?? 'Untitled',
                                                    year:
                                                        (movie.release_date ?? '').slice(0, 4) ||
                                                        null
                                                })}
                                        >
                                            <Plus class="size-4" />
                                            Request
                                        </Button>
                                    {/snippet}
                                </CapabilityGate>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
    {/if}
</div>

<RequestDialog target={requestTarget} onClose={() => (requestTarget = null)} />
