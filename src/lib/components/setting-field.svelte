<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import * as Select from '$lib/components/ui/select';
    import { Switch } from '$lib/components/ui/switch';
    import { Textarea } from '$lib/components/ui/textarea';

    import type { SettingDef } from '$lib/settings-schema/types';

    interface Props {
        def: SettingDef;
        value: string;
        onChange: (value: string) => void;
        envVar: string;
    }

    let { def, value, onChange, envVar }: Props = $props();

    const boolValue = $derived(value === '' ? Boolean(def.default) : value === 'true');
    const selectLabel = $derived(value || String(def.default ?? 'select…'));
</script>

<div class="space-y-1.5 py-3">
    <div class="flex items-center justify-between gap-4">
        <Label class="font-medium">
            {def.key}
            {#if def.required}
                <span class="text-destructive">*</span>
            {/if}
        </Label>

        {#if def.kind === 'bool'}
            <Switch checked={boolValue} onCheckedChange={(checked) => onChange(String(checked))} />
        {/if}
    </div>

    {#if def.kind === 'enum'}
        <Select.Root
            type="single"
            value={value || String(def.default ?? '')}
            onValueChange={(next) => onChange(next)}
        >
            <Select.Trigger class="w-full max-w-xs">{selectLabel}</Select.Trigger>
            <Select.Content>
                {#each def.enumValues ?? [] as option (option)}
                    <Select.Item value={option}>{option}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
    {:else if def.kind === 'json'}
        <Textarea
            {value}
            oninput={(event) => onChange(event.currentTarget.value)}
            placeholder={def.placeholder ?? JSON.stringify(def.default ?? [])}
            rows={2}
            class="font-mono text-xs"
        />
    {:else if def.kind !== 'bool'}
        <Input
            {value}
            oninput={(event) => onChange(event.currentTarget.value)}
            type={def.kind === 'int' ? 'number' : 'text'}
            placeholder={def.placeholder ??
                (def.default !== undefined ? String(def.default) : undefined)}
        />
    {/if}

    <p class="text-xs text-muted-foreground">{def.description}</p>
    <p class="font-mono text-[10px] text-muted-foreground/60">{envVar}</p>
</div>
