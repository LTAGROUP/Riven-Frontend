<script lang="ts">
    import type { Snippet } from 'svelte';

    import * as Tooltip from '$lib/components/ui/tooltip';

    interface Props {
        /** Whether the backend supports this action. */
        enabled: boolean;
        /** Tooltip shown when disabled. */
        reason?: string;
        children: Snippet<[{ disabled: boolean }]>;
    }

    let { enabled, reason = 'Not yet supported by riven-ts', children }: Props = $props();
</script>

{#if enabled}
    {@render children({ disabled: false })}
{:else}
    <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
            <Tooltip.Trigger class="cursor-not-allowed">
                {#snippet child({ props })}
                    <span {...props}>
                        {@render children({ disabled: true })}
                    </span>
                {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>
                <p>{reason}</p>
            </Tooltip.Content>
        </Tooltip.Root>
    </Tooltip.Provider>
{/if}
