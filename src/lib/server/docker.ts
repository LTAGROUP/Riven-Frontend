import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { getEnv } from '$lib/server/env';

const execFileAsync = promisify(execFile);

async function docker(args: string[]): Promise<string> {
    const { stdout, stderr } = await execFileAsync('docker', args, {
        timeout: 30_000,
        maxBuffer: 1024 * 1024
    });
    return (stdout || stderr).trim();
}

export async function restartRiven(): Promise<void> {
    await docker(['restart', getEnv().RIVEN_CONTAINER_NAME]);
}

export async function clearRedisCache(): Promise<void> {
    await docker(['exec', getEnv().RIVEN_REDIS_CONTAINER_NAME, 'redis-cli', 'FLUSHALL']);
}
