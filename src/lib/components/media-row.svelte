<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        title: string;
        /** Right-aligned header extras (e.g. a "view all" link) */
        action?: Snippet;
        children: Snippet;
    }

    let { title, action, children }: Props = $props();
</script>

<section class="space-y-3">
    <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{title}</h2>
        {#if action}
            {@render action()}
        {/if}
    </div>
    <div
        class="grid [grid-auto-columns:9rem] grid-flow-col grid-rows-1 gap-3 overflow-x-auto pb-2 md:[grid-auto-columns:10.5rem]"
    >
        {@render children()}
    </div>
</section>
