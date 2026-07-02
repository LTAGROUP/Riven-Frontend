<script lang="ts">
    import { File, Folder } from '@lucide/svelte';

    import { formatBytes, formatDate } from '$lib/utils';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const crumbs = $derived.by(() => {
        const parts = data.path.split('/').filter(Boolean);
        const result = [{ label: 'vfs', href: '/vfs' }];
        let acc = '';
        for (const part of parts) {
            acc += '/' + part;
            result.push({ label: part, href: '/vfs' + acc });
        }
        return result;
    });
</script>

<svelte:head>
    <title>Files · Riven</title>
</svelte:head>

<div class="space-y-4">
    <h1 class="text-2xl font-semibold">Virtual file system</h1>

    {#if data.unsupported}
        <p class="text-sm text-muted-foreground">The backend doesn't expose VFS queries.</p>
    {:else if data.loadError}
        <div
            class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
            {data.loadError}
        </div>
    {:else}
        <nav class="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {#each crumbs as crumb, index (crumb.href)}
                {#if index > 0}<span>/</span>{/if}
                {#if index === crumbs.length - 1}
                    <span class="text-foreground">{crumb.label}</span>
                {:else}
                    <a href={crumb.href} class="hover:text-primary hover:underline">{crumb.label}</a
                    >
                {/if}
            {/each}
        </nav>

        {#if data.entries.length === 0}
            <div
                class="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
            >
                Empty directory.
            </div>
        {:else}
            <div class="divide-y rounded-md border">
                {#each data.entries as entry (entry.path)}
                    <svelte:element
                        this={entry.isDirectory ? 'a' : 'div'}
                        href={entry.isDirectory ? `/vfs${entry.path}` : undefined}
                        class={`flex items-center gap-3 px-3 py-2 text-sm ${entry.isDirectory ? 'hover:bg-accent/50' : ''}`}
                    >
                        {#if entry.isDirectory}
                            <Folder class="size-4 shrink-0 text-primary" />
                        {:else}
                            <File class="size-4 shrink-0 text-muted-foreground" />
                        {/if}
                        <span class="min-w-0 flex-1 truncate">{entry.name}</span>
                        <span class="hidden w-24 text-right text-xs text-muted-foreground sm:block">
                            {entry.isDirectory ? '—' : formatBytes(entry.size)}
                        </span>
                        <span class="hidden w-32 text-right text-xs text-muted-foreground md:block">
                            {formatDate(entry.mtime)}
                        </span>
                    </svelte:element>
                {/each}
            </div>
        {/if}
    {/if}
</div>
