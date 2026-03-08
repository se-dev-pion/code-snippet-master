import z from 'zod';
import { cdataPropName } from '../common/utils';

const patternSchema = z.string().min(1);

const snippetConfigItemSchema = z.object({
    prefix: z.string(),
    description: z.string(),
    body: z.object({
        '@_scope': z.string(),
        '@_placeholder': z.boolean().optional(),
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
