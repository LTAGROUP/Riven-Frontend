/* eslint-disable */
import * as types from './graphql';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    '\n    query LibraryItems {\n        mediaItems {\n            id\n            type\n            title\n            fullTitle\n            imdbId\n            posterPath\n            state\n            releaseDate\n            year\n            genres\n            rating\n            language\n            isAnime\n            indexedAt\n            scrapedAt\n            createdAt\n            updatedAt\n            ... on Movie {\n                tmdbId\n            }\n            ... on Show {\n                tvdbId\n            }\n            ... on Season {\n                tvdbId\n                number\n            }\n            ... on Episode {\n                tvdbId\n                number\n            }\n        }\n    }\n': typeof types.LibraryItemsDocument;
    '\n    query MediaItemById($id: ID!) {\n        mediaItemById(id: $id) {\n            __typename\n            ... on Movie {\n                ...MediaItemDetail\n                tmdbId\n                runtime\n                movieContentRating: contentRating\n                filesystemEntries {\n                    ...FileEntry\n                }\n                subtitles {\n                    id\n                    language\n                    fileSize\n                }\n            }\n            ... on Show {\n                ...MediaItemDetail\n                tvdbId\n                status\n                showContentRating: contentRating\n                seasons(includeSpecials: true) {\n                    id\n                    title\n                    number\n                    state\n                    totalEpisodes\n                    episodes {\n                        id\n                        title\n                        number\n                        absoluteNumber\n                        state\n                        releaseDate\n                    }\n                }\n            }\n            ... on Season {\n                ...MediaItemDetail\n                tvdbId\n                number\n                show {\n                    id\n                    title\n                }\n                episodes {\n                    id\n                    title\n                    number\n                    absoluteNumber\n                    state\n                    releaseDate\n                }\n            }\n            ... on Episode {\n                ...MediaItemDetail\n                tvdbId\n                number\n                absoluteNumber\n                runtime\n                season {\n                    id\n                    number\n                    show {\n                        id\n                        title\n                        tvdbId\n                    }\n                }\n                filesystemEntries {\n                    ...FileEntry\n                }\n                subtitles {\n                    id\n                    language\n                    fileSize\n                }\n            }\n        }\n    }\n': typeof types.MediaItemByIdDocument;
    '\n    fragment MediaItemDetail on MediaItem {\n        id\n        type\n        title\n        fullTitle\n        imdbId\n        posterPath\n        state\n        releaseDate\n        year\n        genres\n        rating\n        network\n        country\n        language\n        isAnime\n        indexedAt\n        scrapedAt\n        scrapedTimes\n        failedScrapeAttempts\n        createdAt\n        updatedAt\n        activeStream {\n            infoHash\n        }\n        streams {\n            infoHash\n        }\n        blacklistedStreams {\n            stream {\n                infoHash\n            }\n            plugin\n            provider\n        }\n    }\n': typeof types.MediaItemDetailFragmentDoc;
    '\n    fragment FileEntry on FileSystemEntry {\n        id\n        type\n        fileSize\n        createdAt\n        updatedAt\n    }\n': typeof types.FileEntryFragmentDoc;
    '\n    mutation ResetMediaItem($id: ID!) {\n        resetMediaItem(id: $id) {\n            ... on Movie {\n                id\n                state\n            }\n            ... on Show {\n                id\n                state\n            }\n            ... on Season {\n                id\n                state\n            }\n            ... on Episode {\n                id\n                state\n            }\n        }\n    }\n': typeof types.ResetMediaItemDocument;
    '\n    mutation SaveStreamUrl($id: ID!, $url: String!) {\n        saveStreamUrl(id: $id, url: $url) {\n            id\n            streamPermalink\n        }\n    }\n': typeof types.SaveStreamUrlDocument;
    '\n    mutation RequestViaSeerr($payload: JSONObject!) {\n        seerrHandleWebhook(input: { payload: $payload })\n    }\n': typeof types.RequestViaSeerrDocument;
    '\n    query Settings {\n        settings {\n            riven {\n                version\n                logLevel\n            }\n        }\n    }\n': typeof types.SettingsDocument;
    '\n    mutation ShareLogs {\n        shareLogs\n    }\n': typeof types.ShareLogsDocument;
    '\n    query VfsDir($path: String!) {\n        vfsDirectoryEntryPaths(path: $path)\n    }\n': typeof types.VfsDirDocument;
    '\n    query VfsStat($path: String!) {\n        vfsEntryStat(path: $path) {\n            mtime\n            ctime\n            atime\n            mode\n            nlink\n            size\n        }\n    }\n': typeof types.VfsStatDocument;
    '\n    query VfsEntry($path: String!) {\n        vfsEntry(path: $path) {\n            __typename\n            ... on MediaEntry {\n                id\n                type\n                originalFilename\n                fileSize\n                createdAt\n                updatedAt\n                plugin\n                provider\n                streamPermalink\n            }\n            ... on SubtitleEntry {\n                id\n                language\n                fileSize\n            }\n        }\n    }\n': typeof types.VfsEntryDocument;
};
const documents: Documents = {
    '\n    query LibraryItems {\n        mediaItems {\n            id\n            type\n            title\n            fullTitle\n            imdbId\n            posterPath\n            state\n            releaseDate\n            year\n            genres\n            rating\n            language\n            isAnime\n            indexedAt\n            scrapedAt\n            createdAt\n            updatedAt\n            ... on Movie {\n                tmdbId\n            }\n            ... on Show {\n                tvdbId\n            }\n            ... on Season {\n                tvdbId\n                number\n            }\n            ... on Episode {\n                tvdbId\n                number\n            }\n        }\n    }\n':
        types.LibraryItemsDocument,
    '\n    query MediaItemById($id: ID!) {\n        mediaItemById(id: $id) {\n            __typename\n            ... on Movie {\n                ...MediaItemDetail\n                tmdbId\n                runtime\n                movieContentRating: contentRating\n                filesystemEntries {\n                    ...FileEntry\n                }\n                subtitles {\n                    id\n                    language\n                    fileSize\n                }\n            }\n            ... on Show {\n                ...MediaItemDetail\n                tvdbId\n                status\n                showContentRating: contentRating\n                seasons(includeSpecials: true) {\n                    id\n                    title\n                    number\n                    state\n                    totalEpisodes\n                    episodes {\n                        id\n                        title\n                        number\n                        absoluteNumber\n                        state\n                        releaseDate\n                    }\n                }\n            }\n            ... on Season {\n                ...MediaItemDetail\n                tvdbId\n                number\n                show {\n                    id\n                    title\n                }\n                episodes {\n                    id\n                    title\n                    number\n                    absoluteNumber\n                    state\n                    releaseDate\n                }\n            }\n            ... on Episode {\n                ...MediaItemDetail\n                tvdbId\n                number\n                absoluteNumber\n                runtime\n                season {\n                    id\n                    number\n                    show {\n                        id\n                        title\n                        tvdbId\n                    }\n                }\n                filesystemEntries {\n                    ...FileEntry\n                }\n                subtitles {\n                    id\n                    language\n                    fileSize\n                }\n            }\n        }\n    }\n':
        types.MediaItemByIdDocument,
    '\n    fragment MediaItemDetail on MediaItem {\n        id\n        type\n        title\n        fullTitle\n        imdbId\n        posterPath\n        state\n        releaseDate\n        year\n        genres\n        rating\n        network\n        country\n        language\n        isAnime\n        indexedAt\n        scrapedAt\n        scrapedTimes\n        failedScrapeAttempts\n        createdAt\n        updatedAt\n        activeStream {\n            infoHash\n        }\n        streams {\n            infoHash\n        }\n        blacklistedStreams {\n            stream {\n                infoHash\n            }\n            plugin\n            provider\n        }\n    }\n':
        types.MediaItemDetailFragmentDoc,
    '\n    fragment FileEntry on FileSystemEntry {\n        id\n        type\n        fileSize\n        createdAt\n        updatedAt\n    }\n':
        types.FileEntryFragmentDoc,
    '\n    mutation ResetMediaItem($id: ID!) {\n        resetMediaItem(id: $id) {\n            ... on Movie {\n                id\n                state\n            }\n            ... on Show {\n                id\n                state\n            }\n            ... on Season {\n                id\n                state\n            }\n            ... on Episode {\n                id\n                state\n            }\n        }\n    }\n':
        types.ResetMediaItemDocument,
    '\n    mutation SaveStreamUrl($id: ID!, $url: String!) {\n        saveStreamUrl(id: $id, url: $url) {\n            id\n            streamPermalink\n        }\n    }\n':
        types.SaveStreamUrlDocument,
    '\n    mutation RequestViaSeerr($payload: JSONObject!) {\n        seerrHandleWebhook(input: { payload: $payload })\n    }\n':
        types.RequestViaSeerrDocument,
    '\n    query Settings {\n        settings {\n            riven {\n                version\n                logLevel\n            }\n        }\n    }\n':
        types.SettingsDocument,
    '\n    mutation ShareLogs {\n        shareLogs\n    }\n': types.ShareLogsDocument,
    '\n    query VfsDir($path: String!) {\n        vfsDirectoryEntryPaths(path: $path)\n    }\n':
        types.VfsDirDocument,
    '\n    query VfsStat($path: String!) {\n        vfsEntryStat(path: $path) {\n            mtime\n            ctime\n            atime\n            mode\n            nlink\n            size\n        }\n    }\n':
        types.VfsStatDocument,
    '\n    query VfsEntry($path: String!) {\n        vfsEntry(path: $path) {\n            __typename\n            ... on MediaEntry {\n                id\n                type\n                originalFilename\n                fileSize\n                createdAt\n                updatedAt\n                plugin\n                provider\n                streamPermalink\n            }\n            ... on SubtitleEntry {\n                id\n                language\n                fileSize\n            }\n        }\n    }\n':
        types.VfsEntryDocument
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query LibraryItems {\n        mediaItems {\n            id\n            type\n            title\n            fullTitle\n            imdbId\n            posterPath\n            state\n            releaseDate\n            year\n            genres\n            rating\n            language\n            isAnime\n            indexedAt\n            scrapedAt\n            createdAt\n            updatedAt\n            ... on Movie {\n                tmdbId\n            }\n            ... on Show {\n                tvdbId\n            }\n            ... on Season {\n                tvdbId\n                number\n            }\n            ... on Episode {\n                tvdbId\n                number\n            }\n        }\n    }\n'
): typeof import('./graphql').LibraryItemsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query MediaItemById($id: ID!) {\n        mediaItemById(id: $id) {\n            __typename\n            ... on Movie {\n                ...MediaItemDetail\n                tmdbId\n                runtime\n                movieContentRating: contentRating\n                filesystemEntries {\n                    ...FileEntry\n                }\n                subtitles {\n                    id\n                    language\n                    fileSize\n                }\n            }\n            ... on Show {\n                ...MediaItemDetail\n                tvdbId\n                status\n                showContentRating: contentRating\n                seasons(includeSpecials: true) {\n                    id\n                    title\n                    number\n                    state\n                    totalEpisodes\n                    episodes {\n                        id\n                        title\n                        number\n                        absoluteNumber\n                        state\n                        releaseDate\n                    }\n                }\n            }\n            ... on Season {\n                ...MediaItemDetail\n                tvdbId\n                number\n                show {\n                    id\n                    title\n                }\n                episodes {\n                    id\n                    title\n                    number\n                    absoluteNumber\n                    state\n                    releaseDate\n                }\n            }\n            ... on Episode {\n                ...MediaItemDetail\n                tvdbId\n                number\n                absoluteNumber\n                runtime\n                season {\n                    id\n                    number\n                    show {\n                        id\n                        title\n                        tvdbId\n                    }\n                }\n                filesystemEntries {\n                    ...FileEntry\n                }\n                subtitles {\n                    id\n                    language\n                    fileSize\n                }\n            }\n        }\n    }\n'
): typeof import('./graphql').MediaItemByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment MediaItemDetail on MediaItem {\n        id\n        type\n        title\n        fullTitle\n        imdbId\n        posterPath\n        state\n        releaseDate\n        year\n        genres\n        rating\n        network\n        country\n        language\n        isAnime\n        indexedAt\n        scrapedAt\n        scrapedTimes\n        failedScrapeAttempts\n        createdAt\n        updatedAt\n        activeStream {\n            infoHash\n        }\n        streams {\n            infoHash\n        }\n        blacklistedStreams {\n            stream {\n                infoHash\n            }\n            plugin\n            provider\n        }\n    }\n'
): typeof import('./graphql').MediaItemDetailFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment FileEntry on FileSystemEntry {\n        id\n        type\n        fileSize\n        createdAt\n        updatedAt\n    }\n'
): typeof import('./graphql').FileEntryFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation ResetMediaItem($id: ID!) {\n        resetMediaItem(id: $id) {\n            ... on Movie {\n                id\n                state\n            }\n            ... on Show {\n                id\n                state\n            }\n            ... on Season {\n                id\n                state\n            }\n            ... on Episode {\n                id\n                state\n            }\n        }\n    }\n'
): typeof import('./graphql').ResetMediaItemDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation SaveStreamUrl($id: ID!, $url: String!) {\n        saveStreamUrl(id: $id, url: $url) {\n            id\n            streamPermalink\n        }\n    }\n'
): typeof import('./graphql').SaveStreamUrlDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation RequestViaSeerr($payload: JSONObject!) {\n        seerrHandleWebhook(input: { payload: $payload })\n    }\n'
): typeof import('./graphql').RequestViaSeerrDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query Settings {\n        settings {\n            riven {\n                version\n                logLevel\n            }\n        }\n    }\n'
): typeof import('./graphql').SettingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    mutation ShareLogs {\n        shareLogs\n    }\n'
): typeof import('./graphql').ShareLogsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query VfsDir($path: String!) {\n        vfsDirectoryEntryPaths(path: $path)\n    }\n'
): typeof import('./graphql').VfsDirDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query VfsStat($path: String!) {\n        vfsEntryStat(path: $path) {\n            mtime\n            ctime\n            atime\n            mode\n            nlink\n            size\n        }\n    }\n'
): typeof import('./graphql').VfsStatDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query VfsEntry($path: String!) {\n        vfsEntry(path: $path) {\n            __typename\n            ... on MediaEntry {\n                id\n                type\n                originalFilename\n                fileSize\n                createdAt\n                updatedAt\n                plugin\n                provider\n                streamPermalink\n            }\n            ... on SubtitleEntry {\n                id\n                language\n                fileSize\n            }\n        }\n    }\n'
): typeof import('./graphql').VfsEntryDocument;

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}
