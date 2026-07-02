/**
 * In-memory fixtures for the mock backend. Covers every media item state and
 * both container shapes (movie, show → seasons → episodes).
 */

export interface MockStream {
    infoHash: string;
}

export interface MockFileEntry {
    id: string;
    type: 'media' | 'subtitle';
    fileSize: number;
    createdAt: string;
    updatedAt: string | null;
    originalFilename?: string;
    plugin?: string;
    provider?: string | null;
    streamPermalink?: string | null;
}

export interface MockItem {
    id: string;
    type: 'movie' | 'show' | 'season' | 'episode';
    title: string;
    fullTitle: string;
    imdbId: string | null;
    posterPath: string | null;
    createdAt: string;
    updatedAt: string | null;
    indexedAt: string;
    scrapedAt: string | null;
    scrapedTimes: number;
    aliases: Record<string, unknown> | null;
    isAnime: boolean;
    network: string | null;
    country: string | null;
    language: string | null;
    releaseDate: string | null;
    year: number | null;
    genres: string[] | null;
    rating: number | null;
    state: string;
    failedScrapeAttempts: number;
    contentRating: string;
    // movie
    tmdbId?: string;
    runtime?: number | null;
    // show-like
    tvdbId?: string;
    status?: string | null;
    // season/episode
    number?: number;
    absoluteNumber?: number;
    parentId?: string | null;
    childIds?: string[];
    filesystemEntries: MockFileEntry[];
    streams: MockStream[];
    activeStream: MockStream | null;
    blacklistedStreams: { stream: MockStream; plugin: string; provider: string | null }[];
}

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * DAY).toISOString();
const daysAhead = (n: number) => new Date(now + n * DAY).toISOString();

let uuidCounter = 0;
function uuid(): string {
    uuidCounter += 1;
    const suffix = uuidCounter.toString(16).padStart(12, '0');
    return `00000000-0000-4000-8000-${suffix}`;
}

function baseItem(overrides: Partial<MockItem> & Pick<MockItem, 'type' | 'title'>): MockItem {
    return {
        id: uuid(),
        fullTitle: overrides.title,
        imdbId: null,
        posterPath: null,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(1),
        indexedAt: daysAgo(9),
        scrapedAt: null,
        scrapedTimes: 0,
        aliases: null,
        isAnime: false,
        network: null,
        country: 'us',
        language: 'en',
        releaseDate: daysAgo(400),
        year: 2024,
        genres: ['drama'],
        rating: 7.2,
        state: 'indexed',
        failedScrapeAttempts: 0,
        contentRating: 'UNKNOWN',
        parentId: null,
        childIds: [],
        filesystemEntries: [],
        streams: [],
        activeStream: null,
        blacklistedStreams: [],
        ...overrides
    };
}

function mediaFile(filename: string, size = 4_500_000_000): MockFileEntry {
    return {
        id: uuid(),
        type: 'media',
        fileSize: size,
        createdAt: daysAgo(2),
        updatedAt: null,
        originalFilename: filename,
        plugin: '@repo/plugin-stremthru',
        provider: 'realdebrid',
        streamPermalink: null
    };
}

