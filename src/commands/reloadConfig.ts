import vscode from 'vscode';
import { CommandID } from '../common/enums';
import { Command } from './common/interfaces';
import { CommandTemplate } from './common/templates';
import { SnippetConfigItem } from '../logics/config';
import { UUID } from 'crypto';

export class ReloadConfigCommand extends CommandTemplate {
    private static _command = new ReloadConfigCommand();
    public static get instance(): Command {
        return ReloadConfigCommand._command;
    }
    override id = CommandID.ReloadConfig;
    override async call(item: SnippetConfigItem) {
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
        if (file) {
            await Promise.all(ReloadConfigCommand._callbacks.map(f => f(item.id, file)));
        }
    }
    public static _callbacks = new Array<(id: UUID, file: vscode.Uri) => Promise<void>>();
    public static addCallback(f: (id: UUID, file: vscode.Uri) => Promise<void>) {
        ReloadConfigCommand._callbacks.push(f);
    }
}
