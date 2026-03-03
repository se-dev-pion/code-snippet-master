import vscode from 'vscode';
import { SnippetConfigItem } from './schema';
import { cdataPropName } from '../common/utils';

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
    snippet.insertText = config.body['@_placeholder'] ? new vscode.SnippetString(text) : text;
    snippet.detail = config.description;
    return snippet;
}
