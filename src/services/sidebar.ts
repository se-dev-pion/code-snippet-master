import vscode from 'vscode';
import { LoadConfigCommand } from '../commands/loadConfig';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { UnloadConfigCommand } from '../commands/unloadConfig';
import { loadSnippetConfig } from '../logics/parser';
import { randomUUID, UUID } from 'crypto';
import { ForceSyncCommand } from '../commands/forceSync';

export function updateDataProviderOnCommand(context: vscode.ExtensionContext) {
    LoadConfigCommand.addCallback(async (file: vscode.Uri) => {
        try {
            const data = await loadSnippetConfig(file);
            const item = new SnippetConfigItem(context, randomUUID(), data);
            loadedConfigsDataProvider.add(context, item);
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
}
