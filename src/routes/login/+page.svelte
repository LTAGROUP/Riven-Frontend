<script lang="ts">
    import { enhance } from '$app/forms';

    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';

    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
    let submitting = $state(false);
</script>

<svelte:head>
    <title>Sign in · Riven</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
    <Card.Root class="w-full max-w-sm">
        <Card.Header class="text-center">
            <div
                class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/15"
            >
                <span class="font-sans text-2xl font-bold text-primary">R</span>
            </div>
            <Card.Title class="text-xl">Riven</Card.Title>
            <Card.Description>Enter the password to access your media server.</Card.Description>
        </Card.Header>
        <Card.Content>
            <form
                method="POST"
                use:enhance={() => {
                    submitting = true;
                    return async ({ update }) => {
                        submitting = false;
                        await update();
                    };
                }}
                class="flex flex-col gap-4"
            >
                <div class="flex flex-col gap-2">
                    <Label for="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autofocus
                        autocomplete="current-password"
                        placeholder="••••••••"
                    />
                </div>
                {#if form?.message}
                    <p class="text-sm text-destructive">{form.message}</p>
                {/if}
                <Button type="submit" disabled={submitting} class="w-full">
                    {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
            </form>
        </Card.Content>
    </Card.Root>
</div>
