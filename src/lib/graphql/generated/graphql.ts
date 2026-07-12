/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> =
    T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    BigInt: { input: number; output: number };
    DateTimeISO: { input: string; output: string };
    JSONObject: { input: Record<string, unknown>; output: Record<string, unknown> };
};

export type BlacklistedStream = {
    __typename?: 'BlacklistedStream';
    mediaItem: MediaItem;
    plugin: Scalars['String']['output'];
    provider?: Maybe<Scalars['String']['output']>;
    stream: Stream;
};

export type Episode = MediaItem &
    ShowLikeMediaItem & {
        __typename?: 'Episode';
        absoluteNumber: Scalars['Int']['output'];
        activeStream?: Maybe<Stream>;
        aliases?: Maybe<Scalars['JSONObject']['output']>;
        blacklistedStreams: Array<BlacklistedStream>;
        contentRating: ShowContentRating;
        country?: Maybe<Scalars['String']['output']>;
        createdAt: Scalars['DateTimeISO']['output'];
        expectedFileCount: Scalars['Int']['output'];
        failedScrapeAttempts: Scalars['Float']['output'];
        filesystemEntries: Array<FileSystemEntry>;
        fullTitle: Scalars['String']['output'];
        genres?: Maybe<Array<Scalars['String']['output']>>;
        id: Scalars['ID']['output'];
        imdbId?: Maybe<Scalars['String']['output']>;
        indexedAt: Scalars['DateTimeISO']['output'];
        isAnime: Scalars['Boolean']['output'];
        language?: Maybe<Scalars['String']['output']>;
        lookupKeys: Array<Scalars['String']['output']>;
        network?: Maybe<Scalars['String']['output']>;
        number: Scalars['Int']['output'];
        posterPath?: Maybe<Scalars['String']['output']>;
        rating?: Maybe<Scalars['Float']['output']>;
        releaseDate?: Maybe<Scalars['DateTimeISO']['output']>;
        runtime?: Maybe<Scalars['Int']['output']>;
        scrapedAt?: Maybe<Scalars['DateTimeISO']['output']>;
        scrapedTimes: Scalars['Float']['output'];
        season: Season;
        state: MediaItemState;
        streams: Array<Stream>;
        subtitles: Array<SubtitleEntry>;
        title: Scalars['String']['output'];
        tvdbId: Scalars['String']['output'];
        type: Scalars['String']['output'];
        updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
        year?: Maybe<Scalars['Float']['output']>;
    };

