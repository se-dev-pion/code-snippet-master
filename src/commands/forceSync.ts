import { CommandID } from '../common/enums';
import { Command } from './common/interfaces';
import { CommandTemplate } from './common/templates';

export class ForceSyncCommand extends CommandTemplate {
    private static _command = new ForceSyncCommand();
    public static get instance(): Command {
        return ForceSyncCommand._command;
    }
    override id = CommandID.ForceSync;
    override async call() {
        ForceSyncCommand._callbacks.forEach(f => f());
    }
    public static _callbacks = new Array<() => void>();

    public static addCallback(f: () => void) {
        ForceSyncCommand._callbacks.push(f);
    }
}
