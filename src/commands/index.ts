import vscode from 'vscode';
import forceSync from './forceSync';
import loadConfig from './loadConfig';
import unloadConfig from './unloadConfig';
import reloadConfig from './reloadConfig';
import importConfig from './importConfig';

export default {
    init(context: vscode.ExtensionContext) {
        [loadConfig, unloadConfig, forceSync, reloadConfig, importConfig].forEach(cmd =>
            cmd.register(context)
        );
    }
};
