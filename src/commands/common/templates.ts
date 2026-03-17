import vscode from 'vscode';
import { CommandID } from '../../common/enums';
import { configKey } from '../../common/utils';
import { Result } from 'neverthrow';

export class Command {
    public constructor(
        private readonly context: vscode.ExtensionContext,
        public readonly id: CommandID,
        callback: (...args: any[]) => any
    ) {
        const disposable = vscode.commands.registerCommand(this.fullID, (...args: any[]) => {
            const result = Result.fromThrowable(callback, err => err as Error)(...args);
            result.match(
                () => {},
                err => vscode.window.showErrorMessage(err.message)
            );
        });
        this.context.subscriptions.push(disposable);
    }
    private get fullID() {
        return `${configKey(this.context)}.${this.id}`;
    }
    public uriWithArgs(...args: any[]) {
        return `command:${this.fullID}?${encodeURIComponent(JSON.stringify(args))}`;
    }
}
