import { graphql } from '../generated';

export const SettingsQuery = graphql(`
    query Settings {
        settings {
            riven {
                version
                logLevel
            }
        }
    }
`);

export const ShareLogsMutation = graphql(`
    mutation ShareLogs {
        shareLogs
    }
`);

export const VfsDirQuery = graphql(`
    query VfsDir($path: String!) {
        vfsDirectoryEntryPaths(path: $path)
    }
`);

export const VfsStatQuery = graphql(`
    query VfsStat($path: String!) {
        vfsEntryStat(path: $path) {
            mtime
            ctime
            atime
            mode
            nlink
            size
        }
    }
`);

export const VfsEntryQuery = graphql(`
    query VfsEntry($path: String!) {
        vfsEntry(path: $path) {
            ... on MediaEntry {
                id
                type
                originalFilename
                fileSize
                createdAt
                updatedAt
                plugin
                provider
                streamPermalink
            }
            ... on SubtitleEntry {
                id
                language
                fileSize
            }
        }
    }
`);
