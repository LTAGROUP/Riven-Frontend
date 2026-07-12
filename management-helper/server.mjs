import { execFile } from 'node:child_process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const secret = process.env.MANAGEMENT_SECRET;
const rivenContainer = process.env.RIVEN_CONTAINER_NAME ?? 'riven';
const redisContainer = process.env.RIVEN_REDIS_CONTAINER_NAME ?? 'riven-redis';

if (
    !secret ||
    secret.length < 32 ||
    secret === 'please-generate-a-random-secret-at-least-32-chars'
) {
    throw new Error('MANAGEMENT_SECRET must be a generated secret of at least 32 characters');
}

function safeEqual(left, right) {
    const leftHash = createHash('sha256').update(left).digest();
    const rightHash = createHash('sha256').update(right).digest();
    return timingSafeEqual(leftHash, rightHash);
}

function send(response, status, body) {
    response.writeHead(status, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
    });
    response.end(JSON.stringify(body));
}

async function docker(args) {
    await execFileAsync('docker', args, { timeout: 30_000, maxBuffer: 1024 * 1024 });
}

const server = createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
        send(response, 200, { status: 'ok' });
        return;
    }

    const authorization = request.headers.authorization ?? '';
    if (!safeEqual(authorization, `Bearer ${secret}`)) {
        send(response, 401, { message: 'Unauthorized' });
        return;
    }
    if (request.method !== 'POST') {
        send(response, 405, { message: 'Method not allowed' });
        return;
    }

    try {
        if (request.url === '/restart') {
            await docker(['restart', rivenContainer]);
        } else if (request.url === '/clear-cache') {
            await docker(['exec', redisContainer, 'redis-cli', 'FLUSHALL']);
        } else {
            send(response, 404, { message: 'Not found' });
            return;
        }
        send(response, 200, { status: 'ok' });
    } catch (cause) {
        console.error(cause);
        send(response, 500, { message: 'Docker operation failed' });
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Riven management helper listening on port ${port}`);
});
