import * as vscode from 'vscode';
import { initCommands } from './commands';
import { updateDataProviderOnCommand } from './services/sidebar';
import { mountSnippetConfigs, registerBuiltInSnippets } from './services/snippets';
import { initViews } from './views';
import { syncDataCrossDevice } from './services/storage';

export async function activate(context: vscode.ExtensionContext) {
    initCommands(context);
    initViews();
    updateDataProviderOnCommand(context);
    await mountSnippetConfigs(context);
    registerBuiltInSnippets(context);
    syncDataCrossDevice(context);
}
