import { displayAuthor } from './scripts/ui.js';
import { setupServiceWorker } from './scripts/app.js';
import { dispatchGetCachedMsgs, dispatchGetServerMsgs } from './scripts/messaging-controller.js';


const indexedDbStoreConfigs = Object.keys(AppConfig.dbConfigs).map(key => AppConfig.dbConfigs[key]);
IndexedDb.setupDbStores(AppConfig.dbName, AppConfig.dbVersion, indexedDbStoreConfigs).then(() => {
    dispatchGetCachedMsgs();
    displayAuthor();
});
dispatchGetServerMsgs(true);
setupServiceWorker();
