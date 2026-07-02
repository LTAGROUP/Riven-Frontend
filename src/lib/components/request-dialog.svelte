<script lang="ts">
    import { LoaderCircle } from '@lucide/svelte';
    import { SvelteSet } from 'svelte/reactivity';
    import { toast } from 'svelte-sonner';

    import { enhance } from '$app/forms';

    import { Button } from '$lib/components/ui/button';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Label } from '$lib/components/ui/label';

    export interface RequestTarget {
        mediaType: 'movie' | 'tv';
        tmdbId: number;
        title: string;
        year?: string | null;
    }

    interface SeasonOption {
        number: number;
        name: string;
        episodeCount: number;
    }

    interface Props {
        target: RequestTarget | null;
        onClose: () => void;
        onRequested?: () => void;
    }

    let { target, onClose, onRequested }: Props = $props();

    let loading = $state(false);
    let loadError = $state<string | null>(null);
    let tvdbId = $state<string>('');
    let imdbId = $state<string>('');
    let seasons = $state<SeasonOption[]>([]);
    const selectedSeasons = new SvelteSet<number>();
    let submitting = $state(false);

    $effect(() => {
        if (!target) return;
        loadError = null;
        tvdbId = '';
        imdbId = '';
        seasons = [];
        selectedSeasons.clear();

        loading = true;
        const controller = new AbortController();
        (async () => {
            try {
                const idsResponse = await fetch(
                    `/api/tmdb/${target.mediaType}/${target.tmdbId}/external_ids`,
                    { signal: controller.signal }
                );
                if (!idsResponse.ok) throw new Error('Failed to load external ids from TMDB');
                const ids = (await idsResponse.json()) as {
                    imdb_id: string | null;
                    tvdb_id: number | null;
                };
                imdbId = ids.imdb_id ?? '';
                tvdbId = ids.tvdb_id ? String(ids.tvdb_id) : '';

                if (target.mediaType === 'tv') {
                    const detailsResponse = await fetch(`/api/tmdb/tv/${target.tmdbId}`, {
                        signal: controller.signal
                    });
                    if (!detailsResponse.ok) throw new Error('Failed to load seasons from TMDB');
                    const details = (await detailsResponse.json()) as {
                        seasons?: { season_number: number; name: string; episode_count: number }[];
                    };
                    seasons = (details.seasons ?? [])
                        .filter((season) => season.season_number > 0)
                        .map((season) => ({
                            number: season.season_number,
                            name: season.name,
                            episodeCount: season.episode_count
                        }));
                    selectedSeasons.clear();
                    for (const season of seasons) selectedSeasons.add(season.number);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    loadError = cause instanceof Error ? cause.message : 'Failed to load metadata';
                }
            } finally {
                loading = false;
            }
        })();
        return () => controller.abort();
    });

    function toggleSeason(num: number, value: boolean) {
        if (value) selectedSeasons.add(num);
        else selectedSeasons.delete(num);
    }

    const canSubmit = $derived(
        Boolean(target) &&
            !loading &&
            !submitting &&
            (target?.mediaType === 'movie' ? true : Boolean(tvdbId) && selectedSeasons.size > 0)
    );
</script>

<Dialog.Root open={target !== null} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Content class="max-h-[85vh] overflow-y-auto">
        {#if target}
            <form
                method="POST"
                action="/explore?/request"
                use:enhance={() => {
                    submitting = true;
                    return async ({ result, update }) => {
                        submitting = false;
                        if (result.type === 'success') {
                            toast.success(String(result.data?.message ?? 'Requested'));
                            onRequested?.();
                            onClose();
                        } else if (result.type === 'failure') {
                            toast.error(String(result.data?.message ?? 'Request failed'));
                        }
                        await update({ reset: false });
                    };
                }}
                class="space-y-4"
            >
                <Dialog.Header>
                    <Dialog.Title>
                        Request “{target.title}”{target.year ? ` (${target.year})` : ''}
                    </Dialog.Title>
                    <Dialog.Description>
                        {target.mediaType === 'movie'
                            ? 'The movie will be added to Riven and processed automatically.'
                            : 'Pick the seasons to grab. Riven tracks ongoing shows automatically.'}
                    </Dialog.Description>
                </Dialog.Header>

                <input type="hidden" name="mediaType" value={target.mediaType} />
                <input type="hidden" name="tmdbId" value={target.tmdbId} />
                <input type="hidden" name="tvdbId" value={tvdbId} />
                <input type="hidden" name="imdbId" value={imdbId} />

                {#if loading}
                    <div
                        class="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
                    >
                        <LoaderCircle class="size-4 animate-spin" />
                        Loading metadata…
                    </div>
                {:else if loadError}
                    <p class="text-sm text-destructive">{loadError}</p>
                {:else if target.mediaType === 'tv'}
                    {#if !tvdbId}
                        <p
                            class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                        >
                            TMDB has no TVDB id for this show. riven-ts indexes shows by TVDB id, so
                            it can't be requested from here.
                        </p>
                    {:else}
                        <fieldset class="space-y-2">
                            <legend class="text-sm font-medium">Seasons</legend>
                            <div
                                class="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2"
                            >
                                {#each seasons as season (season.number)}
                                    <Label
                                        class="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-primary/5"
                                    >
                                        <Checkbox
                                            name="season"
                                            value={String(season.number)}
                                            checked={selectedSeasons.has(season.number)}
                                            onCheckedChange={(value) =>
                                                toggleSeason(season.number, value === true)}
                                        />
                                        <span class="flex-1 truncate">{season.name}</span>
                                        <span class="text-xs text-muted-foreground">
                                            {season.episodeCount} ep
                                        </span>
                                    </Label>
                                {/each}
                            </div>
                        </fieldset>
                    {/if}
                {/if}

                <Dialog.Footer>
                    <Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!canSubmit}>
                        {#if submitting}
                            <LoaderCircle class="size-4 animate-spin" />
                        {/if}
                        Request
                    </Button>
                </Dialog.Footer>
            </form>
        {/if}
    </Dialog.Content>
</Dialog.Root>
