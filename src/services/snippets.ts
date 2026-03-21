import vscode from 'vscode';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { buildCompletionItem } from '../logics/snippets';
import { Result } from 'neverthrow';

function buildGlobPattern(pattern: string): vscode.DocumentFilter {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        pattern = vscode.Uri.joinPath(workspaceFolder.uri, pattern).fsPath;
    }
    return { pattern };
}

export async function mountSnippetConfigs(context: vscode.ExtensionContext) {
    const provider: vscode.CompletionItemProvider = {
        async provideCompletionItems(document, _position, _token, _context) {
            const snippets = new Array<vscode.CompletionItem>();
            const f = (item: SnippetConfigItem) => {
                const rawItem = item.data?.root.item ?? [];
                const items = rawItem instanceof Array ? rawItem : [rawItem];
                const snippets = new Array<vscode.CompletionItem>();
                for (const config of items) {
                    if (
                        (config.exclude &&
                            vscode.languages.match(
                                [config.exclude].flat().map(buildGlobPattern),
                                document
                            )) ||
                        (config.include &&
                            !vscode.languages.match(
                                [config.include].flat().map(buildGlobPattern),
                                document
                            ))
                    ) {
                        continue;
                    }
                    const snippet = buildCompletionItem(config, document.languageId);
                    if (snippet) {
                        snippets.push(snippet);
                    }
                }
                return snippets;
            };
            loadedConfigsDataProvider.getChildren().forEach(item => {
                const result = Result.fromThrowable(f, e => e as Error)(item);
                result.match(
                    arr => snippets.push(...arr),
                    err => console.log(err.message)
                );
            });
            return snippets;
        }
    };
    const languages = await vscode.languages.getLanguages();
    const selectors = languages.map(language => ({
        scheme: 'file',
        language
    }));
    const disposable = vscode.languages.registerCompletionItemProvider(selectors, provider);
    context.subscriptions.push(disposable);
}

enum PlaceHolders {
    Title = '${1:<!-- title for auto completion -->}',
    Prefix = '${2:<!-- prefix for auto completion -->}',
    Scope = '${3:<!-- languageId -->}',
    Description = '${4:<!-- description -->}',
    Body = '${5:<!-- snippet content -->}',
    Patterns = '${6:<!-- "include" or "exclude" patterns for providing auto completion -->}',
    Name = '${1:<!-- config name -->}',
    Items = '${2:<!-- snippet items -->}'
}

const snippetConfigItemSnippet = /*xml*/ `<item>
  <title>${PlaceHolders.Title}</title>
  <prefix>${PlaceHolders.Prefix}</prefix>
  <description>${PlaceHolders.Description}</description>
  <body scope="${PlaceHolders.Scope}"><![CDATA[
    ${PlaceHolders.Body}
  ]]></body>
  ${PlaceHolders.Patterns}
</item>`;

const snippetConfigFileTemplate = /*xml*/ `<root>
  <name>${PlaceHolders.Name}</name>
  ${PlaceHolders.Items}
</root>`;

const builtInSnippets = [
    {
        label: 'item',
        insertText: snippetConfigItemSnippet,
        detail: 'Add a snippet config item',
        kind: vscode.CompletionItemKind.Snippet
    },
    {
        label: 'init',
        insertText: snippetConfigFileTemplate,
        detail: 'Init the snippet config file',
        kind: vscode.CompletionItemKind.File
    },
    {
        label: 'placeholder',
        insertText: '/*\$$1*/',
        detail: 'Insert a TextMate placeholder wrapped with "/* */"',
        kind: vscode.CompletionItemKind.Variable
    },
    {
        label: 'exclude',
        insertText: /*xml*/ `<exclude>$1</exclude>`,
        detail: 'Insert a pattern excluded for auto completion',
        kind: vscode.CompletionItemKind.Snippet
    },
    {
        label: 'include',
        insertText: /*xml*/ `<include>$1</include>`,
        detail: 'Insert a pattern included for auto completion',
        kind: vscode.CompletionItemKind.Snippet
    }
];

export function registerBuiltInSnippets(context: vscode.ExtensionContext) {
    const provider: vscode.CompletionItemProvider = {
        provideCompletionItems(_document, _position, _token, _context) {
            return builtInSnippets.map(snippet => {
                const { label, insertText, detail, kind } = snippet;
                const item = new vscode.CompletionItem(label, kind);
                item.insertText = new vscode.SnippetString(insertText);
                item.detail = detail;
                return item;
            });
        }
    };
    const disposable = vscode.languages.registerCompletionItemProvider('snippet', provider);
    context.subscriptions.push(disposable);
}
