<script lang="ts">
    import { Copy, Download, TriangleAlert, Upload } from '@lucide/svelte';
    import { toast } from 'svelte-sonner';

    import SettingField from '$lib/components/setting-field.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Switch } from '$lib/components/ui/switch';
    import * as Tabs from '$lib/components/ui/tabs';
    import { Textarea } from '$lib/components/ui/textarea';
    import { getCapabilities } from '$lib/capabilities-context';
    import { CORE_SECTIONS, CORE_SETTINGS } from '$lib/settings-schema/core';
    import {
        generateEnv,
        parseEnvFile,
        valueKey,
        type SettingsValues
    } from '$lib/settings-schema/env-file';
    import { PLUGINS } from '$lib/settings-schema/plugins';
    import { coreEnvVar, pluginEnvVar } from '$lib/settings-schema/types';
    import { browser } from '$app/environment';

    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    const capabilities = $derived(getCapabilities());

    const STORAGE_KEY = 'riven-settings-draft-v1';

    function loadDraft(): { values: SettingsValues; enabledPlugins: string[] } {
        if (!browser) return { values: {}, enabledPlugins: [] };
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw) as { values: SettingsValues; enabledPlugins: string[] };
        } catch {
            // corrupted draft — start fresh
        }
        return { values: {}, enabledPlugins: [] };
    }

    const draft = loadDraft();
    let values = $state<SettingsValues>(draft.values);
    let enabledPlugins = $state<string[]>(draft.enabledPlugins);
    let importOpen = $state(false);
    let importText = $state('');

    $effect(() => {
        const snapshot = JSON.stringify({ values, enabledPlugins });
        if (browser) localStorage.setItem(STORAGE_KEY, snapshot);
    });

    const generated = $derived(generateEnv(values, enabledPlugins));

    function setValue(key: string, value: string) {
        values = { ...values, [key]: value };
    }

    function togglePlugin(name: string, on: boolean) {
        enabledPlugins = on
            ? [...new Set([...enabledPlugins, name])]
            : enabledPlugins.filter((plugin) => plugin !== name);
    }

    async function copy(text: string, what: string) {
        await navigator.clipboard.writeText(text);
        toast.success(`${what} copied`);
    }

    function downloadEnv() {
        const blob = new Blob([generated.envFile], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = '.env.riven';
        anchor.click();
        URL.revokeObjectURL(url);
    }

    function runImport() {
        const parsed = parseEnvFile(importText);
        values = { ...values, ...parsed.values };
        if (parsed.enabledPlugins.length) enabledPlugins = parsed.enabledPlugins;
        importOpen = false;
        importText = '';
        toast.success('Settings imported into the editor');
    }

    const dangerSettings = $derived(CORE_SETTINGS.filter((def) => def.unsafe));
</script>

<svelte:head>
    <title>Settings · Riven</title>
</svelte:head>

<div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-2xl font-semibold">Settings</h1>
        <Button variant="outline" size="sm" onclick={() => (importOpen = true)}>
            <Upload class="size-4" />
            Import .env.riven
        </Button>
    </div>

    <div class="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
        riven-ts reads its configuration from environment variables at startup — it has no
        settings-write API yet. Edit values here, then copy the generated
        <code class="font-mono">.env.riven</code> below into your deployment and restart the riven-ts
        container to apply.
    </div>

    <div class="grid gap-6 xl:grid-cols-[1fr_28rem]">
        <Tabs.Root value="core">
            <Tabs.List>
                <Tabs.Trigger value="core">Core</Tabs.Trigger>
                <Tabs.Trigger value="plugins">Plugins</Tabs.Trigger>
                <Tabs.Trigger value="live">Live</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="core" class="space-y-4">
                {#each CORE_SECTIONS.filter((section) => section.id !== 'danger-zone') as section (section.id)}
                    {@const sectionSettings = CORE_SETTINGS.filter(
                        (def) =>
                            def.section === section.id &&
                            !def.unsafe &&
                            def.key !== 'enabledPlugins'
                    )}
                    {#if sectionSettings.length > 0}
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>{section.label}</Card.Title>
                            </Card.Header>
                            <Card.Content class="divide-y">
                                {#each sectionSettings as def (def.key)}
                                    <SettingField
                                        {def}
                                        envVar={coreEnvVar(def.key)}
                                        value={values[valueKey(null, def.key)] ?? ''}
                                        onChange={(next) => setValue(valueKey(null, def.key), next)}
                                    />
                                {/each}
                            </Card.Content>
                        </Card.Root>
                    {/if}
                {/each}

                <Card.Root class="border-destructive/40">
                    <Card.Header>
                        <Card.Title class="flex items-center gap-2 text-destructive">
                            <TriangleAlert class="size-4" />
                            Danger zone
                        </Card.Title>
                        <Card.Description>
                            These wipe data on startup. Leave off unless you know what you're doing.
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="divide-y">
                        {#each dangerSettings as def (def.key)}
                            <SettingField
                                {def}
                                envVar={coreEnvVar(def.key)}
                                value={values[valueKey(null, def.key)] ?? ''}
                                onChange={(next) => setValue(valueKey(null, def.key), next)}
                            />
                        {/each}
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>

            <Tabs.Content value="plugins" class="space-y-4">
                {#each PLUGINS as plugin (plugin.name)}
                    {@const active = plugin.permanent || enabledPlugins.includes(plugin.name)}
                    <Card.Root>
                        <Card.Header>
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <Card.Title class="flex items-center gap-2">
                                        {plugin.label}
                                        {#if capabilities.plugins.includes(plugin.name)}
                                            <span
                                                class="size-2 rounded-full bg-emerald-400"
                                                title="active on backend"
                                            ></span>
                                        {/if}
                                    </Card.Title>
                                    <Card.Description>{plugin.description}</Card.Description>
                                </div>
                                {#if plugin.permanent}
                                    <span class="text-xs text-muted-foreground">always on</span>
                                {:else}
                                    <Switch
                                        checked={active}
                                        onCheckedChange={(checked) =>
                                            togglePlugin(plugin.name, checked)}
                                    />
                                {/if}
                            </div>
                        </Card.Header>
                        {#if active && plugin.settings.length > 0}
                            <Card.Content class="divide-y">
                                {#each plugin.settings as def (def.key)}
                                    <SettingField
                                        {def}
                                        envVar={pluginEnvVar(plugin, def.key)}
                                        value={values[valueKey(plugin.name, def.key)] ?? ''}
                                        onChange={(next) =>
                                            setValue(valueKey(plugin.name, def.key), next)}
                                    />
                                {/each}
                            </Card.Content>
                        {/if}
                    </Card.Root>
                {/each}
            </Tabs.Content>

            <Tabs.Content value="live">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Reported by backend</Card.Title>
                        <Card.Description>
                            Values from the GraphQL <code class="font-mono">settings</code> query (currently
                            stubbed in riven-ts).
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        {#if data.live}
                            <dl class="grid grid-cols-2 gap-2 text-sm">
                                <dt class="text-muted-foreground">Version</dt>
                                <dd>{data.live.version}</dd>
                                <dt class="text-muted-foreground">Log level</dt>
                                <dd>{data.live.logLevel}</dd>
                            </dl>
                        {:else}
                            <p class="text-sm text-muted-foreground">
                                Settings query unavailable{capabilities.backendReachable
                                    ? ''
                                    : ' — backend offline'}.
                            </p>
                        {/if}
                        <dl class="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-sm">
                            <dt class="text-muted-foreground">Frontend → backend URL</dt>
                            <dd class="truncate font-mono text-xs">
                                {data.frontend.backendGraphqlUrl}
                            </dd>
                            <dt class="text-muted-foreground">TMDB token</dt>
                            <dd>{data.frontend.tmdbConfigured ? 'configured' : 'not set'}</dd>
                        </dl>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>

        <div class="space-y-3 xl:sticky xl:top-6 xl:self-start">
            <Card.Root>
                <Card.Header>
                    <div class="flex items-center justify-between">
                        <Card.Title>.env.riven</Card.Title>
                        <div class="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onclick={() => copy(generated.envFile, '.env.riven')}
                            >
                                <Copy class="size-4" />
                                <span class="sr-only">Copy env file</span>
                            </Button>
                            <Button variant="ghost" size="icon" onclick={downloadEnv}>
                                <Download class="size-4" />
                                <span class="sr-only">Download env file</span>
                            </Button>
                        </div>
                    </div>
                    <Card.Description>Restart riven-ts after applying.</Card.Description>
                </Card.Header>
                <Card.Content class="space-y-3">
                    {#if generated.problems.length > 0}
                        <ul
                            class="space-y-1 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive"
                        >
                            {#each generated.problems as problem (problem)}
                                <li>{problem}</li>
                            {/each}
                        </ul>
                    {/if}
                    <pre
                        class="max-h-96 overflow-auto rounded-md bg-muted/40 p-3 font-mono text-xs leading-relaxed">{generated.envFile}</pre>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <div class="flex items-center justify-between">
                        <Card.Title>docker-compose snippet</Card.Title>
                        <Button
                            variant="ghost"
                            size="icon"
                            onclick={() => copy(generated.composeSnippet, 'Compose snippet')}
                        >
                            <Copy class="size-4" />
                            <span class="sr-only">Copy compose snippet</span>
                        </Button>
                    </div>
                </Card.Header>
                <Card.Content>
                    <pre
                        class="max-h-60 overflow-auto rounded-md bg-muted/40 p-3 font-mono text-xs leading-relaxed">{generated.composeSnippet}</pre>
                </Card.Content>
            </Card.Root>
        </div>
    </div>
</div>

<Dialog.Root bind:open={importOpen}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Import existing configuration</Dialog.Title>
            <Dialog.Description>
                Paste your current <code class="font-mono">.env.riven</code> (or any env lines) — recognised
                values populate the editor.
            </Dialog.Description>
        </Dialog.Header>
        <Textarea
            bind:value={importText}
            rows={10}
            class="font-mono text-xs"
            placeholder="RIVEN_SETTING__databaseUrl=postgresql://…"
        />
        <Dialog.Footer>
            <Button variant="outline" onclick={() => (importOpen = false)}>Cancel</Button>
            <Button onclick={runImport} disabled={!importText.trim()}>Import</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
