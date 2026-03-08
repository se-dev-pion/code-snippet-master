import vscode from 'vscode';
import { loadedConfigsDataProvider } from '../logics/config';
import { buildCompletionItem } from '../logics/snippets';

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
            for (const item of loadedConfigsDataProvider.getChildren()) {
                try {
                    const rawItem = item.data?.root.item ?? [];
                    const items = rawItem instanceof Array ? rawItem : [rawItem];
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
                } catch (err) {
                    console.log((err as Error).message);
                }
            }
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
    Prefix = '${1:<!-- prefix for auto completion -->}',
    Scope = '${2:<!-- languageId -->}',
    Description = '${3:<!-- description -->}',
    Body = '${4:<!-- snippet content -->}',
    Name = '${1:<!-- config name -->}',
    Items = '${2:<!-- snippet items -->}'
}

const snippetConfigItemSnippet = /*xml*/ `<item>
  <prefix>${PlaceHolders.Prefix}</prefix>
  <description>${PlaceHolders.Description}</description>
  <body scope="${PlaceHolders.Scope}"><![CDATA[
    ${PlaceHolders.Body}
  ]]></body>
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
