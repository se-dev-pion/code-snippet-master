import { UUID } from 'crypto';
import { CommandID } from '../common/enums';
import { SnippetConfigItem } from '../logics/config';
import { Command } from './common/interfaces';
import { CommandTemplate } from './common/templates';

export class UnloadConfigCommand extends CommandTemplate {
    private static _command = new UnloadConfigCommand();
    public static get instance(): Command {
        return UnloadConfigCommand._command;
    }
    override id = CommandID.UnloadConfig;
    override call(item: SnippetConfigItem) {
        UnloadConfigCommand._callbacks.forEach(f => f(item.id));
    }
    private static _callbacks = new Array<(id: UUID) => Promise<boolean>>();
    public static addCallback(f: (id: UUID) => Promise<boolean>) {
        UnloadConfigCommand._callbacks.push(f);
    }
}
