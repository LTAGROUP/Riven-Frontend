<script lang="ts">
    import { cn } from '$lib/utils';
    import { STATE_CLASSES, STATE_LABELS, type MediaItemState } from '$lib/media/states';

    interface Props {
        state: string;
        class?: string;
    }

    let { state, class: className }: Props = $props();

    const known = $derived(state in STATE_LABELS ? (state as MediaItemState) : 'unknown');
</script>

<span
    class={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STATE_CLASSES[known],
        className
    )}
>
    {STATE_LABELS[known]}
</span>
