import z from 'zod';
import { cdataPropName } from '../common/utils';
import { FileExtNames } from '../common/enums';

const patternSchema = z.string().min(1);

const snippetConfigItemSchema = z.object({
    prefix: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    body: z.object({
        '@_scope': z.string(),
        [cdataPropName]: z.string()
    }),
    include: z.union([patternSchema, z.array(patternSchema)]).optional(),
    exclude: z.union([patternSchema, z.array(patternSchema)]).optional()
});

export type SnippetConfigItem = z.infer<typeof snippetConfigItemSchema>;

export const snippetConfigSchema = z.object({
    root: z.object({
        name: z.string(),
        item: z.union([snippetConfigItemSchema, z.array(snippetConfigItemSchema)]).optional()
    })
});

export type SnippetConfig = z.infer<typeof snippetConfigSchema>;

const codeSnippetsSchemaValueShape = {
    prefix: z.string(),
    description: z.string().default(''),
    body: z.union([z.string(), z.array(z.string())]),
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional()
};

const codeSnippetsSchemaForLanguage = z.record(z.string(), z.object(codeSnippetsSchemaValueShape));

const codeSnippetsSchemaWithScope = z.record(
    z.string(),
    z.object({
        ...codeSnippetsSchemaValueShape,
        scope: z.string()
    })
);

export type CodeSnippets = z.infer<typeof codeSnippetsSchemaWithScope>;

export const codeSnippetsSchema = {
    [FileExtNames.CodeSnippetsForLanguage]: codeSnippetsSchemaForLanguage,
    [FileExtNames.CodeSnippetsWithScope]: codeSnippetsSchemaWithScope
} as unknown as Record<string, typeof codeSnippetsSchemaWithScope>;
