<script lang="ts">
    import { Film, Tv } from '@lucide/svelte';

    import StateBadge from './state-badge.svelte';
    import { tmdbImage } from '$lib/media/images';

    interface Props {
        title: string;
        posterPath?: string | null;
        year?: number | null;
        type?: string;
        state?: string | null;
        href?: string;
        /** Extra badge text (e.g. "In library") */
        note?: string | null;
    }

    let { title, posterPath, year, type = 'movie', state: itemState, href, note }: Props = $props();

    const poster = $derived(tmdbImage(posterPath));
    let imageFailed = $state(false);
</script>

<svelte:element
    this={href ? 'a' : 'div'}
    {href}
    class="group block w-full overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/50"
>
    <div class="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {#if poster && !imageFailed}
            <img
                src={poster}
                alt={title}
                loading="lazy"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                onerror={() => (imageFailed = true)}
            />
        {:else}
            <div class="flex size-full items-center justify-center text-muted-foreground">
                {#if type === 'movie'}
                    <Film class="size-10" />
                {:else}
                    <Tv class="size-10" />
                {/if}
            </div>
        {/if}
        {#if itemState}
            <div class="absolute top-1.5 left-1.5">
                <StateBadge state={itemState} />
            </div>
        {/if}
        {#if note}
            <div
                class="absolute right-1.5 bottom-1.5 rounded-md bg-black/70 px-2 py-0.5 text-xs text-white"
            >
                {note}
            </div>
        {/if}
    </div>
    <div class="p-2">
        <p class="truncate text-sm font-medium" {title}>{title}</p>
        <p class="text-xs text-muted-foreground">
            {year ?? '—'}
        </p>
    </div>
</svelte:element>