export function createFixtures() {
    const items = new Map<string, MockItem>();
    const add = (item: MockItem) => {
        items.set(item.id, item);
        return item;
    };

    // ── Movies, one per interesting state ───────────────────────────────
    add(
        baseItem({
            type: 'movie',
            title: 'Inception',
            fullTitle: 'Inception (2010)',
            imdbId: 'tt1375666',
            tmdbId: '27205',
            posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
            year: 2010,
            releaseDate: '2010-07-16T00:00:00.000Z',
            genres: ['action', 'science fiction'],
            rating: 8.4,
            runtime: 148,
            contentRating: 'PG_13',
            state: 'completed',
            scrapedAt: daysAgo(3),
            scrapedTimes: 1,
            filesystemEntries: [mediaFile('Inception.2010.1080p.BluRay.x264.mkv')],
            streams: [{ infoHash: 'aaaa1111aaaa1111aaaa1111aaaa1111aaaa1111' }],
            activeStream: { infoHash: 'aaaa1111aaaa1111aaaa1111aaaa1111aaaa1111' }
        })
    );

    add(
        baseItem({
            type: 'movie',
            title: 'Dune: Part Two',
            fullTitle: 'Dune: Part Two (2024)',
            imdbId: 'tt15239678',
            tmdbId: '693134',
            posterPath: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
            year: 2024,
            releaseDate: '2024-03-01T00:00:00.000Z',
            genres: ['science fiction', 'adventure'],
            rating: 8.2,
            runtime: 166,
            contentRating: 'PG_13',
            state: 'downloaded',
            scrapedAt: daysAgo(1),
            scrapedTimes: 2,
            streams: [
                { infoHash: 'bbbb2222bbbb2222bbbb2222bbbb2222bbbb2222' },
                { infoHash: 'cccc3333cccc3333cccc3333cccc3333cccc3333' }
            ],
            activeStream: { infoHash: 'bbbb2222bbbb2222bbbb2222bbbb2222bbbb2222' }
        })
    );

    add(
        baseItem({
            type: 'movie',
            title: 'The Failing Movie',
            fullTitle: 'The Failing Movie (2023)',
            tmdbId: '111111',
            year: 2023,
            state: 'failed',
            failedScrapeAttempts: 5,
            scrapedTimes: 5,
            blacklistedStreams: [
                {
                    stream: { infoHash: 'dddd4444dddd4444dddd4444dddd4444dddd4444' },
                    plugin: '@repo/plugin-torrentio',
                    provider: 'torrentio'
                }
            ]
        })
    );

    add(
        baseItem({
            type: 'movie',
            title: 'Future Blockbuster',
            fullTitle: 'Future Blockbuster (2027)',
            tmdbId: '222222',
            year: 2027,
            releaseDate: daysAhead(200),
            state: 'unreleased'
        })
    );

    add(
        baseItem({
            type: 'movie',
            title: 'Paused Documentary',
            fullTitle: 'Paused Documentary (2022)',
            tmdbId: '333333',
            year: 2022,
            genres: ['documentary'],
            state: 'paused'
        })
    );

    add(
        baseItem({
            type: 'movie',
            title: 'Freshly Scraped',
            fullTitle: 'Freshly Scraped (2025)',
            tmdbId: '444444',
            year: 2025,
            state: 'scraped',
            scrapedAt: daysAgo(0.1),
            scrapedTimes: 1,
            streams: [{ infoHash: 'eeee5555eeee5555eeee5555eeee5555eeee5555' }]
        })
    );

    // ── A show with two seasons + specials ───────────────────────────────
    const show = add(
        baseItem({
            type: 'show',
            title: 'Severance',
            fullTitle: 'Severance',
            imdbId: 'tt11280740',
            tvdbId: '371980',
            posterPath: '/lFf6LLrQjYldcZItzOkGmMMigP7.jpg',
            year: 2022,
            releaseDate: '2022-02-18T00:00:00.000Z',
            genres: ['drama', 'mystery', 'science fiction'],
            rating: 8.7,
            network: 'Apple TV+',
            status: 'continuing',
            contentRating: 'TV_MA',
            state: 'partially_completed',
            scrapedAt: daysAgo(2),
            scrapedTimes: 3
        })
    );

    const makeSeason = (num: number, state: string) =>
        add(
            baseItem({
                type: 'season',
                title: `Season ${num}`,
                fullTitle: `Severance - Season ${num}`,
                tvdbId: show.tvdbId,
                number: num,
                parentId: show.id,
                state,
                year: 2022 + num
            })
        );

    const makeEpisode = (season: MockItem, num: number, title: string, state: string) => {
        const episode = add(
            baseItem({
                type: 'episode',
                title,
                fullTitle: `Severance - s${String(season.number).padStart(2, '0')}e${String(num).padStart(2, '0')} - ${title}`,
                tvdbId: show.tvdbId,
                number: num,
                absoluteNumber: (season.number! - 1) * 9 + num,
                parentId: season.id,
                state,
                releaseDate: daysAgo(600 - season.number! * 300 - num * 7),
                runtime: 50,
                contentRating: 'TV_MA',
                filesystemEntries:
                    state === 'completed'
                        ? [
                              mediaFile(
                                  `Severance.S${String(season.number).padStart(2, '0')}E${String(num).padStart(2, '0')}.1080p.WEB.mkv`,
                                  2_800_000_000
                              )
                          ]
                        : []
            })
        );
        season.childIds!.push(episode.id);
        return episode;
    };

    const specials = makeSeason(0, 'indexed');
    makeEpisode(specials, 1, 'Behind the Severed Floor', 'indexed');

    const s1 = makeSeason(1, 'completed');
    for (let e = 1; e <= 4; e++) {
        makeEpisode(s1, e, `S1 Episode ${e}`, 'completed');
    }

    const s2 = makeSeason(2, 'ongoing');
    makeEpisode(s2, 1, 'Hello, Ms. Cobel', 'completed');
    makeEpisode(s2, 2, 'Goodbye, Mrs. Selvig', 'downloaded');
    makeEpisode(s2, 3, 'Who Is Alive?', 'scraped');
    makeEpisode(s2, 4, 'Woe’s Hollow', 'unreleased');

    show.childIds = [specials.id, s1.id, s2.id];

    // ── An anime show (isAnime heuristics) ───────────────────────────────
    add(
        baseItem({
            type: 'show',
            title: 'Frieren: Beyond Journey’s End',
            fullTitle: 'Frieren: Beyond Journey’s End',
            tvdbId: '424536',
            posterPath: '/dqZENchTd7lp5zht7BdlqM7RBhD.jpg',
            year: 2023,
            language: 'ja',
            genres: ['animation', 'anime', 'fantasy'],
            isAnime: true,
            rating: 8.9,
            status: 'continuing',
            contentRating: 'TV_14',
            state: 'ongoing'
        })
    );

    return items;
}

/** VFS tree used by vfsDirectoryEntryPaths / vfsEntryStat. */
export const vfsTree: Record<string, string[]> = {
    '/': ['/movies', '/shows'],
    '/movies': ['/movies/Inception (2010) {tmdb-27205}'],
    '/movies/Inception (2010) {tmdb-27205}': [
        '/movies/Inception (2010) {tmdb-27205}/Inception (2010) {tmdb-27205}.mkv'
    ],
    '/shows': ['/shows/Severance (2022) {tvdb-371980}'],
    '/shows/Severance (2022) {tvdb-371980}': [
        '/shows/Severance (2022) {tvdb-371980}/Season 01',
        '/shows/Severance (2022) {tvdb-371980}/Season 02'
    ],
    '/shows/Severance (2022) {tvdb-371980}/Season 01': [
        '/shows/Severance (2022) {tvdb-371980}/Season 01/Severance (2022) {tvdb-371980} - s01e01.mkv',
        '/shows/Severance (2022) {tvdb-371980}/Season 01/Severance (2022) {tvdb-371980} - s01e02.mkv'
    ],
    '/shows/Severance (2022) {tvdb-371980}/Season 02': [
        '/shows/Severance (2022) {tvdb-371980}/Season 02/Severance (2022) {tvdb-371980} - s02e01.mkv'
    ]
};

export function vfsIsDirectory(path: string): boolean {
    return path in vfsTree;
}
