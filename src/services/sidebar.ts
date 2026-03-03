import vscode from 'vscode';
import { LoadConfigCommand } from '../commands/loadConfig';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { UnloadConfigCommand } from '../commands/unloadConfig';
import { loadSnippetConfig } from '../logics/parser';
import { randomUUID, UUID } from 'crypto';
import { ForceSyncCommand } from '../commands/forceSync';
import { ReloadConfigCommand } from '../commands/reloadConfig';
import { previewSchema, PreviewVirtualFileSystemProvider } from '../logics/preview';

export function updateDataProviderOnCommand(context: vscode.ExtensionContext) {
    LoadConfigCommand.addCallback(async (file: vscode.Uri) => {
        try {
            const data = await loadSnippetConfig(file);
            const item = new SnippetConfigItem(context, randomUUID(), data);
            loadedConfigsDataProvider.save(context, item);
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    });
    UnloadConfigCommand.addCallback((id: UUID) => {
        loadedConfigsDataProvider.delete(context, id);
    });
    ForceSyncCommand.addCallback(() => {
        loadedConfigsDataProvider.sync(context);
    });
    const provider = new PreviewVirtualFileSystemProvider(context);
    provider.register(context);
    ReloadConfigCommand.addCallback(async (id: UUID, file: vscode.Uri) => {
        try {
            const data = await loadSnippetConfig(file);
            const item = new SnippetConfigItem(context, id, data);
            loadedConfigsDataProvider.save(context, item);
            provider.refresh(item.resourceUri);
        } catch (err) {
            vscode.window.showErrorMessage((err as Error).message);
        }
    });
}
