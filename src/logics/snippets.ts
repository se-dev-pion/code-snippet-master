import vscode from 'vscode';
import { SnippetConfigItem } from './schema';
import { cdataPropName } from '../common/utils';

const placeholderMatch = /\/\*(\$.*?)\*\//g;

export function buildCompletionItem(config: SnippetConfigItem, language: string) {
    if (![language, '*'].includes(config.body['@_scope'])) {
        return;
    }
    const snippet = new vscode.CompletionItem(config.prefix, vscode.CompletionItemKind.Snippet);
    const rawText = config.body[cdataPropName].trimEnd().split('\n');
    while (rawText.length > 0 && !rawText[0]) {
        rawText.shift();
    }
    if (rawText.length === 0) {
        return;
    }
    const firstLine = rawText[0];
    const leadSpace = firstLine.length - firstLine.trimStart().length;
    const text = rawText
        .map(line => {
            const a = line.trimStart();
            const b = line.slice(leadSpace);
            return a.length >= b.length ? a : b;
        })
        .join('\n');
    snippet.insertText = new vscode.SnippetString(
        config.body['@_placeholder']
            ? text
            : text.replaceAll(/(?<!\/\*)\$.*?(?!\*\/)/g, '\\$&').replaceAll(placeholderMatch, '$1')
    );
    snippet.detail = config.description;
    return snippet;
}

export function extractPlaceholderAreas(document: vscode.TextDocument) {
    if (document.languageId !== 'snippet') {
        return [];
    }
    const ranges = new Array<vscode.Range>();
    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
        const line = document.lineAt(lineNumber);
        const placeholders = line.text.matchAll(placeholderMatch);
        for (const placeholder of placeholders) {
            const start = placeholder.index;
            const end = start + placeholder[0].length;
            const range = new vscode.Range(lineNumber, start, lineNumber, end);
            ranges.push(range);
        }
    }
    return ranges;
}
