export const enum CommandID {
    LoadConfig = 'load-config',
    UnloadConfig = 'unload-config',
    ReloadConfig = 'reload-config',
    ForceSync = 'force-sync',
    ImportConfig = 'import-config'
}

export const enum ViewID {
    LoadedConfigs = 'loaded-configs'
}

export const enum FileExtNames {
    SnippetConfig = 'snippet.xml',
    CodeSnippetsWithScope = 'code-snippets',
    CodeSnippetsForLanguage = 'json'
}
