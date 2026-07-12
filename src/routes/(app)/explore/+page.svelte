<script lang="ts">
    import { onMount } from 'svelte';
    import {
        LoaderCircle,
        Plus,
        Search,
        SlidersHorizontal,
        Sparkles,
        Star,
        X
    } from '@lucide/svelte';

    import CapabilityGate from '$lib/components/capability-gate.svelte';
    import PosterCard from '$lib/components/poster-card.svelte';
    import RequestDialog, { type RequestTarget } from '$lib/components/request-dialog.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import * as Select from '$lib/components/ui/select';
    import { getCapabilities } from '$lib/capabilities-context';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());
    const libraryStates = $derived(data.libraryStates);

    type MediaType = 'movie' | 'tv';
    type ContentFilter = 'all' | MediaType;
    type SortValue = 'popularity' | 'rating' | 'newest';
    type RatingFilter = 'all' | '7' | '8' | '9';

    interface MediaResult {
        id: number;
        media_type?: MediaType | 'person';
        title?: string;
        name?: string;
        poster_path: string | null;
        release_date?: string;
        first_air_date?: string;
        vote_average?: number;
        popularity?: number;
    }

    interface TmdbPage {
        results: MediaResult[];
        page: number;
        total_pages: number;
    }

    type QueryParams = Record<string, string>;

    const contentOptions: { value: ContentFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'movie', label: 'Movies' },
        { value: 'tv', label: 'Shows' }
    ];

    const sortOptions: { value: SortValue; label: string }[] = [
        { value: 'popularity', label: 'Most popular' },
        { value: 'rating', label: 'Top rated' },
        { value: 'newest', label: 'Newest first' }
    ];

    const ratingOptions: { value: RatingFilter; label: string }[] = [
        { value: 'all', label: 'Any rating' },
        { value: '7', label: '7+ rating' },
        { value: '8', label: '8+ rating' },
        { value: '9', label: '9+ rating' }
    ];

    const studioOptions = [
        { value: 'all', label: 'All studios' },
        { value: '2', label: 'Walt Disney' },
        { value: '4', label: 'Paramount' },
        { value: '33', label: 'Universal' },
        { value: '34', label: 'Sony Pictures' },
        { value: '174', label: 'Warner Bros.' },
        { value: '213', label: 'Netflix' },
        { value: '41077', label: 'A24' },
        { value: '127928', label: '20th Century' }
    ];

    const genreOptions: {
        value: string;
        label: string;
        movie?: number;
        tv?: number;
    }[] = [
        { value: 'all', label: 'All genres' },
        { value: 'action', label: 'Action', movie: 28, tv: 10759 },
        { value: 'comedy', label: 'Comedy', movie: 35, tv: 35 },
        { value: 'drama', label: 'Drama', movie: 18, tv: 18 },
        { value: 'documentary', label: 'Documentary', movie: 99, tv: 99 },
        { value: 'science-fiction', label: 'Sci-fi', movie: 878, tv: 10765 },
        { value: 'thriller', label: 'Thriller', movie: 53 },
        { value: 'animation', label: 'Animation', movie: 16, tv: 16 }
    ];

    let query = $state('');
    let contentType = $state<ContentFilter>('all');
    let sortBy = $state<SortValue>('popularity');
    let ratingFilter = $state<RatingFilter>('all');
    let studio = $state('all');
    let genre = $state('all');

    let results = $state<MediaResult[]>([]);
    let searchPage = $state(0);
    let searchTotalPages = $state(0);
    let searching = $state(false);

    let items = $state<MediaResult[]>([]);
    let browsePage = $state(0);
    let browseTotalPages = $state(0);
    let browseLoading = $state(false);
    let browseError = $state('');
    let browseLoaded = $state(false);
    let requestTarget = $state<RequestTarget | null>(null);

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let searchGeneration = 0;
    let browseGeneration = 0;

    const showingSearch = $derived(query.trim().length > 0);
    const activeFilterCount = $derived(
        (contentType !== 'all' ? 1 : 0) +
            (sortBy !== 'popularity' ? 1 : 0) +
            (ratingFilter !== 'all' ? 1 : 0) +
            (studio !== 'all' ? 1 : 0) +
            (genre !== 'all' ? 1 : 0)
    );
    const sortLabel = $derived(
        sortOptions.find((option) => option.value === sortBy)?.label ?? 'Sort'
    );
    const ratingLabel = $derived(
        ratingOptions.find((option) => option.value === ratingFilter)?.label ?? 'Rating'
    );
    const studioLabel = $derived(
        studioOptions.find((option) => option.value === studio)?.label ?? 'Studio'
    );
    const genreLabel = $derived(
        genreOptions.find((option) => option.value === genre)?.label ?? 'Genre'
    );

    function titleFor(result: MediaResult) {
        return result.title ?? result.name ?? 'Untitled';
    }

    function mediaTypeFor(result: MediaResult): MediaType {
        if (result.media_type === 'tv') return 'tv';
        if (result.media_type === 'movie') return 'movie';
        return contentType === 'tv' ? 'tv' : 'movie';
    }

    function releaseDateFor(result: MediaResult) {
        return result.release_date ?? result.first_air_date ?? '';
    }

    function ratingMinimum() {
        return ratingFilter === 'all' ? 0 : Number(ratingFilter);
    }

    function sortResults(next: MediaResult[]) {
        return [...next].sort((a, b) => {
            if (sortBy === 'rating') {
                return (b.vote_average ?? 0) - (a.vote_average ?? 0);
            }
            if (sortBy === 'newest') {
                return releaseDateFor(b).localeCompare(releaseDateFor(a));
            }
            return (b.popularity ?? 0) - (a.popularity ?? 0);
        });
    }

    function libraryStateFor(result: MediaResult): string | null {
        const mediaType = mediaTypeFor(result);
        if (mediaType === 'movie') return libraryStates[`movie:${result.id}`] ?? null;
        return libraryStates[`show:title:${(result.name ?? '').trim().toLowerCase()}`] ?? null;
    }

    function toTarget(result: MediaResult): RequestTarget {
        const mediaType = mediaTypeFor(result);
        return {
            mediaType,
            tmdbId: result.id,
            title: titleFor(result),
            year: releaseDateFor(result).slice(0, 4) || null
        };
    }

    function discoverSort(mediaType: MediaType) {
        if (sortBy === 'rating') return 'vote_average.desc';
        if (sortBy === 'newest') {
            return mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
        }
        return 'popularity.desc';
    }

    function discoverParams(mediaType: MediaType, page: number): QueryParams {
        const params: QueryParams = {
            page: String(page),
            include_adult: 'false',
            include_video: 'false',
            sort_by: discoverSort(mediaType)
        };

        const minimum = ratingMinimum();
        if (minimum > 0) {
            params['vote_average.gte'] = String(minimum);
            params['vote_count.gte'] = sortBy === 'rating' ? '200' : '50';
        } else if (sortBy === 'rating') {
            params['vote_count.gte'] = '200';
        }

        if (studio !== 'all' && mediaType === 'movie') params.with_companies = studio;

        const selectedGenre = genreOptions.find((option) => option.value === genre);
        const genreId = selectedGenre?.[mediaType];
        if (genreId) params.with_genres = String(genreId);

        return params;
    }

    function queryString(params: QueryParams) {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    async function fetchPage(path: string, params: QueryParams) {
        const response = await fetch(`/api/tmdb/${path}?${queryString(params)}`);
        if (!response.ok) throw new Error('TMDB request failed');
        return (await response.json()) as TmdbPage;
    }

    async function loadBrowse(fresh: boolean) {
        if (!data.tmdbConfigured) return;

        if (fresh) {
            browseGeneration += 1;
            browsePage = 0;
            browseTotalPages = 0;
            browseError = '';
            items = [];
        }

        const generation = browseGeneration;
        const nextPage = fresh ? 1 : browsePage + 1;
        if (!fresh && (browseLoading || browsePage >= browseTotalPages)) return;

        browseLoading = true;
        try {
            const mediaTypes: MediaType[] = contentType === 'all' ? ['movie', 'tv'] : [contentType];
            const pages = await Promise.all(
                mediaTypes.map(async (mediaType) => ({
                    mediaType,
                    page: await fetchPage(
                        `discover/${mediaType}`,
                        discoverParams(mediaType, nextPage)
                    )
                }))
            );

            if (generation !== browseGeneration) return;

            const nextItems = sortResults(
                pages.flatMap(({ mediaType, page }) =>
                    page.results.map((result) => ({ ...result, media_type: mediaType }))
                )
            );
            items = fresh ? nextItems : [...items, ...nextItems];
            browsePage = nextPage;
            browseTotalPages = pages.length
                ? Math.max(...pages.map(({ page }) => page.total_pages))
                : 0;
            browseLoaded = true;
        } catch {
            if (generation !== browseGeneration) return;
            browseError = 'Could not load more titles right now. Try again in a moment.';
            if (fresh && data.trending.length) {
                items = data.trending.map((item) => ({ ...item, media_type: 'movie' as const }));
            }
        } finally {
            if (generation === browseGeneration) browseLoading = false;
        }
    }

    function searchPath() {
        return contentType === 'all' ? 'search/multi' : `search/${contentType}`;
    }

    async function runSearch(fresh: boolean) {
        const term = query.trim();
        const generation = ++searchGeneration;
        if (!term) {
            results = [];
            searchPage = 0;
            searchTotalPages = 0;
            searching = false;
            return;
        }

        if (!fresh && (searching || searchPage >= searchTotalPages)) return;

        searching = true;
        const nextPage = fresh ? 1 : searchPage + 1;
        const params: QueryParams = {
            query: term,
            page: String(nextPage),
            include_adult: 'false'
        };

        try {
            const page = await fetchPage(searchPath(), params);
            if (generation !== searchGeneration) return;

            const media = page.results
                .map((result) => ({
                    ...result,
                    media_type:
                        result.media_type === 'tv' || result.media_type === 'movie'
                            ? result.media_type
                            : contentType === 'tv'
                              ? 'tv'
                              : contentType === 'movie'
                                ? 'movie'
                                : result.media_type
                }))
                .filter((result) => result.media_type === 'movie' || result.media_type === 'tv')
                .filter((result) => (result.vote_average ?? 0) >= ratingMinimum());

            results = fresh ? sortResults(media) : sortResults([...results, ...media]);
            searchPage = page.page;
            searchTotalPages = page.total_pages;
        } catch {
            if (generation === searchGeneration && fresh) results = [];
        } finally {
            if (generation === searchGeneration) searching = false;
        }
    }

    function onQueryInput() {
        clearTimeout(debounceTimer);
        const term = query.trim();
        if (term) searching = true;
        debounceTimer = setTimeout(() => runSearch(true), 300);
    }

    function refreshContent() {
        if (showingSearch) runSearch(true);
        else loadBrowse(true);
    }

    function setContentType(next: ContentFilter) {
        contentType = next;
        if (next === 'tv') studio = 'all';
        refreshContent();
    }

    function setStudio(next: string | undefined) {
        studio = next ?? 'all';
        if (studio !== 'all') contentType = 'movie';
        refreshContent();
    }

    function clearFilters() {
        contentType = 'all';
        sortBy = 'popularity';
        ratingFilter = 'all';
        studio = 'all';
        genre = 'all';
        refreshContent();
    }

    function loadMoreObserver(node: HTMLElement) {
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0]?.isIntersecting) return;
            if (showingSearch) {
                if (!searching && searchPage < searchTotalPages) runSearch(false);
            } else if (!browseLoading && browsePage < browseTotalPages) {
                loadBrowse(false);
            }
        });
        observer.observe(node);
        return { destroy: () => observer.disconnect() };
    }

    onMount(() => {
        if (data.tmdbConfigured) loadBrowse(true);
        return () => clearTimeout(debounceTimer);
    });
