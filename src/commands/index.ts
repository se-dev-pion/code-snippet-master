import vscode from 'vscode';
import forceSync from './forceSync';
import loadConfig from './loadConfig';
import unloadConfig from './unloadConfig';
import reloadConfig from './reloadConfig';

export default {
    init(context: vscode.ExtensionContext) {
        [loadConfig, unloadConfig, forceSync, reloadConfig].forEach(cmd => cmd.register(context));
    }
};