export type FileSystemEntry = {
    __typename?: 'FileSystemEntry';
    createdAt: Scalars['DateTimeISO']['output'];
    fileSize: Scalars['BigInt']['output'];
    id: Scalars['ID']['output'];
    mediaItem: MediaItem;
    type: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type FileSystemEntryUnion = MediaEntry | SubtitleEntry;

/** The levels of logging severity */
export type LogLevel = 'DEBUG' | 'ERROR' | 'HTTP' | 'INFO' | 'SILLY' | 'VERBOSE' | 'WARN';

export type MediaEntry = {
    __typename?: 'MediaEntry';
    createdAt: Scalars['DateTimeISO']['output'];
    downloadUrl?: Maybe<Scalars['String']['output']>;
    fileSize: Scalars['BigInt']['output'];
    id: Scalars['ID']['output'];
    libraryProfiles?: Maybe<Array<Scalars['String']['output']>>;
    mediaItem: MediaItem;
    mediaMetadata?: Maybe<Scalars['JSONObject']['output']>;
    originalFilename: Scalars['String']['output'];
    plugin: Scalars['String']['output'];
    provider?: Maybe<Scalars['String']['output']>;
    providerDownloadId?: Maybe<Scalars['String']['output']>;
    streamPermalink?: Maybe<Scalars['String']['output']>;
    type: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type MediaItem = {
    activeStream?: Maybe<Stream>;
    aliases?: Maybe<Scalars['JSONObject']['output']>;
    blacklistedStreams: Array<BlacklistedStream>;
    country?: Maybe<Scalars['String']['output']>;
    createdAt: Scalars['DateTimeISO']['output'];
    expectedFileCount: Scalars['Int']['output'];
    failedScrapeAttempts: Scalars['Float']['output'];
    filesystemEntries: Array<FileSystemEntry>;
    fullTitle: Scalars['String']['output'];
    genres?: Maybe<Array<Scalars['String']['output']>>;
    id: Scalars['ID']['output'];
    imdbId?: Maybe<Scalars['String']['output']>;
    indexedAt: Scalars['DateTimeISO']['output'];
    isAnime: Scalars['Boolean']['output'];
    language?: Maybe<Scalars['String']['output']>;
    network?: Maybe<Scalars['String']['output']>;
    posterPath?: Maybe<Scalars['String']['output']>;
    rating?: Maybe<Scalars['Float']['output']>;
    releaseDate?: Maybe<Scalars['DateTimeISO']['output']>;
    scrapedAt?: Maybe<Scalars['DateTimeISO']['output']>;
    scrapedTimes: Scalars['Float']['output'];
    state: MediaItemState;
    streams: Array<Stream>;
    subtitles: Array<SubtitleEntry>;
    title: Scalars['String']['output'];
    type: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
    year?: Maybe<Scalars['Float']['output']>;
};

/** The state of a media item in the processing pipeline */
export type MediaItemState =
    | 'completed'
    | 'downloaded'
    | 'failed'
    | 'indexed'
    | 'ongoing'
    | 'partially_completed'
    | 'paused'
    | 'scraped'
    | 'unknown'
    | 'unreleased';

export type MediaItemUnion = Episode | Movie | Season | Show;

export type Movie = MediaItem & {
    __typename?: 'Movie';
    activeStream?: Maybe<Stream>;
    aliases?: Maybe<Scalars['JSONObject']['output']>;
    blacklistedStreams: Array<BlacklistedStream>;
    contentRating: MovieContentRating;
    country?: Maybe<Scalars['String']['output']>;
    createdAt: Scalars['DateTimeISO']['output'];
    expectedFileCount: Scalars['Int']['output'];
    failedScrapeAttempts: Scalars['Float']['output'];
    filesystemEntries: Array<FileSystemEntry>;
    fullTitle: Scalars['String']['output'];
    genres?: Maybe<Array<Scalars['String']['output']>>;
    id: Scalars['ID']['output'];
    imdbId?: Maybe<Scalars['String']['output']>;
    indexedAt: Scalars['DateTimeISO']['output'];
    isAnime: Scalars['Boolean']['output'];
    language?: Maybe<Scalars['String']['output']>;
    network?: Maybe<Scalars['String']['output']>;
    posterPath?: Maybe<Scalars['String']['output']>;
    rating?: Maybe<Scalars['Float']['output']>;
    releaseDate?: Maybe<Scalars['DateTimeISO']['output']>;
    runtime?: Maybe<Scalars['Int']['output']>;
    scrapedAt?: Maybe<Scalars['DateTimeISO']['output']>;
    scrapedTimes: Scalars['Float']['output'];
    state: MediaItemState;
    streams: Array<Stream>;
    subtitles: Array<SubtitleEntry>;
    title: Scalars['String']['output'];
    tmdbId: Scalars['String']['output'];
    type: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
    year?: Maybe<Scalars['Float']['output']>;
};

/** The content rating of a movie (MPAA) */
export type MovieContentRating = 'G' | 'NC_17' | 'PG' | 'PG_13' | 'R' | 'UNKNOWN';

export type Mutation = {
    __typename?: 'Mutation';
    resetMediaItem: Array<MediaItemUnion>;
    saveStreamUrl: MediaEntry;
    seerrHandleWebhook: Scalars['Boolean']['output'];
    /** Uploads the last 24 hours of logs and returns a share session id. */
    shareLogs: Scalars['String']['output'];
};

export type MutationResetMediaItemArgs = {
    id: Scalars['ID']['input'];
};

export type MutationSaveStreamUrlArgs = {
    id: Scalars['ID']['input'];
    url: Scalars['String']['input'];
};

export type MutationSeerrHandleWebhookArgs = {
    input: SeerrHandleWebhookInput;
};

export type Query = {
    __typename?: 'Query';
    /**
     * Fetches an episode by its TVDB ID, season number, and episode number.
     * If season number is not provided, it will lookup using absolute episode numbering.
     */
    episode?: Maybe<Episode>;
    /**
     * Fetches a media item by its ID. The returned type will be one of the
     * specific media item types (e.g., Movie, Episode) based on the underlying data.
     */
    mediaItemById: MediaItemUnion;
    mediaItems: Array<MediaItem>;
    seerrIsValid: Scalars['Boolean']['output'];
    settings: Settings;
    tmdbIsValid: Scalars['Boolean']['output'];
    tvdbIsValid: Scalars['Boolean']['output'];
    vfsDirectoryEntryPaths: Array<Scalars['String']['output']>;
    vfsEntry?: Maybe<FileSystemEntryUnion>;
    vfsEntryStat: VfsEntryStat;
};

export type QueryEpisodeArgs = {
    episodeNumber: Scalars['Int']['input'];
    seasonNumber?: InputMaybe<Scalars['Int']['input']>;
    tvdbId: Scalars['String']['input'];
};

export type QueryMediaItemByIdArgs = {
    id: Scalars['ID']['input'];
};

export type QueryVfsDirectoryEntryPathsArgs = {
    path: Scalars['String']['input'];
};

export type QueryVfsEntryArgs = {
    path: Scalars['String']['input'];
};

export type QueryVfsEntryStatArgs = {
    path: Scalars['String']['input'];
};

export type RivenSettings = {
    __typename?: 'RivenSettings';
    /** The API key for accessing the service */
    apiKey: Scalars['String']['output'];
    /** The logging level for the application */
    logLevel: LogLevel;
    /** The current version of the application */
    version: Scalars['String']['output'];
};

export type Season = MediaItem &
    ShowLikeMediaItem & {
        __typename?: 'Season';
        activeStream?: Maybe<Stream>;
        aliases?: Maybe<Scalars['JSONObject']['output']>;
        blacklistedStreams: Array<BlacklistedStream>;
        country?: Maybe<Scalars['String']['output']>;
        createdAt: Scalars['DateTimeISO']['output'];
        episodes: Array<Episode>;
        expectedFileCount: Scalars['Int']['output'];
        failedScrapeAttempts: Scalars['Float']['output'];
        filesystemEntries: Array<FileSystemEntry>;
        fullTitle: Scalars['String']['output'];
        genres?: Maybe<Array<Scalars['String']['output']>>;
        id: Scalars['ID']['output'];
        imdbId?: Maybe<Scalars['String']['output']>;
        indexedAt: Scalars['DateTimeISO']['output'];
        isAnime: Scalars['Boolean']['output'];
        language?: Maybe<Scalars['String']['output']>;
        network?: Maybe<Scalars['String']['output']>;
        number: Scalars['Int']['output'];
        posterPath?: Maybe<Scalars['String']['output']>;
        rating?: Maybe<Scalars['Float']['output']>;
        releaseDate?: Maybe<Scalars['DateTimeISO']['output']>;
        scrapedAt?: Maybe<Scalars['DateTimeISO']['output']>;
        scrapedTimes: Scalars['Float']['output'];
        show: Show;
        state: MediaItemState;
        streams: Array<Stream>;
        subtitles: Array<SubtitleEntry>;
        title: Scalars['String']['output'];
        totalEpisodes: Scalars['Int']['output'];
        tvdbId: Scalars['String']['output'];
        type: Scalars['String']['output'];
        updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
        year?: Maybe<Scalars['Float']['output']>;
    };

export type SeerrHandleWebhookInput = {
    payload: Scalars['JSONObject']['input'];
};

export type Settings = {
    __typename?: 'Settings';
    riven: RivenSettings;
};

export type Show = MediaItem &
    ShowLikeMediaItem & {
        __typename?: 'Show';
        activeStream?: Maybe<Stream>;
        aliases?: Maybe<Scalars['JSONObject']['output']>;
        blacklistedStreams: Array<BlacklistedStream>;
        contentRating: ShowContentRating;
        country?: Maybe<Scalars['String']['output']>;
        createdAt: Scalars['DateTimeISO']['output'];
        expectedFileCount: Scalars['Int']['output'];
        failedScrapeAttempts: Scalars['Float']['output'];
        filesystemEntries: Array<FileSystemEntry>;
        fullTitle: Scalars['String']['output'];
        genres?: Maybe<Array<Scalars['String']['output']>>;
        id: Scalars['ID']['output'];
        imdbId?: Maybe<Scalars['String']['output']>;
        indexedAt: Scalars['DateTimeISO']['output'];
        isAnime: Scalars['Boolean']['output'];
        language?: Maybe<Scalars['String']['output']>;
        network?: Maybe<Scalars['String']['output']>;
        posterPath?: Maybe<Scalars['String']['output']>;
        rating?: Maybe<Scalars['Float']['output']>;
        releaseDate?: Maybe<Scalars['DateTimeISO']['output']>;
        requestedSeasons: Array<Season>;
        scrapedAt?: Maybe<Scalars['DateTimeISO']['output']>;
        scrapedTimes: Scalars['Float']['output'];
        seasons: Array<Season>;
        state: MediaItemState;
        status?: Maybe<ShowStatus>;
        streams: Array<Stream>;
        subtitles: Array<SubtitleEntry>;
        title: Scalars['String']['output'];
        tvdbId: Scalars['String']['output'];
        type: Scalars['String']['output'];
        updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
        year?: Maybe<Scalars['Float']['output']>;
    };

export type ShowSeasonsArgs = {
    includeSpecials?: Scalars['Boolean']['input'];
};

/** The content rating of a TV show (TV Parental Guidelines) */
export type ShowContentRating = 'TV_14' | 'TV_G' | 'TV_MA' | 'TV_PG' | 'TV_Y' | 'TV_Y7' | 'UNKNOWN';

export type ShowLikeMediaItem = {
    activeStream?: Maybe<Stream>;
    aliases?: Maybe<Scalars['JSONObject']['output']>;
    blacklistedStreams: Array<BlacklistedStream>;
    country?: Maybe<Scalars['String']['output']>;
    createdAt: Scalars['DateTimeISO']['output'];
    expectedFileCount: Scalars['Int']['output'];
    failedScrapeAttempts: Scalars['Float']['output'];
    filesystemEntries: Array<FileSystemEntry>;
    fullTitle: Scalars['String']['output'];
    genres?: Maybe<Array<Scalars['String']['output']>>;
    id: Scalars['ID']['output'];
    imdbId?: Maybe<Scalars['String']['output']>;
    indexedAt: Scalars['DateTimeISO']['output'];
    isAnime: Scalars['Boolean']['output'];
    language?: Maybe<Scalars['String']['output']>;
    network?: Maybe<Scalars['String']['output']>;
    posterPath?: Maybe<Scalars['String']['output']>;
    rating?: Maybe<Scalars['Float']['output']>;
    releaseDate?: Maybe<Scalars['DateTimeISO']['output']>;
    scrapedAt?: Maybe<Scalars['DateTimeISO']['output']>;
    scrapedTimes: Scalars['Float']['output'];
    state: MediaItemState;
    streams: Array<Stream>;
    subtitles: Array<SubtitleEntry>;
    title: Scalars['String']['output'];
    tvdbId: Scalars['String']['output'];
    type: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
    year?: Maybe<Scalars['Float']['output']>;
};

/** The current status of a TV show */
export type ShowStatus = 'continuing' | 'ended' | 'unknown' | 'upcoming';

export type Stream = {
    __typename?: 'Stream';
    infoHash: Scalars['ID']['output'];
    parents: Array<MediaItem>;
};

export type SubtitleEntry = {
    __typename?: 'SubtitleEntry';
    content: Scalars['String']['output'];
    createdAt: Scalars['DateTimeISO']['output'];
    fileHash: Scalars['String']['output'];
    fileSize: Scalars['BigInt']['output'];
    id: Scalars['ID']['output'];
    language: Scalars['String']['output'];
    mediaItem: MediaItem;
    sourceId?: Maybe<Scalars['String']['output']>;
    sourceProvider: Scalars['Int']['output'];
    type: Scalars['String']['output'];
    updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type VfsEntryStat = {
    __typename?: 'VfsEntryStat';
    atime: Scalars['DateTimeISO']['output'];
    ctime: Scalars['DateTimeISO']['output'];
    gid: Scalars['Int']['output'];
    mode: Scalars['Int']['output'];
    mtime: Scalars['DateTimeISO']['output'];
    nlink: Scalars['Int']['output'];
    size: Scalars['BigInt']['output'];
    uid: Scalars['Int']['output'];
};

export type LibraryItemsQueryVariables = Exact<{ [key: string]: never }>;

export type LibraryItemsQuery = {
    __typename?: 'Query';
    mediaItems: Array<
        | {
              __typename?: 'Episode';
              tvdbId: string;
              number: number;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              createdAt: string;
              updatedAt?: string | null;
          }
        | {
              __typename?: 'Movie';
              tmdbId: string;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              createdAt: string;
              updatedAt?: string | null;
          }
        | {
              __typename?: 'Season';
              tvdbId: string;
              number: number;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              createdAt: string;
              updatedAt?: string | null;
          }
        | {
              __typename?: 'Show';
              tvdbId: string;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              createdAt: string;
              updatedAt?: string | null;
          }
    >;
};

export type MediaItemByIdQueryVariables = Exact<{
    id: Scalars['ID']['input'];
}>;

export type MediaItemByIdQuery = {
    __typename?: 'Query';
    mediaItemById:
        | {
              __typename: 'Episode';
              tvdbId: string;
              number: number;
              absoluteNumber: number;
              runtime?: number | null;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              network?: string | null;
              country?: string | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              scrapedTimes: number;
              failedScrapeAttempts: number;
              createdAt: string;
              updatedAt?: string | null;
              season: {
                  __typename?: 'Season';
                  id: string;
                  number: number;
                  show: { __typename?: 'Show'; id: string; title: string; tvdbId: string };
              };
              filesystemEntries: Array<{
                  __typename?: 'FileSystemEntry';
                  id: string;
                  type: string;
                  fileSize: number;
                  createdAt: string;
                  updatedAt?: string | null;
              }>;
              subtitles: Array<{
                  __typename?: 'SubtitleEntry';
                  id: string;
                  language: string;
                  fileSize: number;
              }>;
              activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
              streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
              blacklistedStreams: Array<{
                  __typename?: 'BlacklistedStream';
                  plugin: string;
                  provider?: string | null;
                  stream: { __typename?: 'Stream'; infoHash: string };
              }>;
          }
        | {
              __typename: 'Movie';
              tmdbId: string;
              runtime?: number | null;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              network?: string | null;
              country?: string | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              scrapedTimes: number;
              failedScrapeAttempts: number;
              createdAt: string;
              updatedAt?: string | null;
              movieContentRating: MovieContentRating;
              filesystemEntries: Array<{
                  __typename?: 'FileSystemEntry';
                  id: string;
                  type: string;
                  fileSize: number;
                  createdAt: string;
                  updatedAt?: string | null;
              }>;
              subtitles: Array<{
                  __typename?: 'SubtitleEntry';
                  id: string;
                  language: string;
                  fileSize: number;
              }>;
              activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
              streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
              blacklistedStreams: Array<{
                  __typename?: 'BlacklistedStream';
                  plugin: string;
                  provider?: string | null;
                  stream: { __typename?: 'Stream'; infoHash: string };
              }>;
          }
        | {
              __typename: 'Season';
              tvdbId: string;
              number: number;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              network?: string | null;
              country?: string | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              scrapedTimes: number;
              failedScrapeAttempts: number;
              createdAt: string;
              updatedAt?: string | null;
              show: { __typename?: 'Show'; id: string; title: string };
              episodes: Array<{
                  __typename?: 'Episode';
                  id: string;
                  title: string;
                  number: number;
                  absoluteNumber: number;
                  state: MediaItemState;
                  releaseDate?: string | null;
              }>;
              activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
              streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
              blacklistedStreams: Array<{
                  __typename?: 'BlacklistedStream';
                  plugin: string;
                  provider?: string | null;
                  stream: { __typename?: 'Stream'; infoHash: string };
              }>;
          }
        | {
              __typename: 'Show';
              tvdbId: string;
              status?: ShowStatus | null;
              id: string;
              type: string;
              title: string;
              fullTitle: string;
              imdbId?: string | null;
              posterPath?: string | null;
              state: MediaItemState;
              releaseDate?: string | null;
              year?: number | null;
              genres?: Array<string> | null;
              rating?: number | null;
              network?: string | null;
              country?: string | null;
              language?: string | null;
              isAnime: boolean;
              indexedAt: string;
              scrapedAt?: string | null;
              scrapedTimes: number;
              failedScrapeAttempts: number;
              createdAt: string;
              updatedAt?: string | null;
              showContentRating: ShowContentRating;
              seasons: Array<{
                  __typename?: 'Season';
                  id: string;
                  title: string;
                  number: number;
                  state: MediaItemState;
                  totalEpisodes: number;
                  episodes: Array<{
                      __typename?: 'Episode';
                      id: string;
                      title: string;
                      number: number;
                      absoluteNumber: number;
                      state: MediaItemState;
                      releaseDate?: string | null;
                  }>;
              }>;
              activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
              streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
              blacklistedStreams: Array<{
                  __typename?: 'BlacklistedStream';
                  plugin: string;
                  provider?: string | null;
                  stream: { __typename?: 'Stream'; infoHash: string };
              }>;
          };
};

type MediaItemDetail_Episode_Fragment = {
    __typename?: 'Episode';
    id: string;
    type: string;
    title: string;
    fullTitle: string;
    imdbId?: string | null;
    posterPath?: string | null;
    state: MediaItemState;
    releaseDate?: string | null;
    year?: number | null;
    genres?: Array<string> | null;
    rating?: number | null;
    network?: string | null;
    country?: string | null;
    language?: string | null;
    isAnime: boolean;
    indexedAt: string;
    scrapedAt?: string | null;
    scrapedTimes: number;
    failedScrapeAttempts: number;
    createdAt: string;
    updatedAt?: string | null;
    activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
    streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
    blacklistedStreams: Array<{
        __typename?: 'BlacklistedStream';
        plugin: string;
        provider?: string | null;
        stream: { __typename?: 'Stream'; infoHash: string };
    }>;
};

type MediaItemDetail_Movie_Fragment = {
    __typename?: 'Movie';
    id: string;
    type: string;
    title: string;
    fullTitle: string;
    imdbId?: string | null;
    posterPath?: string | null;
    state: MediaItemState;
    releaseDate?: string | null;
    year?: number | null;
    genres?: Array<string> | null;
    rating?: number | null;
    network?: string | null;
    country?: string | null;
    language?: string | null;
    isAnime: boolean;
    indexedAt: string;
    scrapedAt?: string | null;
    scrapedTimes: number;
    failedScrapeAttempts: number;
    createdAt: string;
    updatedAt?: string | null;
    activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
    streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
    blacklistedStreams: Array<{
        __typename?: 'BlacklistedStream';
        plugin: string;
        provider?: string | null;
        stream: { __typename?: 'Stream'; infoHash: string };
    }>;
};

type MediaItemDetail_Season_Fragment = {
    __typename?: 'Season';
    id: string;
    type: string;
    title: string;
    fullTitle: string;
    imdbId?: string | null;
    posterPath?: string | null;
    state: MediaItemState;
    releaseDate?: string | null;
    year?: number | null;
    genres?: Array<string> | null;
    rating?: number | null;
    network?: string | null;
    country?: string | null;
    language?: string | null;
    isAnime: boolean;
    indexedAt: string;
    scrapedAt?: string | null;
    scrapedTimes: number;
    failedScrapeAttempts: number;
    createdAt: string;
    updatedAt?: string | null;
    activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
    streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
    blacklistedStreams: Array<{
        __typename?: 'BlacklistedStream';
        plugin: string;
        provider?: string | null;
        stream: { __typename?: 'Stream'; infoHash: string };
    }>;
};

type MediaItemDetail_Show_Fragment = {
    __typename?: 'Show';
    id: string;
    type: string;
    title: string;
    fullTitle: string;
    imdbId?: string | null;
    posterPath?: string | null;
    state: MediaItemState;
    releaseDate?: string | null;
    year?: number | null;
    genres?: Array<string> | null;
    rating?: number | null;
    network?: string | null;
    country?: string | null;
    language?: string | null;
    isAnime: boolean;
    indexedAt: string;
    scrapedAt?: string | null;
    scrapedTimes: number;
    failedScrapeAttempts: number;
    createdAt: string;
    updatedAt?: string | null;
    activeStream?: { __typename?: 'Stream'; infoHash: string } | null;
    streams: Array<{ __typename?: 'Stream'; infoHash: string }>;
    blacklistedStreams: Array<{
        __typename?: 'BlacklistedStream';
        plugin: string;
        provider?: string | null;
        stream: { __typename?: 'Stream'; infoHash: string };
    }>;
};

export type MediaItemDetailFragment =
    | MediaItemDetail_Episode_Fragment
    | MediaItemDetail_Movie_Fragment
    | MediaItemDetail_Season_Fragment
    | MediaItemDetail_Show_Fragment;

export type FileEntryFragment = {
    __typename?: 'FileSystemEntry';
    id: string;
    type: string;
    fileSize: number;
    createdAt: string;
    updatedAt?: string | null;
};

export type ResetMediaItemMutationVariables = Exact<{
    id: Scalars['ID']['input'];
}>;

export type ResetMediaItemMutation = {
    __typename?: 'Mutation';
    resetMediaItem: Array<
        | { __typename?: 'Episode'; id: string; state: MediaItemState }
        | { __typename?: 'Movie'; id: string; state: MediaItemState }
        | { __typename?: 'Season'; id: string; state: MediaItemState }
        | { __typename?: 'Show'; id: string; state: MediaItemState }
    >;
};

export type SaveStreamUrlMutationVariables = Exact<{
    id: Scalars['ID']['input'];
    url: Scalars['String']['input'];
}>;

export type SaveStreamUrlMutation = {
    __typename?: 'Mutation';
    saveStreamUrl: { __typename?: 'MediaEntry'; id: string; streamPermalink?: string | null };
};

export type RequestViaSeerrMutationVariables = Exact<{
    payload: Scalars['JSONObject']['input'];
}>;

export type RequestViaSeerrMutation = { __typename?: 'Mutation'; seerrHandleWebhook: boolean };

export type SettingsQueryVariables = Exact<{ [key: string]: never }>;

export type SettingsQuery = {
    __typename?: 'Query';
    settings: {
        __typename?: 'Settings';
        riven: { __typename?: 'RivenSettings'; version: string; logLevel: LogLevel };
    };
};

export type ShareLogsMutationVariables = Exact<{ [key: string]: never }>;

export type ShareLogsMutation = { __typename?: 'Mutation'; shareLogs: string };

export type VfsDirQueryVariables = Exact<{
    path: Scalars['String']['input'];
}>;

export type VfsDirQuery = { __typename?: 'Query'; vfsDirectoryEntryPaths: Array<string> };

export type VfsStatQueryVariables = Exact<{
    path: Scalars['String']['input'];
}>;

export type VfsStatQuery = {
    __typename?: 'Query';
    vfsEntryStat: {
        __typename?: 'VfsEntryStat';
        mtime: string;
        ctime: string;
        atime: string;
        mode: number;
        nlink: number;
        size: number;
    };
};

export type VfsEntryQueryVariables = Exact<{
    path: Scalars['String']['input'];
}>;

export type VfsEntryQuery = {
    __typename?: 'Query';
    vfsEntry?:
        | {
              __typename: 'MediaEntry';
              id: string;
              type: string;
              originalFilename: string;
              fileSize: number;
              createdAt: string;
              updatedAt?: string | null;
              plugin: string;
              provider?: string | null;
              streamPermalink?: string | null;
          }
        | { __typename: 'SubtitleEntry'; id: string; language: string; fileSize: number }
        | null;
};

export class TypedDocumentString<TResult, TVariables>
    extends String
    implements DocumentTypeDecoration<TResult, TVariables>
{
    __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
    private value: string;
    public __meta__?: Record<string, any> | undefined;

    constructor(value: string, __meta__?: Record<string, any> | undefined) {
        super(value);
        this.value = value;
        this.__meta__ = __meta__;
    }

    override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
        return this.value;
    }
}
export const MediaItemDetailFragmentDoc = new TypedDocumentString(
    `
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
    `,
    { fragmentName: 'MediaItemDetail' }
) as unknown as TypedDocumentString<MediaItemDetailFragment, unknown>;
export const FileEntryFragmentDoc = new TypedDocumentString(
    `
    fragment FileEntry on FileSystemEntry {
  id
  type
  fileSize
  createdAt
  updatedAt
}
    `,
    { fragmentName: 'FileEntry' }
) as unknown as TypedDocumentString<FileEntryFragment, unknown>;
export const LibraryItemsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<LibraryItemsQuery, LibraryItemsQueryVariables>;
export const MediaItemByIdDocument = new TypedDocumentString(`
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
fragment FileEntry on FileSystemEntry {
  id
  type
  fileSize
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<MediaItemByIdQuery, MediaItemByIdQueryVariables>;
export const ResetMediaItemDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<ResetMediaItemMutation, ResetMediaItemMutationVariables>;
export const SaveStreamUrlDocument = new TypedDocumentString(`
    mutation SaveStreamUrl($id: ID!, $url: String!) {
  saveStreamUrl(id: $id, url: $url) {
    id
    streamPermalink
  }
}
    `) as unknown as TypedDocumentString<SaveStreamUrlMutation, SaveStreamUrlMutationVariables>;
export const RequestViaSeerrDocument = new TypedDocumentString(`
    mutation RequestViaSeerr($payload: JSONObject!) {
  seerrHandleWebhook(input: {payload: $payload})
}
    `) as unknown as TypedDocumentString<RequestViaSeerrMutation, RequestViaSeerrMutationVariables>;
export const SettingsDocument = new TypedDocumentString(`
    query Settings {
  settings {
    riven {
      version
      logLevel
    }
  }
}
    `) as unknown as TypedDocumentString<SettingsQuery, SettingsQueryVariables>;
export const ShareLogsDocument = new TypedDocumentString(`
    mutation ShareLogs {
  shareLogs
}
    `) as unknown as TypedDocumentString<ShareLogsMutation, ShareLogsMutationVariables>;
export const VfsDirDocument = new TypedDocumentString(`
    query VfsDir($path: String!) {
  vfsDirectoryEntryPaths(path: $path)
}
    `) as unknown as TypedDocumentString<VfsDirQuery, VfsDirQueryVariables>;
export const VfsStatDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<VfsStatQuery, VfsStatQueryVariables>;
export const VfsEntryDocument = new TypedDocumentString(`
    query VfsEntry($path: String!) {
  vfsEntry(path: $path) {
    __typename
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
    `) as unknown as TypedDocumentString<VfsEntryQuery, VfsEntryQueryVariables>;
