<script lang="ts">
    import {
        Compass,
        FileText,
        FolderTree,
        Gauge,
        Library,
        LogOut,
        Settings,
        House
    } from '@lucide/svelte';

    import { page } from '$app/state';
    import { cn } from '$lib/utils';

    interface Props {
        /** Called after a navigation link is clicked (used to close mobile sheet). */
        onNavigate?: () => void;
    }

    let { onNavigate }: Props = $props();

    const links = [
        { href: '/', label: 'Home', icon: House },
        { href: '/library', label: 'Library', icon: Library },
        { href: '/explore', label: 'Explore', icon: Compass },
        { href: '/summary', label: 'Summary', icon: Gauge },
        { href: '/vfs', label: 'Files', icon: FolderTree },
        { href: '/logs', label: 'Logs', icon: FileText },
        { href: '/settings', label: 'Settings', icon: Settings }
    ];

    function isActive(href: string): boolean {
        if (href === '/') return page.url.pathname === '/';
        return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
    }
</script>

<nav class="flex h-full flex-col gap-1 p-3">
    <a href="/" class="mb-4 flex items-center gap-2 px-2 py-1" onclick={onNavigate}>
        <div class="flex size-8 items-center justify-center rounded-lg bg-primary/15">
            <span class="font-bold text-primary">R</span>
        </div>
        <span class="text-lg font-semibold tracking-wide">Riven</span>
    </a>

    {#each links as link (link.href)}
        <a
            href={link.href}
            onclick={onNavigate}
            class={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive(link.href)
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
        >
            <link.icon class="size-4" />
            {link.label}
        </a>
    {/each}

    <div class="mt-auto">
        <form method="POST" action="/logout">
            <button
                type="submit"
                class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
                <LogOut class="size-4" />
                Sign out
            </button>
        </form>
    </div>
</nav>
