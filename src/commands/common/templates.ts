import vscode from 'vscode';
import { CommandID } from '../../common/enums';
import { configKey } from '../../common/utils';

export class Command {
    public constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly id: CommandID,
        callback: (...args: any[]) => any
    ) {
        const disposable = vscode.commands.registerCommand(this.fullID, callback);
        this.context.subscriptions.push(disposable);
    }
    private get fullID() {
        return `${configKey(this.context)}.${this.id}`;
    }
    public uriWithArgs(...args: any[]) {
        return `command:${this.fullID}?${encodeURIComponent(JSON.stringify(args))}`;
    }
}