</script>

<svelte:head>
    <title>Explore · Riven</title>
</svelte:head>

<div class="space-y-6">
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <div class="flex items-center gap-2">
                    <Sparkles class="size-5 text-primary" />
                    <h1 class="text-2xl font-semibold">Explore</h1>
                </div>
                <p class="mt-1 text-sm text-muted-foreground">
                    Find your next favorite movie or show.
                </p>
            </div>
            {#if data.tmdbConfigured && activeFilterCount > 0}
                <Button variant="ghost" size="sm" onclick={clearFilters}>
                    <X class="size-4" />
                    Clear filters
                </Button>
            {/if}
        </div>

        {#if !data.tmdbConfigured}
            <div class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Search and discovery need a TMDB token. Set
                <code class="font-mono">TMDB_READ_ACCESS_TOKEN</code> and restart the frontend.
            </div>
        {:else}
            <div class="relative max-w-2xl">
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

            <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-1 text-sm text-muted-foreground">
                    <SlidersHorizontal class="size-4" />
                    <span class="hidden sm:inline">Browse by</span>
                </div>

                <div class="flex rounded-md border bg-muted/40 p-1">
                    {#each contentOptions as option (option.value)}
                        <button
                            type="button"
                            class={`rounded px-3 py-1.5 text-sm transition-colors ${
                                contentType === option.value
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                            aria-pressed={contentType === option.value}
                            onclick={() => setContentType(option.value)}
                        >
                            {option.label}
                        </button>
                    {/each}
                </div>

                <div class="hidden h-6 border-l sm:block"></div>

                <Select.Root type="single" bind:value={sortBy} onValueChange={refreshContent}>
                    <Select.Trigger class="w-36">{sortLabel}</Select.Trigger>
                    <Select.Content>
                        {#each sortOptions as option (option.value)}
                            <Select.Item value={option.value}>{option.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>

                <Select.Root type="single" bind:value={ratingFilter} onValueChange={refreshContent}>
                    <Select.Trigger class="w-32">{ratingLabel}</Select.Trigger>
                    <Select.Content>
                        {#each ratingOptions as option (option.value)}
                            <Select.Item value={option.value}>{option.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>

                <Select.Root
                    type="single"
                    bind:value={genre}
                    disabled={showingSearch}
                    onValueChange={refreshContent}
                >
                    <Select.Trigger class="w-32">{genreLabel}</Select.Trigger>
                    <Select.Content>
                        {#each genreOptions as option (option.value)}
                            <Select.Item value={option.value}>{option.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>

                <Select.Root
                    type="single"
                    bind:value={studio}
                    disabled={showingSearch || contentType === 'tv'}
                    onValueChange={setStudio}
                >
                    <Select.Trigger class="w-36">{studioLabel}</Select.Trigger>
                    <Select.Content>
                        {#each studioOptions as option (option.value)}
                            <Select.Item value={option.value}>{option.label}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            {#if showingSearch && (studio !== 'all' || genre !== 'all')}
                <p class="text-xs text-muted-foreground">
                    Studio and genre filters apply to Browse mode. Clear the search to use them.
                </p>
            {/if}

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
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <h2 class="text-lg font-semibold">Search results</h2>
                        <p class="text-xs text-muted-foreground">
                            {results.length ? `${results.length} loaded` : 'Searching TMDB…'}
                        </p>
                    </div>
                    {#if sortBy === 'rating'}
                        <span class="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star class="size-3.5 fill-current text-primary" />
                            Sorted by rating
                        </span>
                    {/if}
                </div>

                <div
                    class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {#each results as result (result.media_type + ':' + result.id)}
                        {@const mediaType = mediaTypeFor(result)}
                        {@const libraryState = libraryStateFor(result)}
                        <div class="group relative">
                            <PosterCard
                                title={titleFor(result)}
                                posterPath={result.poster_path}
                                year={Number(releaseDateFor(result).slice(0, 4)) || null}
                                type={mediaType === 'tv' ? 'show' : 'movie'}
                                href={`/explore/${mediaType}/${result.id}`}
                                state={libraryState}
                                rating={result.vote_average}
                                note={libraryState ?? (mediaType === 'tv' ? 'Show' : 'Movie')}
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

                {#if searching || searchPage < searchTotalPages}
                    <div use:loadMoreObserver class="flex justify-center py-5">
                        <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
                    </div>
                {:else if results.length > 0}
                    <p class="py-3 text-center text-xs text-muted-foreground">
                        That’s everything TMDB found for this search.
                    </p>
                {/if}
            {/if}
        {:else}
            <section class="space-y-4">
                <div class="flex items-end justify-between gap-3">
                    <div>
                        <h2 class="text-lg font-semibold">
                            {sortBy === 'rating'
                                ? 'Top rated'
                                : sortBy === 'newest'
                                  ? 'New releases'
                                  : 'Discover'}
                        </h2>
                        <p class="text-xs text-muted-foreground">
                            {#if browseLoaded}
                                {items.length} titles loaded · keep scrolling for more
                            {:else}
                                Curated from TMDB
                            {/if}
                        </p>
                    </div>
                    {#if sortBy === 'popularity'}
                        <span
                            class="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"
                        >
                            <Sparkles class="size-3.5 text-primary" />
                            Popular right now
                        </span>
                    {/if}
                </div>

                {#if browseError}
                    <div
                        class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                    >
                        {browseError}
                    </div>
                {/if}

                {#if items.length === 0 && !browseLoading}
                    <div
                        class="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
                    >
                        No titles match these filters.
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    >
                        {#each items as result (result.media_type + ':' + result.id)}
                            {@const mediaType = mediaTypeFor(result)}
                            {@const libraryState = libraryStateFor(result)}
                            <div class="group relative">
                                <PosterCard
                                    title={titleFor(result)}
                                    posterPath={result.poster_path}
                                    year={Number(releaseDateFor(result).slice(0, 4)) || null}
                                    type={mediaType === 'tv' ? 'show' : 'movie'}
                                    href={`/explore/${mediaType}/${result.id}`}
                                    state={libraryState}
                                    rating={result.vote_average}
                                    note={libraryState ?? (mediaType === 'tv' ? 'Show' : 'Movie')}
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

                    {#if browseLoading || browsePage < browseTotalPages}
                        <div use:loadMoreObserver class="flex justify-center py-5">
                            <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
                        </div>
                    {:else if items.length > 0}
                        <p class="py-3 text-center text-xs text-muted-foreground">
                            You’ve reached the end of this collection. Change a filter to keep
                            exploring.
                        </p>
                    {/if}
                {/if}
            </section>
        {/if}
    {/if}
</div>

<RequestDialog target={requestTarget} onClose={() => (requestTarget = null)} />
