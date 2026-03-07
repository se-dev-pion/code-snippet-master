import vscode from 'vscode';
import { CommandID } from '../common/enums';
import { Command } from './common/templates';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { loadSnippetConfig } from '../logics/parser';
import { PreviewVirtualFileSystemProvider } from '../logics/preview';

export default {
    register(context: vscode.ExtensionContext) {
        const previewProvider = new PreviewVirtualFileSystemProvider(context);
        previewProvider.register(context);
        return new Command(context, CommandID.ReloadConfig, async (item: SnippetConfigItem) => {
            const file = (
                await vscode.window.showOpenDialog({
                    title: 'Choose a snippet config file',
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        'Snippet Configs': ['snippet.xml']
                    }
                })
            )?.at(0);
            if (!file) {
                return;
            }
            try {
                const data = await loadSnippetConfig(file);
                loadedConfigsDataProvider.save(
                    context,
                    new SnippetConfigItem(context, item.id, data)
                );
                previewProvider.refresh(item.resourceUri);
            } catch (err) {
                vscode.window.showErrorMessage((err as Error).message);
            }
        });
    }
};
