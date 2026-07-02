export type SettingKind = 'string' | 'url' | 'int' | 'bool' | 'enum' | 'json' | 'path';

export interface SettingDef {
    /** Exact camelCase key as consumed by the backend Zod schema. */
    key: string;
    kind: SettingKind;
    description: string;
    section: string;
    default?: unknown;
    required?: boolean;
    enumValues?: string[];
    /** Marks danger-zone settings rendered behind a red collapse. */
    unsafe?: boolean;
    /** Placeholder shown in the input. */
    placeholder?: string;
}

export interface PluginDef {
    /** Plugin name as used in enabledPlugins (e.g. "seerr"). */
    name: string;
    /** Human label. */
    label: string;
    description: string;
    /** Env var prefix segment, constantCase of the package name. */
    envPrefix: string;
    /** Always registered regardless of enabledPlugins (tmdb, tvdb). */
    permanent?: boolean;
    settings: SettingDef[];
}

export const CORE_ENV_PREFIX = 'RIVEN_SETTING__';
export const PLUGIN_ENV_PREFIX = 'RIVEN_PLUGIN_SETTING__';

export function coreEnvVar(key: string): string {
    return `${CORE_ENV_PREFIX}${key}`;
}

export function pluginEnvVar(plugin: PluginDef, key: string): string {
    return `${PLUGIN_ENV_PREFIX}${plugin.envPrefix}__${key}`;
}
