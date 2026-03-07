import vscode from 'vscode';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { ZodType } from 'zod';

export const cdataPropName = '#cdata';

export const xmlParser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName,
    attributeValueProcessor(name, value, _jPath) {
        return name === 'placeholder' ? eval(value) : value;
    }
});

export const xmlBuilder = new XMLBuilder({
    format: true,
    indentBy: '  ',
    ignoreAttributes: false,
    cdataPropName,
    attributeValueProcessor(name, value) {
        return name === 'placeholder' ? Boolean(value) : value;
    }
});

interface Deserializer {
    parse(text: string | Uint8Array): unknown;
}

export function parseWithSchema<D extends Deserializer, S extends ZodType>(
    content: string | Uint8Array,
    deserializer: D,
    schema: S
) {
    const result = deserializer.parse(content);
    return schema.parse(result);
}

interface Serializer {
    build(obj: unknown): string;
}

export function serialize<D, S extends Serializer>(data: D, serializer: S) {
    return serializer.build(data);
}

export function configKey(context: vscode.ExtensionContext) {
    return context.extension.id.split('.')[1];
}
