import { getContext, setContext } from 'svelte';

import type { Capabilities } from '$lib/types';

const KEY = Symbol('capabilities');

export function setCapabilities(get: () => Capabilities): void {
    setContext(KEY, get);
}

export function getCapabilities(): Capabilities {
    const get = getContext<() => Capabilities>(KEY);
    return get();
}

export type { Capabilities };
