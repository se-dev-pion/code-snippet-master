import vscode from 'vscode';
import { Command } from './common/templates';
import { CommandID, FileExtNames } from '../common/enums';
import { loadNativeSnippet } from '../logics/parser';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { randomUUID } from 'crypto';
import { cdataPropName } from '../common/utils';
import { CodeSnippets, SnippetConfig } from '../logics/schema';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(context, CommandID.ImportConfig, async () => {
            const file = (
                await vscode.window.showOpenDialog({
                    title: 'Choose a code snippet file',
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        Snippets: [
                            FileExtNames.CodeSnippetsForLanguage,
                            FileExtNames.CodeSnippetsWithScope
                        ]
                    }
                })
            )?.at(0);
            if (!file) {
                return;
            }
            const [name, rawData] = await loadNativeSnippet(file);
            const data = convertCodeSnippetsToSnippetConfig(name, rawData);
            const item = new SnippetConfigItem(context, randomUUID(), data);
            loadedConfigsDataProvider.save(context, item);
        });
    }
};

function convertCodeSnippetsToSnippetConfig(name: string, data: CodeSnippets): SnippetConfig {
    return {
        root: {
            name,
            item: Object.entries(data).map(([title, value]) => {
                const { prefix, description, body, scope, include, exclude } = value;
                const indent = ' '.repeat(4);
                const contents = (typeof body === 'string' ? [body] : body).map(
                    line =>
                        indent + line.replaceAll(/(?<!\\)(?:\\\\)*(\$(\{.*\}|[0-9]+))/g, '/*$&*/')
                );
                contents.push('');
                contents.unshift('');
                return {
                    prefix,
                    title,
                    description,
                    body: {
                        '@_scope': scope,
                        [cdataPropName]: contents.join('\n')
                    },
                    include,
                    exclude
                };
            })
        }
    };
}
