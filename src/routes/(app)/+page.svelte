<script lang="ts">
    import MediaRow from '$lib/components/media-row.svelte';
    import PosterCard from '$lib/components/poster-card.svelte';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Home · Riven</title>
</svelte:head>

<div class="space-y-8">
    <MediaRow title="Recently added">
        {#snippet action()}
            <a href="/library" class="text-sm text-primary hover:underline">View library</a>
        {/snippet}
        {#if data.recentlyAdded.length === 0}
            <div
                class="col-span-full flex h-40 w-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
            >
                {data.libraryError ? 'Backend unavailable' : 'Nothing in your library yet'}
            </div>
        {:else}
            {#each data.recentlyAdded as item (item.id)}
                <PosterCard
                    title={item.title}
                    posterPath={item.posterPath}
                    year={item.year}
                    type={item.type}
                    state={item.state}
                    href={`/media/${item.id}`}
                />
            {/each}
        {/if}
    </MediaRow>

    {#if data.tmdbConfigured}
        <MediaRow title="Trending movies">
            {#snippet action()}
                <a href="/explore?type=movie" class="text-sm text-primary hover:underline"
                    >Explore</a
                >
            {/snippet}
            {#each data.trendingMovies as movie (movie.id)}
                <PosterCard
                    title={movie.title ?? 'Untitled'}
                    posterPath={movie.poster_path}
                    year={movie.release_date ? Number(movie.release_date.slice(0, 4)) : null}
                    type="movie"
                    href={`/explore?request=movie:${movie.id}`}
                />
            {/each}
        </MediaRow>

        <MediaRow title="Trending shows">
            {#snippet action()}
                <a href="/explore?type=tv" class="text-sm text-primary hover:underline">Explore</a>
            {/snippet}
            {#each data.trendingShows as show (show.id)}
                <PosterCard
                    title={show.name ?? 'Untitled'}
                    posterPath={show.poster_path}
                    year={show.first_air_date ? Number(show.first_air_date.slice(0, 4)) : null}
                    type="show"
                    href={`/explore?request=tv:${show.id}`}
                />
            {/each}
        </MediaRow>
    {:else}
        <div class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Set <code class="font-mono">TMDB_READ_ACCESS_TOKEN</code> to see trending titles and search
            for new media to request.
        </div>
    {/if}
</div>
