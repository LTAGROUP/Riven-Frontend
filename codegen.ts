import type { CodegenConfig } from '@graphql-codegen/cli';

export default {
    schema: 'schema/schema.graphql',
    documents: ['src/lib/graphql/operations/**/*.ts'],
    ignoreNoDocuments: true,
    generates: {
        'src/lib/graphql/generated/': {
            preset: 'client',
            presetConfig: {
                fragmentMasking: false
            },
            config: {
                documentMode: 'string',
                useTypeImports: true,
                enumsAsTypes: true,
                skipTypename: false,
                scalars: {
                    ID: 'string',
                    BigInt: 'number',
                    DateTimeISO: 'string',
                    JSONObject: 'Record<string, unknown>'
                }
            }
        }
    }
} satisfies CodegenConfig;
