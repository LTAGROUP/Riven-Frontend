<script lang="ts">
    import { Copy, Share2 } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    import { enhance } from '$app/forms';

    import CapabilityGate from '$lib/components/capability-gate.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { getCapabilities } from '$lib/capabilities-context';

    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();

    const capabilities = $derived(getCapabilities());
    let sharing = $state(false);

    async function copySessionId() {
        if (form && 'sessionId' in form && form.sessionId) {
            await navigator.clipboard.writeText(String(form.sessionId));
            toast.success('Session id copied');
        }
    }
</script>

<svelte:head>
    <title>Logs · Riven</title>
</svelte:head>

<div class="max-w-2xl space-y-4">
    <h1 class="text-2xl font-semibold">Logs</h1>

    <Card.Root>
        <Card.Header>
            <Card.Title>Share logs</Card.Title>
            <Card.Description>
                riven-ts writes rotated log files when the file transport is enabled. If your
                deployment stores them on the host under
                <code class="font-mono">/riven/logs/ecs</code>, follow the current JSON log with
                <code class="font-mono">tail -F /riven/logs/ecs/ecs.json</code>. The web UI does not
                stream those files yet. This action uploads the last 24 hours of logs to the Riven
                team's log service and gives you a session id to share when asking for support.
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            <form
                method="POST"
                action="?/share"
                use:enhance={() => {
                    sharing = true;
                    return async ({ result, update }) => {
                        sharing = false;
                        if (result.type === 'failure') {
                            toast.error(String(result.data?.message ?? 'Sharing logs failed'));
                        }
                        await update({ reset: false });
                    };
                }}
            >
                <CapabilityGate enabled={capabilities.hasShareLogs}>
                    {#snippet children({ disabled })}
                        <Button type="submit" disabled={disabled || sharing}>
                            <Share2 class="size-4" />
                            {sharing ? 'Uploading…' : 'Upload last 24h of logs'}
                        </Button>
                    {/snippet}
                </CapabilityGate>
            </form>

            {#if form && 'sessionId' in form && form.sessionId}
                <div class="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
                    <code class="flex-1 font-mono text-sm">{form.sessionId}</code>
                    <Button variant="ghost" size="icon" onclick={copySessionId}>
                        <Copy class="size-4" />
                        <span class="sr-only">Copy session id</span>
                    </Button>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
