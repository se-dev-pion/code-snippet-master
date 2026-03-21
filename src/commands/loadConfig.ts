import vscode from 'vscode';
import { CommandID, FileExtNames } from '../common/enums';
import { Command } from './common/templates';
import { loadSnippetConfig } from '../logics/parser';
import { loadedConfigsDataProvider, SnippetConfigItem } from '../logics/config';
import { randomUUID } from 'crypto';

export default {
    register(context: vscode.ExtensionContext) {
        return new Command(context, CommandID.LoadConfig, async () => {
            const file = (
                await vscode.window.showOpenDialog({
                    title: 'Choose a snippet config file',
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        'Snippet Configs': [FileExtNames.SnippetConfig]
                    }
                })
            )?.at(0);
            if (!file) {
                return;
            }
            const data = await loadSnippetConfig(file);
            const item = new SnippetConfigItem(context, randomUUID(), data);
            loadedConfigsDataProvider.save(context, item);
        });
    }
};
