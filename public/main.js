import { setupUI, displayAuthor } from './scripts/ui.js';
import { setupServiceWorker } from './scripts/app.js';

const indexedDbStoreConfigs = Object.keys(appConfig.dbConfigs).map(key => appConfig.dbConfigs[key]);

setupUI();
setupServiceWorker();
IndexedDb.setupDbStores('GeekyDatabase', 1, indexedDbStoreConfigs).then(() => {
    displayAuthor();
});

// toggleLoadingOfMessages();
// setupMessages();
// toggleLoadingOfMessages();
