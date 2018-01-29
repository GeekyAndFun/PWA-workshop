import { setupUI, displayAuthor, paintCachedMessages } from './scripts/ui.js';
import { setupServiceWorker } from './scripts/app.js';
import { getCachedMsgs } from './scripts/messaging-model.js';

const indexedDbStoreConfigs = Object.keys(AppConfig.dbConfigs).map(key => AppConfig.dbConfigs[key]);
IndexedDb.setupDbStores(AppConfig.dbName, AppConfig.dbVersion, indexedDbStoreConfigs).then(() => {
    getCachedMsgs().then((resp) => {
        paintCachedMessages(resp);
    });
    displayAuthor();
    setupUI();
});

setupServiceWorker();
