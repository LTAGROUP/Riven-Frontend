<script lang="ts">
    import { enhance } from '$app/forms';

    import { Button } from '$lib/components/ui/button';
    import * as Card from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';

    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
    let submitting = $state(false);
    let unexpectedError = $state<string | null>(null);
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
                    unexpectedError = null;
                    return async ({ result, update }) => {
                        submitting = false;
                        if (result.type === 'error') {
                            // Typically a CSRF 403: the ORIGIN env var doesn't
                            // match the URL in the address bar.
                            unexpectedError =
                                "Login request was rejected by the server. If you are the admin: check that the ORIGIN environment variable exactly matches this site's URL.";
                        }
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
                {:else if unexpectedError}
                    <p class="text-sm text-destructive">{unexpectedError}</p>
                {/if}
                <Button type="submit" disabled={submitting} class="w-full">
                    {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
            </form>
        </Card.Content>
    </Card.Root>
</div>
