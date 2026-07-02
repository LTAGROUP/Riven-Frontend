<script lang="ts">
    import { Menu, ServerOff } from '@lucide/svelte';

    import SidebarNav from '$lib/components/sidebar-nav.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as Sheet from '$lib/components/ui/sheet';
    import { setCapabilities } from '$lib/capabilities-context';

    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

    setCapabilities(() => data.capabilities);

    let mobileNavOpen = $state(false);
</script>

<div class="flex min-h-screen">
    <aside class="sticky top-0 hidden h-screen w-56 shrink-0 border-r bg-sidebar lg:block">
        <SidebarNav />
    </aside>

    <div class="min-w-0 flex-1">
        <header
            class="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:hidden"
        >
            <Sheet.Root bind:open={mobileNavOpen}>
                <Sheet.Trigger>
                    {#snippet child({ props })}
                        <Button variant="ghost" size="icon" {...props}>
                            <Menu class="size-5" />
                            <span class="sr-only">Open navigation</span>
                        </Button>
                    {/snippet}
                </Sheet.Trigger>
                <Sheet.Content side="left" class="w-64 p-0">
                    <SidebarNav onNavigate={() => (mobileNavOpen = false)} />
                </Sheet.Content>
            </Sheet.Root>
            <span class="font-semibold">Riven</span>
        </header>

        {#if !data.capabilities.backendReachable}
            <div
                class="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
                <ServerOff class="size-4 shrink-0" />
                <span>
                    Backend unreachable — check that riven-ts is running and
                    <code class="font-mono">BACKEND_GRAPHQL_URL</code> is correct.
                </span>
            </div>
        {/if}

        <main class="p-4 md:p-6">
            {@render children()}
        </main>
    </div>
</div>
