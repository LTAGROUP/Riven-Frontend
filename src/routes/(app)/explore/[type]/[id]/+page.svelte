<script lang="ts">
    import { ArrowLeft, Library, Plus } from '@lucide/svelte';

    import CapabilityGate from '$lib/components/capability-gate.svelte';
    import RequestDialog, { type RequestTarget } from '$lib/components/request-dialog.svelte';
    import { Button } from '$lib/components/ui/button';
    import { getCapabilities } from '$lib/capabilities-context';
    import { tmdbImage } from '$lib/media/images';
    import { formatDate } from '$lib/utils';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());
    const details = $derived(data.details);
    const title = $derived(details.title ?? details.name ?? 'Untitled');
    const releaseDate = $derived(details.release_date ?? details.first_air_date ?? null);
    const year = $derived(releaseDate ? releaseDate.slice(0, 4) : null);
    const poster = $derived(tmdbImage(details.poster_path, 'w500'));
    const seasons = $derived((details.seasons ?? []).filter((season) => season.season_number > 0));

    let requestTarget = $state<RequestTarget | null>(null);

    function openRequest() {
        requestTarget = {
            mediaType: data.mediaType,
            tmdbId: details.id,
            title,
            year
        };
    }
</script>

<svelte:head>
    <title>{title} · Riven</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
    <a
        href="/explore"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
        <ArrowLeft class="size-4" />
        Explore
    </a>

    <div class="flex flex-col gap-6 md:flex-row">
        <div class="w-40 shrink-0 md:w-52">
            <div class="aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                {#if poster}
                    <img src={poster} alt={title} class="size-full object-cover" />
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
                        {data.mediaType === 'tv' ? 'Show' : 'Movie'}
                    </span>
                    {#if data.libraryItemId}
                        <span
                            class="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400"
                        >
                            In library
                        </span>
                    {/if}
                </div>
                <h1 class="text-3xl font-semibold">{title}</h1>
                <p class="text-sm text-muted-foreground">
                    {year ?? '—'}
                    {#if details.genres.length}
                        · {details.genres.map((genre) => genre.name.toLowerCase()).join(', ')}
                    {/if}
                    {#if details.vote_average}
                        · ★ {details.vote_average.toFixed(1)}
                    {/if}
                </p>
            </div>

            {#if details.overview}
                <p class="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {details.overview}
                </p>
            {/if}

            <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                    <dt class="text-muted-foreground">
                        {data.mediaType === 'tv' ? 'First aired' : 'Released'}
                    </dt>
                    <dd>{formatDate(releaseDate)}</dd>
                </div>
                {#if data.mediaType === 'movie'}
                    <div>
                        <dt class="text-muted-foreground">Runtime</dt>
                        <dd>{details.runtime ? `${details.runtime} min` : '—'}</dd>
                    </div>
                {:else}
                    <div>
                        <dt class="text-muted-foreground">Status</dt>
                        <dd>{details.status ?? '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-muted-foreground">Seasons</dt>
                        <dd>
                            {details.number_of_seasons ?? seasons.length}
                            ({details.number_of_episodes ?? '?'} episodes)
                        </dd>
                    </div>
                {/if}
                <div>
                    <dt class="text-muted-foreground">TMDB</dt>
                    <dd>
                        <a
                            class="text-primary hover:underline"
                            href={`https://www.themoviedb.org/${data.mediaType}/${details.id}`}
                            target="_blank"
                            rel="noreferrer">{details.id}</a
                        >
                    </dd>
                </div>
                {#if details.external_ids.imdb_id}
                    <div>
                        <dt class="text-muted-foreground">IMDb</dt>
                        <dd>
                            <a
                                class="text-primary hover:underline"
                                href={`https://www.imdb.com/title/${details.external_ids.imdb_id}`}
                                target="_blank"
                                rel="noreferrer">{details.external_ids.imdb_id}</a
                            >
                        </dd>
                    </div>
                {/if}
                {#if details.external_ids.tvdb_id}
                    <div>
                        <dt class="text-muted-foreground">TVDB</dt>
                        <dd>
                            <a
                                class="text-primary hover:underline"
                                href={`https://www.thetvdb.com/dereferrer/series/${details.external_ids.tvdb_id}`}
                                target="_blank"
                                rel="noreferrer">{details.external_ids.tvdb_id}</a
                            >
                        </dd>
                    </div>
                {/if}
            </dl>

            <div class="flex flex-wrap gap-2">
                {#if data.libraryItemId}
                    <Button href={`/media/${data.libraryItemId}`} variant="secondary">
                        <Library class="size-4" />
                        View in library
                    </Button>
                {/if}
                <CapabilityGate
                    enabled={capabilities.hasSeerrWebhook}
                    reason="Enable the seerr plugin in riven-ts to request media"
                >
                    {#snippet children({ disabled })}
                        <Button {disabled} onclick={openRequest}>
                            <Plus class="size-4" />
                            Request
                        </Button>
                    {/snippet}
                </CapabilityGate>
            </div>
        </div>
    </div>

    {#if data.mediaType === 'tv' && seasons.length > 0}
        <section class="space-y-2">
            <h2 class="text-lg font-semibold">Seasons</h2>
            <div class="divide-y rounded-md border">
                {#each seasons as season (season.id)}
                    <div class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span class="min-w-0 truncate">{season.name}</span>
                        <span class="flex shrink-0 items-center gap-4 text-muted-foreground">
                            <span class="hidden text-xs sm:inline">
                                {formatDate(season.air_date)}
                            </span>
                            <span class="text-xs">{season.episode_count} episodes</span>
                        </span>
                    </div>
                {/each}
            </div>
        </section>
    {/if}
</div>

<RequestDialog target={requestTarget} onClose={() => (requestTarget = null)} />
