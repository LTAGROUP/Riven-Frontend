import { graphql } from '../generated';

export const LibraryItemsQuery = graphql(`
    query LibraryItems {
        mediaItems {
            id
            type
            title
            fullTitle
            imdbId
            posterPath
            state
            releaseDate
            year
            genres
            rating
            language
            isAnime
            indexedAt
            scrapedAt
            createdAt
            updatedAt
            ... on Movie {
                tmdbId
            }
            ... on Show {
                tvdbId
            }
            ... on Season {
                tvdbId
                number
            }
            ... on Episode {
                tvdbId
                number
            }
        }
    }
`);

export const MediaItemByIdQuery = graphql(`
    query MediaItemById($id: ID!) {
        mediaItemById(id: $id) {
            __typename
            ... on Movie {
                ...MediaItemDetail
                tmdbId
                runtime
                movieContentRating: contentRating
                filesystemEntries {
                    ...FileEntry
                }
                subtitles {
                    id
                    language
                    fileSize
                }
            }
            ... on Show {
                ...MediaItemDetail
                tvdbId
                status
                showContentRating: contentRating
                seasons(includeSpecials: true) {
                    id
                    title
                    number
                    state
                    totalEpisodes
                    episodes {
                        id
                        title
                        number
                        absoluteNumber
                        state
                        releaseDate
                    }
                }
            }
            ... on Season {
                ...MediaItemDetail
                tvdbId
                number
                show {
                    id
                    title
                }
                episodes {
                    id
                    title
                    number
                    absoluteNumber
                    state
                    releaseDate
                }
            }
            ... on Episode {
                ...MediaItemDetail
                tvdbId
                number
                absoluteNumber
                runtime
                season {
                    id
                    number
                    show {
                        id
                        title
                        tvdbId
                    }
                }
                filesystemEntries {
                    ...FileEntry
                }
                subtitles {
                    id
                    language
                    fileSize
                }
            }
        }
    }
`);

export const MediaItemDetailFragment = graphql(`
    fragment MediaItemDetail on MediaItem {
        id
        type
        title
        fullTitle
        imdbId
        posterPath
        state
        releaseDate
        year
        genres
        rating
        network
        country
        language
        isAnime
        indexedAt
        scrapedAt
        scrapedTimes
        failedScrapeAttempts
        createdAt
        updatedAt
        activeStream {
            infoHash
        }
        streams {
            infoHash
        }
        blacklistedStreams {
            stream {
                infoHash
            }
            plugin
            provider
        }
    }
`);

export const FileEntryFragment = graphql(`
    fragment FileEntry on FileSystemEntry {
        id
        type
        fileSize
        createdAt
        updatedAt
    }
`);

export const ResetMediaItemMutation = graphql(`
    mutation ResetMediaItem($id: ID!) {
        resetMediaItem(id: $id) {
            ... on Movie {
                id
                state
            }
            ... on Show {
                id
                state
            }
            ... on Season {
                id
                state
            }
            ... on Episode {
                id
                state
            }
        }
    }
`);

export const SaveStreamUrlMutation = graphql(`
    mutation SaveStreamUrl($id: ID!, $url: String!) {
        saveStreamUrl(id: $id, url: $url) {
            id
            streamPermalink
        }
    }
`);
