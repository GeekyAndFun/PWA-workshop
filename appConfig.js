const AppConfig = {
    dbName: 'GeekyDatabase',
    dbVersion: 1,
    dbConfigs: {
        userConfig: { name: 'AuthorStore' },
        messagesConfig: { name: 'CachedMsg', config: { keyPath: 'timestamp' } },
    },
    BACKGROUND_SYNC: 'BACKGROUND_SYNC'
};
