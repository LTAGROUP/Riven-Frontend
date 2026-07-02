<script lang="ts">
    import { CircleCheck, CircleX, Clapperboard, Film, Layers, Tv } from '@lucide/svelte';

    import StateBadge from '$lib/components/state-badge.svelte';
    import * as Card from '$lib/components/ui/card';
    import { getCapabilities } from '$lib/capabilities-context';
    import { MEDIA_ITEM_STATES, STATE_LABELS } from '$lib/media/states';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());

    const stateRows = $derived(
        MEDIA_ITEM_STATES.map((state) => ({
            state,
            label: STATE_LABELS[state],
            count: data.stats.byState[state]
        })).filter((row) => row.count > 0)
    );

    const maxStateCount = $derived(Math.max(1, ...stateRows.map((row) => row.count)));
</script>

<svelte:head>
    <title>Summary · Riven</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-baseline justify-between">
        <h1 class="text-2xl font-semibold">Summary</h1>
        {#if data.backendVersion}
            <span class="text-sm text-muted-foreground">riven-ts v{data.backendVersion}</span>
        {/if}
    </div>

    {#if data.source === 'database'}
        <p class="text-sm text-muted-foreground">
            Figures read directly from Riven's database ({data.stats.total} items) while the riven-ts
            listing API is broken upstream.
        </p>
    {:else if !capabilities.hasMediaItemsPagination}
        <p class="text-sm text-muted-foreground">
            Figures cover the latest {data.stats.total} items — riven-ts doesn't expose full library stats
            yet.
        </p>
    {/if}

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card.Root>
            <Card.Content class="flex items-center gap-3 p-4">
                <Layers class="size-8 text-primary" />
                <div>
                    <p class="text-2xl font-semibold">{data.stats.total}</p>
                    <p class="text-xs text-muted-foreground">Items</p>
                </div>
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Content class="flex items-center gap-3 p-4">
                <Film class="size-8 text-primary" />
                <div>
                    <p class="text-2xl font-semibold">{data.stats.byType.movie ?? 0}</p>
                    <p class="text-xs text-muted-foreground">Movies</p>
                </div>
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Content class="flex items-center gap-3 p-4">
                <Tv class="size-8 text-primary" />
                <div>
                    <p class="text-2xl font-semibold">{data.stats.byType.show ?? 0}</p>
                    <p class="text-xs text-muted-foreground">Shows</p>
                </div>
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Content class="flex items-center gap-3 p-4">
                <Clapperboard class="size-8 text-primary" />
                <div>
                    <p class="text-2xl font-semibold">{data.stats.completedPercent}%</p>
                    <p class="text-xs text-muted-foreground">Completed</p>
                </div>
            </Card.Content>
        </Card.Root>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
        <Card.Root>
            <Card.Header>
                <Card.Title>States</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
                {#if stateRows.length === 0}
                    <p class="text-sm text-muted-foreground">No items yet.</p>
                {/if}
                {#each stateRows as row (row.state)}
                    <div class="flex items-center gap-3">
                        <div class="w-24 shrink-0">
                            <StateBadge state={row.state} />
                        </div>
                        <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                                class="h-full rounded-full bg-primary/70"
                                style={`width: ${(row.count / maxStateCount) * 100}%`}
                            ></div>
                        </div>
                        <span class="w-8 text-right text-sm tabular-nums">{row.count}</span>
                    </div>
                {/each}
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Plugins</Card.Title>
                <Card.Description>Validity reported by each enabled plugin</Card.Description>
            </Card.Header>
            <Card.Content>
                {#if capabilities.plugins.length === 0}
                    <p class="text-sm text-muted-foreground">
                        No plugins detected{capabilities.backendReachable
                            ? ''
                            : ' — backend offline'}.
                    </p>
                {:else}
                    <ul class="divide-y">
                        {#each capabilities.plugins as plugin (plugin)}
                            {@const healthy = data.pluginHealth[plugin]}
                            <li class="flex items-center justify-between py-2 text-sm">
                                <span class="capitalize">{plugin}</span>
                                {#if healthy === true}
                                    <span class="flex items-center gap-1 text-emerald-400">
                                        <CircleCheck class="size-4" /> valid
                                    </span>
                                {:else if healthy === false}
                                    <span class="flex items-center gap-1 text-red-400">
                                        <CircleX class="size-4" /> invalid
                                    </span>
                                {:else}
                                    <span class="text-muted-foreground">check failed</span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {/if}
            </Card.Content>
        </Card.Root>
    </div>

    {#if data.recentFailures.length > 0}
        <Card.Root>
            <Card.Header>
                <Card.Title>Failed items</Card.Title>
            </Card.Header>
            <Card.Content>
                <ul class="divide-y">
                    {#each data.recentFailures as failure (failure.id)}
                        <li>
                            <a
                                href={`/media/${failure.id}`}
                                class="flex items-center justify-between py-2 text-sm hover:text-primary"
                            >
                                <span>{failure.title}</span>
                                <span class="text-xs text-muted-foreground capitalize"
                                    >{failure.type}</span
                                >
                            </a>
                        </li>
                    {/each}
                </ul>
            </Card.Content>
        </Card.Root>
    {/if}
</div>
