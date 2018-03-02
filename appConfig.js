const AppConfig = {
    dbName: 'GeekyDatabase',
    dbVersion: 1,
    dbConfigs: {
        userConfig: {
            name: 'AuthorStore'
        },
        messagesConfig: {
            name: 'CachedMsg',
            config: {
                keyPath: 'timestamp'
            }
        },
    },
    BACKGROUND_SYNC: 'BACKGROUND_SYNC',
    FIREBASE_CONFIG: {
        apiKey: 'AIzaSyA6NrtU7Y-wcLH3UQnWDYNtRQvxWwYHTb4',
        authDomain: 'geek-alert.firebaseapp.com',
        databaseURL: 'https://geek-alert.firebaseio.com',
        projectId: 'geek-alert',
        storageBucket: '',
        messagingSenderId: '1044469279944'
    }
};
